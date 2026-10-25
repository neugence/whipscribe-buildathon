"""
Agent Orchestration API Router.
"""

import json
import asyncio
import logging
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from whipscribe.db import get_db, crud, models
from whipscribe.agent import AgentOrchestrator, CallIntent, RouterResult
from whipscribe.agent.tools.calculate_productivity_and_budget import calculate_task_productivity_and_quote
from whipscribe.api.auth import get_current_user_id
from whipscribe.api.schemas import ProcessAgentRequestSchema
from whipscribe.api.routers.submissions import check_transcription_status

logger = logging.getLogger("callbrief-agent")
router = APIRouter(tags=["agent"])


def ensure_transcript_ready(sub: models.UserSubmission, user_id: str, db: Session, max_wait_sec: int = 45) -> Optional[List[Dict[str, Any]]]:
    """Polls WhipScribe API until transcription job finishes or returns existing transcript_json."""
    if sub.transcript_json:
        return sub.transcript_json

    job_id = sub.transcript_job_id
    if not job_id:
        return None

    import time
    start_time = time.time()
    while time.time() - start_time < max_wait_sec:
        status_info = check_transcription_status(submission_id=sub.id, user_id=user_id, db=db)
        if status_info.get("status") == "completed" and status_info.get("transcript_lines"):
            db.refresh(sub)
            return sub.transcript_json
        elif status_info.get("status") == "failed":
            return None
        time.sleep(1.5)

    return sub.transcript_json


