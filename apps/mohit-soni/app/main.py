import hashlib
from copy import deepcopy
from pathlib import Path

from fastapi import FastAPI, File, Form, Request, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse, PlainTextResponse, RedirectResponse
from fastapi.templating import Jinja2Templates

from app.config import get_settings
from app.exporters import report_to_markdown
from app.qa_engine import build_transcript_review, score_support_call
from app.storage import JobStore
from app.whipscribe_client import WhipScribeClient, WhipScribeError


app = FastAPI(title="Support QA Copilot")
templates = Jinja2Templates(directory=str(Path(__file__).parent / "templates"))

DEMO_JOB_ID = "demo-support-call"
DEMO_TRANSCRIPT = {
    "source": "demo",
    "segments": [
        {
            "speaker": "Agent",
            "start": 0.0,
            "end": 4.2,
            "text": "Hi, thanks for calling Acme Support. I can help with the billing issue today.",
        },
        {
            "speaker": "Customer",
            "start": 4.3,
            "end": 10.1,
            "text": "The upgrade is failing and I can't access the invoice for my team.",
        },
        {
            "speaker": "Agent",
            "start": 10.2,
            "end": 18.4,
            "text": "I understand the upgrade is failing and the invoice is blocked. I will reset the billing sync and send you an email within 24 hours.",
        },
        {
            "speaker": "Agent",
            "start": 18.5,
            "end": 23.0,
            "text": "Does that help, and is there anything else I can check before we close?",
        },
    ],
}

WORKFLOWS = {"support_qa", "generic_review"}


def _render(request: Request, template_name: str, context: dict, status_code: int = 200):
    return templates.TemplateResponse(request, template_name, context, status_code=status_code)


def _store() -> JobStore:
    return JobStore(get_settings().runtime_dir)


def _client() -> WhipScribeClient:
    settings = get_settings()
    return WhipScribeClient(settings.whipscribe_api_key, settings.whipscribe_base_url)


def _clean_workflow(value: str | None) -> str:
    return value if value in WORKFLOWS else "support_qa"


def _safe_filename(filename: str | None) -> str:
    safe_name = Path(filename or "support-call").name
    safe_name = "".join(char if char.isalnum() or char in "._-" else "_" for char in safe_name).strip("._")
    return safe_name[:120] or "support-call"


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return _render(request, "index.html", {})


@app.post("/jobs")
async def create_job(request: Request, file: UploadFile = File(...), workflow: str = Form("support_qa")):
    try:
        client = _client()
    except WhipScribeError as exc:
        return _render(request, "error.html", {"message": str(exc)}, status_code=400)

    settings = get_settings()
    uploads_dir = settings.runtime_dir / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    data = await file.read()
    if not data:
        return _render(request, "error.html", {"message": "Uploaded file is empty."}, status_code=400)

    safe_name = _safe_filename(file.filename)
    file_digest = hashlib.sha256(data).hexdigest()
    upload_path = uploads_dir / f"{file_digest[:16]}-{safe_name}"
    upload_path.write_bytes(data)
    idempotency_key = hashlib.sha256(data + safe_name.encode("utf-8")).hexdigest()

    try:
        payload = client.submit_file(upload_path, idempotency_key)
    except WhipScribeError as exc:
        return _render(request, "error.html", {"message": str(exc)}, status_code=400)

    store = _store()
    store.save(payload["job_id"], "submit", payload)
    store.save(payload["job_id"], "workflow", {"type": _clean_workflow(workflow)})
    try:
        store.save(payload["job_id"], "account", client.get_account())
    except (AttributeError, WhipScribeError):
        pass
    return RedirectResponse(f"/jobs/{payload['job_id']}", status_code=303)


@app.post("/jobs/demo")
def create_demo_job(workflow: str = Form("support_qa")):
    store = _store()
    workflow_type = _clean_workflow(workflow)
    store.save(DEMO_JOB_ID, "status", {"status": "done", "locked": False, "source": "demo"})
    store.save(DEMO_JOB_ID, "transcript", deepcopy(DEMO_TRANSCRIPT))
    store.save(DEMO_JOB_ID, "workflow", {"type": workflow_type})
    if workflow_type == "generic_review":
        store.save(DEMO_JOB_ID, "report", build_transcript_review(DEMO_TRANSCRIPT))
        return RedirectResponse(f"/jobs/{DEMO_JOB_ID}/report", status_code=303)
    return RedirectResponse(f"/jobs/{DEMO_JOB_ID}/speakers", status_code=303)


