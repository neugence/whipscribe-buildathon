"""
User Submissions & Audio Upload Router.
"""

import os
import uuid
import shutil
import logging
import tempfile
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from whipscribe.db import get_db, crud, models
from whipscribe.client import WhipScribeClient
from whipscribe.types import TranscriptFormat, JobStatus
from whipscribe.api.auth import get_current_user_id

logger = logging.getLogger("callbrief-submissions")
router = APIRouter(tags=["submissions"])

UPLOAD_DIR = Path("uploads")


@router.post("/api/upload")
async def upload_audio_file(
    file: UploadFile = File(...),
    source_type: str = Form("audio_file"),
    consent_confirmed: bool = Form(True),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Submits uploaded audio file directly to WhipScribe API for transcription without permanent server storage."""
    if not consent_confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recording consent must be confirmed before uploading audio files.",
        )

    file_id = str(uuid.uuid4())
    suffix = Path(file.filename).suffix if file.filename else ".mp3"

    # Stream to temporary file for WhipScribe API upload
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = Path(tmp.name)
    finally:
        await file.close()

    job_id = None
    whip_status = "transcribing"
    is_dev_mode = (
        os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
        or os.getenv("ALLOW_UNAUTHENTICATED_DEV", "false").lower() in ("true", "1", "yes")
    )

    try:
        client = WhipScribeClient()
        job = client.transcribe.submit_file(str(tmp_path), language="en")
        job_id = job.job_id
        logger.info(f"Submitted file to WhipScribe API: Job ID '{job_id}'")
    except Exception as e:
        if is_dev_mode:
            logger.warning(f"DEBUG MODE ACTIVE: WhipScribe API submission note: {e}. Falling back to simulation mode.")
            job_id = f"job_sim_{file_id[:8]}"
        else:
            logger.error(f"WhipScribe API submission failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"WhipScribe API transcription submission failed: {str(e)}",
            )
    finally:
        # Immediately delete temporary file after sending to WhipScribe API
        if tmp_path.exists():
            try:
                tmp_path.unlink()
            except Exception:
                pass

    # Save UserSubmission in PostgreSQL
    submission = crud.create_user_submission(
        db=db,
        user_id=user_id,
        source_type=source_type,
        source_location=file.filename,
        transcript_job_id=job_id,
    )

    return {
        "status": "success",
        "submission_id": submission.id,
        "transcript_job_id": job_id,
        "whip_status": whip_status,
        "filename": file.filename,
    }


@router.get("/api/submissions/{submission_id}/status")
def check_transcription_status(
    submission_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Polls WhipScribe API for transcription job status and updates database upon completion."""
    sub = (
        db.query(models.UserSubmission)
        .filter(models.UserSubmission.id == submission_id, models.UserSubmission.user_id == user_id)
        .first()
    )

    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found or unauthorized")

    job_id = sub.transcript_job_id
    current_status = sub.status
    transcript_json = sub.transcript_json

    # Poll WhipScribe API if job is still in progress
    if job_id and current_status in ("pending", "transcribing"):
        if job_id.startswith("job_sim_"):
            # Simulation fallback for offline test jobs
            current_status = "completed"
            transcript_json = [
                {"time": "00:15", "speaker": "CLIENT", "text": "We need an e-commerce booking platform for our chain of salons."},
                {"time": "00:45", "speaker": "CLIENT", "text": "It must support Google Calendar sync and deposit payments over Stripe."},
                {"time": "01:20", "speaker": "FREELANCER", "text": "What timeline are you aiming for?"},
                {"time": "01:35", "speaker": "CLIENT", "text": "Within 3 weeks. Budget is around $3,000 to $4,000."},
            ]
            crud.update_submission_status(db, submission_id, status="completed", transcript_json=transcript_json)
        else:
            try:
                whip_client = WhipScribeClient()
                job_status_obj = whip_client.jobs.get(job_id)

                if job_status_obj.status == JobStatus.DONE:
                    tx_obj = whip_client.jobs.get_transcript(job_id, format=TranscriptFormat.JSON)
                    if hasattr(tx_obj, "segments"):
                        formatted_lines = []
                        for seg in tx_obj.segments:
                            start_secs = int(getattr(seg, "start", 0) or 0)
                            m, s = divmod(start_secs, 60)
                            formatted_lines.append({
                                "time": f"{m:02d}:{s:02d}",
                                "speaker": getattr(seg, "speaker", None) or "SPEAKER",
                                "text": getattr(seg, "text", "") or ""
                            })
                        transcript_json = formatted_lines
                    elif isinstance(tx_obj, list):
                        transcript_json = tx_obj
                    else:
                        transcript_json = [{"time": "00:00", "speaker": "SPEAKER", "text": str(tx_obj)}]

                    current_status = "completed"
                    crud.update_submission_status(db, submission_id, status="completed", transcript_json=transcript_json)
                elif job_status_obj.status == JobStatus.FAILED:
                    current_status = "failed"
                    crud.update_submission_status(db, submission_id, status="failed")
                elif job_status_obj.status in (JobStatus.QUEUED, JobStatus.PROCESSING):
                    current_status = "transcribing"
                    crud.update_submission_status(db, submission_id, status="transcribing")

            except Exception as e:
                logger.warning(f"WhipScribe job status check note: {e}")

    return {
        "submission_id": sub.id,
        "status": current_status,
        "transcript_job_id": job_id,
        "has_transcript": transcript_json is not None,
        "transcript_lines": transcript_json if current_status == "completed" else None,
    }


@router.get("/api/submissions/{submission_id}/audio")
def get_submission_audio(
    submission_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Fetches playback audio URL from WhipScribe API or local upload fallback."""
    sub = (
        db.query(models.UserSubmission)
        .filter(models.UserSubmission.id == submission_id, models.UserSubmission.user_id == user_id)
        .first()
    )

    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found or unauthorized")

    job_id = sub.transcript_job_id
    backend_base = os.getenv("BACKEND_PUBLIC_URL", "http://localhost:8000")

    # Check if local audio file actually exists on disk before offering local fallback URL
    local_audio_url = None
    if sub.source_location and not sub.source_location.startswith("/tmp"):
        raw_name = os.path.basename(sub.source_location)
        if (UPLOAD_DIR / raw_name).exists():
            local_audio_url = f"{backend_base}/uploads/{raw_name}"

    # Query WhipScribe API playback URL if real job ID
    if job_id and not job_id.startswith("job_sim_"):
        try:
            whip_client = WhipScribeClient()
            audio_obj = whip_client.jobs.get_audio_url(job_id)
            if audio_obj and hasattr(audio_obj, "url") and audio_obj.url:
                return {
                    "submission_id": sub.id,
                    "audio_url": audio_obj.url,
                    "source": getattr(audio_obj, "storage", "whipscribe"),
                    "expires_in": getattr(audio_obj, "expires_in", 3600),
                    "local_fallback": local_audio_url,
                }
        except Exception as e:
            logger.warning(f"WhipScribe audio URL fetch note: {e}")

    return {
        "submission_id": sub.id,
        "audio_url": local_audio_url,
        "source": "local" if local_audio_url else "none",
        "expires_in": None,
        "local_fallback": local_audio_url,
    }


@router.get("/api/submissions")
def list_user_submissions(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Lists submissions belonging strictly to current authenticated user."""
    subs = (
        db.query(models.UserSubmission)
        .filter(models.UserSubmission.user_id == user_id)
        .order_by(models.UserSubmission.created_at.desc())
        .all()
    )
    result = []
    for s in subs:
        raw_loc = s.source_location or ""
        fname = raw_loc.split("/")[-1]
        if "_" in fname:
            fname = fname.split("_", 1)[-1]
        result.append({
            "id": s.id,
            "source_type": s.source_type,
            "source_location": s.source_location,
            "filename": fname or "recording.mp3",
            "status": s.status,
            "transcript_job_id": s.transcript_job_id,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "has_transcript": s.transcript_json is not None,
            "calls": [c.id for c in s.calls] if s.calls else [],
        })
    return result


@router.delete("/api/submissions/{submission_id}")
def delete_user_submission(
    submission_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Deletes a submission and associated call records/items for current authenticated user."""
    sub = (
        db.query(models.UserSubmission)
        .filter(models.UserSubmission.id == submission_id, models.UserSubmission.user_id == user_id)
        .first()
    )

    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found or unauthorized")

    # Optionally delete saved local audio file
    if sub.source_location:
        raw_name = os.path.basename(sub.source_location)
        local_path = UPLOAD_DIR / raw_name
        if local_path.exists():
            try:
                os.remove(local_path)
            except Exception as e:
                logger.warning(f"Could not remove local file '{local_path}': {e}")

    db.delete(sub)
    db.commit()

    return {"status": "success", "deleted_submission_id": submission_id}