@router.post("/api/submissions/{submission_id}/process-agent")
async def process_agent_call(
    submission_id: str,
    payload: ProcessAgentRequestSchema,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Executes Vertex AI Agent Orchestrator asynchronously on completed transcript and persists call proposal items in database."""
    sub = (
        db.query(models.UserSubmission)
        .filter(models.UserSubmission.id == submission_id, models.UserSubmission.user_id == user_id)
        .first()
    )

    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found or unauthorized")

    if not sub.transcript_json:
        transcript = await asyncio.to_thread(ensure_transcript_ready, sub, user_id, db)
        if not transcript:
            raise HTTPException(status_code=400, detail="Submission transcript not ready or transcription failed")
        db.refresh(sub)

    settings = crud.get_or_create_settings(db, user_id=user_id)
    user_record = db.query(models.User).filter(models.User.id == user_id).first()
    user_name = f"{user_record.first_name or ''} {user_record.last_name or ''}".strip() if user_record else "Freelancer"
    if not user_name:
        user_name = "Freelancer"

    # Return cached call record if already processed and no override requested
    if not payload.override_intent:
        existing_call = db.query(models.Call).filter(models.Call.user_submission_id == sub.id).first()
        if existing_call:
            items = db.query(models.Item).filter(models.Item.call_id == existing_call.id).all()
            reqs = [it for it in items if it.type == "requirement"]
            tasks = [it for it in items if it.type == "task"]
            client_drafts = [it.text for it in items if it.type == "message"]

            task_items = [{"title": t.text, "effort": t.effort or "M"} for t in tasks]
            calc_quote = calculate_task_productivity_and_quote(
                tasks=task_items,
                hourly_rate=settings.hourly_rate,
                currency=settings.currency,
                budget=payload.budget,
            )

            return {
                "status": "success",
                "call_id": existing_call.id,
                "router_result": {
                    "intent": existing_call.detected_intent or "discovery",
                    "confidence": existing_call.confidence or 1.0,
                    "reason": "Retrieved from database",
                    "needs_human_confirmation": False,
                },
                "proposal": {
                    "summary": "Retrieved existing call proposal from database.",
                    "requirements": [{"id": r.id, "category": "requirement", "text": r.text, "time": r.timestamp_link or "00:00"} for r in reqs],
                    "tasks": [{"id": t.id, "title": t.text, "effort": t.effort or "M", "time": t.timestamp_link or "00:00", "estimated_hours": t.effort or 4} for t in tasks],
                    "quote": calc_quote.model_dump(),
                    "client_message_draft": client_drafts[0] if client_drafts else "",
                },
                "saved_items": [{"id": it.id, "type": it.type, "text": it.text, "time": it.timestamp_link} for it in items],
            }

    orchestrator = AgentOrchestrator()
    override = CallIntent(payload.override_intent) if payload.override_intent else None

    # Fetch previous brief history for project or client if provided
    previous_history = crud.get_previous_brief_for_project_or_client(
        db=db,
        user_id=user_id,
        project_id=payload.project_id,
        client_id=payload.client_id,
    )

    # Run Agentic Orchestration asynchronously in worker thread pool without blocking event loop
    result = await asyncio.to_thread(
        orchestrator.process_call,
        transcript_data=sub.transcript_json,
        client_id=payload.client_id,
        hourly_rate=settings.hourly_rate,
        currency=settings.currency,
        budget=payload.budget,
        message_tone=settings.message_tone,
        user_name=user_name,
        previous_brief_summary=previous_history,
        override_intent=override,
    )

    # Persist Call Record in PostgreSQL
    call_record = crud.create_call_record(
        db=db,
        submission_id=sub.id,
        project_id=payload.project_id,
        file_type="call_recording",
        transcript_text="\n".join([f"[{line.get('time', '00:00')}] {line.get('speaker', 'SPEAKER')}: {line.get('text', '')}" for line in sub.transcript_json]),
        transcript_data=sub.transcript_json,
        detected_intent=result.router_result.intent.value,
        confidence=result.router_result.confidence,
    )

    saved_items = []
    if result.proposal:
        # Save extracted requirements
        for req in result.proposal.requirements:
            item = crud.add_item_to_call(
                db=db,
                call_id=call_record.id,
                item_type="requirement",
                text=req.text,
                original_agent_text=req.text,
                timestamp_link=req.time,
            )
            saved_items.append({"id": item.id, "type": item.type, "text": item.text, "time": item.timestamp_link})

        # Save task items
        for task in result.proposal.tasks:
            item = crud.add_item_to_call(
                db=db,
                call_id=call_record.id,
                item_type="task",
                text=task.title,
                original_agent_text=task.title,
                timestamp_link=task.time,
                effort=task.effort,
            )
            saved_items.append({"id": item.id, "type": item.type, "text": item.text, "time": item.timestamp_link, "effort": item.effort})

        # Save client confirmation message draft if available
        if result.proposal.client_message_draft:
            msg_item = crud.add_item_to_call(
                db=db,
                call_id=call_record.id,
                item_type="message",
                text=result.proposal.client_message_draft,
                original_agent_text=result.proposal.client_message_draft,
            )
            saved_items.append({"id": msg_item.id, "type": msg_item.type, "text": msg_item.text, "time": None})

    # Log Agent Run for auditing
    crud.log_agent_run(
        db=db,
        call_id=call_record.id,
        intent=result.router_result.intent.value,
        logs=result.logs,
    )

    return {
        "status": result.status,
        "call_id": call_record.id,
        "router_result": result.router_result.model_dump(),
        "proposal": result.proposal.model_dump() if result.proposal else None,
        "saved_items": saved_items,
    }


@router.post("/api/submissions/{submission_id}/process-agent-stream")
async def process_agent_call_stream(
    submission_id: str,
    payload: ProcessAgentRequestSchema,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Executes Vertex AI Agent Orchestrator with real HTTP Server-Sent Event (SSE) stream logs."""
    sub = (
        db.query(models.UserSubmission)
        .filter(models.UserSubmission.id == submission_id, models.UserSubmission.user_id == user_id)
        .first()
    )

    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found or unauthorized")

    settings = crud.get_or_create_settings(db, user_id=user_id)

    async def event_generator():
        # Step 1: Initializing
        yield f"data: {json.dumps({'type': 'log', 'step': 'init', 'message': 'Initializing Vertex AI Agent Orchestrator & Tool Registry...', 'percent': 10})}\n\n"
        await asyncio.sleep(0.1)

        # Step 1.5: Poll WhipScribe API for transcription completion if not yet ready
        if not sub.transcript_json:
            yield f"data: {json.dumps({'type': 'log', 'step': 'transcribing', 'message': 'WhipScribe API: Transcribing audio file into timestamped speakers & dialogue...', 'percent': 20})}\n\n"

            import time
            start_poll = time.time()
            while time.time() - start_poll < 60:
                status_info = await asyncio.to_thread(check_transcription_status, submission_id, user_id, db)
                if status_info.get("status") == "completed" and status_info.get("transcript_lines"):
                    db.refresh(sub)
                    break
                elif status_info.get("status") == "failed":
                    yield f"data: {json.dumps({'type': 'log', 'step': 'error', 'message': 'WhipScribe transcription failed for this audio file.', 'percent': 100})}\n\n"
                    return
                await asyncio.sleep(1.5)

        if not sub.transcript_json:
            yield f"data: {json.dumps({'type': 'log', 'step': 'error', 'message': 'Submission transcript is not ready yet. Please retry in a few moments.', 'percent': 100})}\n\n"
            return

        # Check existing call record
        if not payload.override_intent:
            existing_call = db.query(models.Call).filter(models.Call.user_submission_id == sub.id).first()
            if existing_call:
                items = db.query(models.Item).filter(models.Item.call_id == existing_call.id).all()
                reqs = [it for it in items if it.type == "requirement"]
                tasks = [it for it in items if it.type == "task"]
                client_drafts = [it.text for it in items if it.type == "message"]
                cached_res = {
                    "status": "success",
                    "call_id": existing_call.id,
                    "router_result": {
                        "intent": existing_call.detected_intent or "discovery",
                        "confidence": existing_call.confidence or 1.0,
                        "reason": "Retrieved from database",
                        "needs_human_confirmation": False,
                    },
                    "proposal": {
                        "summary": "Retrieved existing call proposal from database.",
                        "requirements": [{"id": r.id, "category": "requirement", "text": r.text, "time": r.timestamp_link or "00:00"} for r in reqs],
                        "tasks": [{"id": t.id, "title": t.text, "effort": t.effort or "M", "time": t.timestamp_link or "00:00", "estimated_hours": 4} for t in tasks],
                        "quote": {"total_price": settings.hourly_rate * 10, "total_hours": 10, "hourly_rate": settings.hourly_rate},
                        "client_message_draft": client_drafts[0] if client_drafts else "",
                    },
                    "saved_items": [{"id": it.id, "type": it.type, "text": it.text, "time": it.timestamp_link} for it in items],
                }
                yield f"data: {json.dumps({'type': 'log', 'step': 'db_cache', 'message': 'Retrieved pre-processed proposal from PostgreSQL database cache.', 'percent': 90})}\n\n"
                yield f"data: {json.dumps({'type': 'result', 'step': 'completed', 'message': 'Completed from database cache!', 'percent': 100, 'result': cached_res})}\n\n"
                return

        # Step 2: Tool Execution get_transcript
        tx_lines_count = len(sub.transcript_json) if isinstance(sub.transcript_json, list) else 0
        yield f"data: {json.dumps({'type': 'log', 'step': 'tool_transcript', 'message': f'Tool get_transcript: Formatted {tx_lines_count} transcript lines with timestamps.', 'percent': 25})}\n\n"
        await asyncio.sleep(0.1)

        orchestrator = AgentOrchestrator()
        override = CallIntent(payload.override_intent) if payload.override_intent else None
        transcript_text = "\n".join([f"[{line.get('time', '00:00')}] {line.get('speaker', 'SPEAKER')}: {line.get('text', '')}" for line in sub.transcript_json])

        # Step 3: Intent Classification via RouterAgent
        if override:
            router_result = RouterResult(
                intent=override,
                confidence=1.0,
                reason="User manually selected this intent.",
                needs_human_confirmation=False,
                top_choices=[],
            )
            yield f"data: {json.dumps({'type': 'log', 'step': 'router_agent', 'message': f'User manual override intent selected: {override.value.upper()}', 'percent': 45})}\n\n"
        else:
            yield f"data: {json.dumps({'type': 'log', 'step': 'router_agent', 'message': 'Vertex AI RouterAgent: Analyzing transcript to classify intent & detect call type...', 'percent': 35})}\n\n"
            router_result = await asyncio.to_thread(orchestrator.router.classify, transcript_text)
            yield f"data: {json.dumps({'type': 'log', 'step': 'intent_classified', 'message': f'RouterAgent Classified Intent: {router_result.intent.value.upper()} (Confidence: {router_result.confidence*100:.0f}%)', 'percent': 50})}\n\n"

        # Step 4: Playbook Engine Execution
        selected_intent = router_result.intent
        user_record = db.query(models.User).filter(models.User.id == user_id).first()
        user_name = f"{user_record.first_name or ''} {user_record.last_name or ''}".strip() if user_record else "Freelancer"
        if not user_name:
            user_name = "Freelancer"

        yield f"data: {json.dumps({'type': 'log', 'step': 'playbook_exec', 'message': f'Executing {selected_intent.value.title()}CallPlaybook with Vertex AI Gemini model...', 'percent': 65})}\n\n"

        if selected_intent == CallIntent.DISCOVERY:
            proposal = await asyncio.to_thread(
                orchestrator.playbooks.run_discovery,
                transcript_text,
                hourly_rate=settings.hourly_rate,
                currency=settings.currency,
                message_tone=settings.message_tone,
                user_name=user_name,
            )
        elif selected_intent == CallIntent.INQUIRY:
            proposal = await asyncio.to_thread(
                orchestrator.playbooks.run_inquiry,
                transcript_text,
                hourly_rate=settings.hourly_rate,
                currency=settings.currency,
                message_tone=settings.message_tone,
                user_name=user_name,
            )
        elif selected_intent == CallIntent.CHANGE_REQUEST:
            previous_history = crud.get_previous_brief_for_project_or_client(
                db=db,
                user_id=user_id,
                project_id=payload.project_id,
                client_id=payload.client_id,
            )
            proposal = await asyncio.to_thread(
                orchestrator.playbooks.run_change_request,
                transcript_text,
                previous_brief_summary=previous_history,
                hourly_rate=settings.hourly_rate,
                currency=settings.currency,
                message_tone=settings.message_tone,
                user_name=user_name,
            )
        else:
            proposal = await asyncio.to_thread(orchestrator.playbooks.run_other, transcript_text)

        total_price = proposal.quote.total_price if proposal and proposal.quote else settings.hourly_rate * 10
        yield f"data: {json.dumps({'type': 'log', 'step': 'tool_quote', 'message': f'Tool calculate_quote: Extracted {len(proposal.requirements) if proposal else 0} requirements & {len(proposal.tasks) if proposal else 0} tasks. Total Quote: ${total_price:.2f} ({settings.currency})', 'percent': 80})}\n\n"

        # Step 5: Guardrail Verification
        yield f"data: {json.dumps({'type': 'log', 'step': 'guardrails', 'message': 'GuardrailValidator: Verifying scope boundaries & timestamp references...', 'percent': 90})}\n\n"
        sanitized_proposal = await asyncio.to_thread(orchestrator.validator.sanitize_proposal, proposal, transcript_text)

        # Step 6: Persist in PostgreSQL
        call_record = crud.create_call_record(
            db=db,
            submission_id=sub.id,
            file_type="call_recording",
            transcript_text=transcript_text,
            transcript_data=sub.transcript_json,
            detected_intent=router_result.intent.value,
            confidence=router_result.confidence,
        )

        saved_items = []
        if sanitized_proposal:
            for req in sanitized_proposal.requirements:
                item = crud.add_item_to_call(db=db, call_id=call_record.id, item_type="requirement", text=req.text, original_agent_text=req.text, timestamp_link=req.time)
                saved_items.append({"id": item.id, "type": item.type, "text": item.text, "time": item.timestamp_link})

            for task in sanitized_proposal.tasks:
                item = crud.add_item_to_call(db=db, call_id=call_record.id, item_type="task", text=task.title, original_agent_text=task.title, timestamp_link=task.time, effort=task.effort)
                saved_items.append({"id": item.id, "type": item.type, "text": item.text, "time": item.timestamp_link, "effort": item.effort})

            if sanitized_proposal.client_message_draft:
                msg_item = crud.add_item_to_call(db=db, call_id=call_record.id, item_type="message", text=sanitized_proposal.client_message_draft, original_agent_text=sanitized_proposal.client_message_draft)
                saved_items.append({"id": msg_item.id, "type": msg_item.type, "text": msg_item.text, "time": None})

        crud.log_agent_run(db=db, call_id=call_record.id, intent=router_result.intent.value, logs=[f"Streamed execution for call {call_record.id}"])

        final_data = {
            "status": "completed",
            "call_id": call_record.id,
            "router_result": router_result.model_dump(),
            "proposal": sanitized_proposal.model_dump() if sanitized_proposal else None,
            "saved_items": saved_items,
        }

        yield f"data: {json.dumps({'type': 'result', 'step': 'completed', 'message': 'Agent Orchestration finished successfully!', 'percent': 100, 'result': final_data})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