@app.get("/jobs/{job_id}", response_class=HTMLResponse)
def job_status(request: Request, job_id: str):
    store = _store()
    try:
        status = _client().get_status(job_id)
    except WhipScribeError as exc:
        return _render(request, "error.html", {"message": str(exc)}, status_code=400)

    store.save(job_id, "status", status)
    if status.get("status") == "failed":
        reason = status.get("error") or status.get("message") or "The transcription job failed."
        return _render(
            request,
            "error.html",
            {"message": f"WhipScribe job failed: {reason}"},
            status_code=502,
        )
    if status.get("locked"):
        return _render(
            request,
            "error.html",
            {
                "message": "Transcript is locked. Add credits or unlock the transcript in WhipScribe before fetching the result.",
                "action_url": status.get("unlock_url"),
                "action_label": "Open WhipScribe",
            },
            status_code=402,
        )
    if status.get("status") == "done" and status.get("speech_detected") is False:
        return _render(
            request,
            "error.html",
            {"message": "No usable speech was detected in this recording."},
            status_code=422,
        )
    if status.get("status") == "done" and not status.get("locked"):
        return RedirectResponse(f"/jobs/{job_id}/speakers", status_code=303)

    progress = status.get("progress") or 0
    progress_percent = round(progress if progress > 1 else progress * 100)
    return _render(
        request,
        "status.html",
        {
            "job_id": job_id,
            "status": status,
            "progress_percent": progress_percent,
            "account": store.load(job_id, "account") if store.exists(job_id, "account") else None,
        },
    )


@app.get("/jobs/{job_id}/speakers", response_class=HTMLResponse)
def speakers(request: Request, job_id: str):
    store = _store()
    if store.exists(job_id, "transcript"):
        transcript = store.load(job_id, "transcript")
    else:
        try:
            transcript = _client().get_transcript(job_id)
        except WhipScribeError as exc:
            return _render(request, "error.html", {"message": str(exc)}, status_code=400)
        store.save(job_id, "transcript", transcript)

    workflow = store.load(job_id, "workflow") if store.exists(job_id, "workflow") else {"type": "support_qa"}
    if workflow.get("type") == "generic_review":
        store.save(job_id, "report", build_transcript_review(transcript))
        return RedirectResponse(f"/jobs/{job_id}/report", status_code=303)

    speakers_found = sorted({segment.get("speaker") or "Unknown" for segment in transcript.get("segments", [])})
    if not speakers_found:
        speakers_found = ["Unknown"]
    return _render(
        request,
        "speakers.html",
        {"job_id": job_id, "speakers": speakers_found, "is_demo": transcript.get("source") == "demo"},
    )


@app.post("/jobs/{job_id}/speakers")
def save_speakers(job_id: str, agent: str = Form(...), customer: str = Form("Unknown")):
    _store().save(job_id, "speakers", {"agent": agent, "customer": customer})
    transcript = _store().load(job_id, "transcript")
    workflow = _store().load(job_id, "workflow") if _store().exists(job_id, "workflow") else {"type": "support_qa"}
    report = (
        build_transcript_review(transcript)
        if workflow.get("type") == "generic_review"
        else score_support_call(transcript, {"agent": agent, "customer": customer})
    )
    _store().save(job_id, "report", report)
    return RedirectResponse(f"/jobs/{job_id}/report", status_code=303)


@app.get("/jobs/{job_id}/report", response_class=HTMLResponse)
def report(request: Request, job_id: str):
    store = _store()
    report_payload = store.load(job_id, "report")
    transcript = store.load(job_id, "transcript") if store.exists(job_id, "transcript") else {}
    return _render(
        request,
        "report.html",
        {
            "job_id": job_id,
            "report": report_payload,
            "score_items": report_payload.get("items", {}).values(),
            "customer_pain_points": report_payload.get("customer_pain_points", []),
            "is_demo": transcript.get("source") == "demo",
        },
    )


@app.get("/jobs/{job_id}/audio-url")
def audio_url(job_id: str):
    try:
        return JSONResponse(_client().get_audio_url(job_id))
    except WhipScribeError as exc:
        return JSONResponse({"error": str(exc)}, status_code=400)


@app.get("/jobs/{job_id}/export.md")
def export_markdown(job_id: str):
    report_payload = _store().load(job_id, "report")
    return PlainTextResponse(
        report_to_markdown(job_id, report_payload),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{job_id}-qa-report.md"'},
    )


@app.get("/jobs/{job_id}/export.json")
def export_json(job_id: str):
    return JSONResponse(_store().load(job_id, "report"))
