# Support QA Copilot

Track 4 workflow prototype for WhipScribe.

## Demo Recording

The submission demo can be recorded in about four minutes. In the current local recording, the app is shown in demo mode because paid WhipScribe API access is not available locally.

> Real WhipScribe API key configured ho to same upload flow real transcription use karega; demo mode is only because paid API key unavailable.

Current submission plan:

- Attach the first demo video to the PR now. It shows the complete product workflow using clearly marked demo transcript data.
- Track real API-credit access in issue #30: "Question: How do I receive API credits for testing Track 4 with my own account?"
- After API credits/key access is available, add a second PR update with a real owned-recording upload demo that shows WhipScribe job creation, polling, transcript fetch, speaker confirmation, report generation, and export.
- Until then, this README intentionally separates implemented API integration from real paid-account happy-path verification.

## Problem

The target user is a support lead at a small SaaS company who reviews customer support calls manually. Today they replay calls, scan transcripts if available, and check whether the support agent greeted the customer, confirmed the issue, explained the resolution, gave a timeline, assigned a follow-up owner, and closed the loop. The cost is slow coaching, inconsistent QA, and missed risky promises.

## User Validation Note

For the demo, I used a self-created support-call recording that simulates the review process. Before submitting the PR, I will ask one founder, support lead, or teammate who has handled customer calls to run the flow and will write down what changed because of their feedback.

## Workflow

1. Choose the workflow: **Support QA Call** for customer support reviews, or **General Transcript Insights** for non-support recordings.
2. Upload an owned or self-created recording.
3. The backend sends the file to WhipScribe.
4. The backend polls until transcription is done.
5. For support QA, the user maps detected speakers to support agent and customer.
6. The selected report engine generates either a visible QA rubric or a general transcript intelligence report.
7. The user exports Markdown or JSON for a manager/team lead.

## What Works

- One recording at a time.
- Implemented WhipScribe API upload, status polling, and JSON transcript fetch flow.
- `GET /me` retention lookup after real upload, so the UI can warn how long source audio is retained.
- Locked and failed WhipScribe jobs are handled as actionable states instead of looping forever.
- Backward-compatible demo mode for reviewing the workflow without paid API access.
- Generic transcript fallback for meetings, podcast clips, interviews, or recordings that should not receive a support QA score.
- Speaker confirmation.
- Deterministic QA scorecard.
- Evidence-backed Markdown and JSON export.

## What Does Not Work Yet

- No accounts or shared team workspace.
- No CRM, Slack, Notion, or helpdesk integration.
- No LLM scoring in v1.
- No batch call review.
- Real paid-account happy-path verification is pending API credits/access; tracked in issue #30.

## Run Locally

```powershell
cd apps/mohit-soni
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

Set `WHIPSCRIBE_API_KEY` in `.env` before uploading a real recording.

If you do not have paid API access yet, start the app and choose **Open Demo Transcript** for support QA or **Open Insights Demo** for the fallback workflow. Demo mode uses seeded sample transcript data and clearly labels the report as demo data. The normal upload path remains available for anyone with a WhipScribe API key.

The primary Track 4 workflow is still **Support QA Copilot**. The generic review path is a practical safety net: if someone uploads a meeting, interview, or podcast-style recording, the app extracts key moments, questions, action items, speaker counts, and risks instead of pretending that a support-call rubric applies.

The API client follows the WhipScribe Business API reference:

- sends `X-API-Key` on every request
- sends `Idempotency-Key` on file submit, derived from the uploaded file bytes and filename
- submits multipart files to `/transcribe` with `source=api`, `diarize=true`, and `word_timestamps=true`
- polls `/jobs/{job_id}` and checks `locked`, `failed`, and `speech_detected` before fetching `/result?format=json`
- calls `/me` after a real upload to display the account's authoritative `retention_days`
- surfaces structured API error codes such as `NO_CREDITS`, `transcript_locked`, `BAD_MIME`, and `AUDIO_EXPIRED`

Verified locally with Python `3.10.11` using:

```powershell
pytest -v
uvicorn app.main:app --reload
```

## Demo Script

1. Start the app.
2. If an API key is available, upload a two-minute self-created support call. Otherwise, open the support demo transcript.
3. Wait for WhipScribe transcription to finish.
4. Confirm agent and customer speakers.
5. Open the QA report.
6. Show one pass, one missing item, and one coaching note with timestamp evidence.
7. Export the Markdown report.
8. Optional: open the generic demo to show the app handles non-support recordings without a fake QA score.

## Verification Status

- Automated tests pass for local storage, WhipScribe client request shape, QA scoring, Markdown export, upload page rendering, and missing-key error handling.
- Manual no-key check passes: upload returns a setup error and does not expose the uploaded file content or API key in the page.
- Demo mode works without an API key for both the support QA flow and the generic transcript review flow.
- API-reference behavior is covered for `/me` retention, structured error messages, locked transcripts, failed jobs, and account retention persistence after upload.
- Real WhipScribe happy-path verification still needs the contributor's own paid API key/API credits and owned recording; tracked in issue #30.
- User validation is still pending with one founder, support lead, or teammate.

## Four-Minute Demo Checklist

- Show the upload screen.
- Upload a self-created support-call recording if an API key is available, or use **Open Demo Transcript**.
- Show status polling until WhipScribe returns `done`, or clearly state that demo mode skips API polling.
- Confirm speaker roles.
- Show the scorecard and timestamp evidence.
- Export the Markdown report.
- State the unfinished parts honestly: no accounts, no batch review, no CRM/helpdesk sync.

## Privacy

Use only your own recording or a recording everyone agreed to use. Runtime transcript/report data is stored locally in `.runtime/`, which is gitignored. Delete `.runtime/` after the demo if the recording contains private content.

## Vision

In one year, this becomes a support QA layer over the WhipScribe library: every call is reviewed automatically, risky promises are surfaced, coaching examples are collected, and managers can search by agent, issue type, objection, and score trend. MCP can connect the reviewed library to an assistant so a lead can ask, "Which calls this week missed follow-up owners?" and get answers with exact evidence.
