from fastapi.testclient import TestClient

import app.main as main_module
from app.main import app


def test_index_loads_upload_form():
    client = TestClient(app)

    response = client.get("/")

    assert response.status_code == 200
    assert "Support QA Copilot" in response.text
    assert 'type="file"' in response.text
    assert "General Transcript Insights" in response.text
    assert 'class="demo-actions"' in response.text


def test_upload_without_api_key_shows_setup_error(monkeypatch, tmp_path):
    monkeypatch.delenv("WHIPSCRIBE_API_KEY", raising=False)
    monkeypatch.setenv("RUNTIME_DIR", str(tmp_path))
    client = TestClient(app)

    response = client.post(
        "/jobs",
        files={"file": ("call.mp3", b"fake audio", "audio/mpeg")},
    )

    assert response.status_code == 400
    assert "WHIPSCRIBE_API_KEY is missing" in response.text
    assert "fake audio" not in response.text


def test_empty_upload_is_rejected(monkeypatch, tmp_path):
    class FakeClient:
        def submit_file(self, file_path, idempotency_key):
            raise AssertionError("empty upload should not reach WhipScribe")

    monkeypatch.setenv("RUNTIME_DIR", str(tmp_path))
    monkeypatch.setattr(main_module, "_client", lambda: FakeClient())
    client = TestClient(app)

    response = client.post(
        "/jobs",
        files={"file": ("call.mp3", b"", "audio/mpeg")},
    )

    assert response.status_code == 400
    assert "Uploaded file is empty" in response.text


def test_demo_mode_does_not_require_api_key(monkeypatch, tmp_path):
    monkeypatch.delenv("WHIPSCRIBE_API_KEY", raising=False)
    monkeypatch.setenv("RUNTIME_DIR", str(tmp_path))
    client = TestClient(app)

    response = client.post("/jobs/demo", follow_redirects=False)

    assert response.status_code == 303
    assert response.headers["location"] == "/jobs/demo-support-call/speakers"

    speakers_response = client.get(response.headers["location"])
    assert speakers_response.status_code == 200
    assert "Demo transcript" in speakers_response.text
    assert "Agent" in speakers_response.text
    assert "Customer" in speakers_response.text


def test_demo_mode_reuses_report_flow(monkeypatch, tmp_path):
    monkeypatch.delenv("WHIPSCRIBE_API_KEY", raising=False)
    monkeypatch.setenv("RUNTIME_DIR", str(tmp_path))
    client = TestClient(app)

    client.post("/jobs/demo")
    response = client.post(
        "/jobs/demo-support-call/speakers",
        data={"agent": "Agent", "customer": "Customer"},
        follow_redirects=True,
    )

    assert response.status_code == 200
    assert "QA Report" in response.text
    assert "Demo transcript" in response.text
    assert "Customer Pain Points" in response.text
    assert "The upgrade is failing" in response.text
    assert "Review empathy with the agent." in response.text


def test_markdown_export_downloads_file(monkeypatch, tmp_path):
    monkeypatch.delenv("WHIPSCRIBE_API_KEY", raising=False)
    monkeypatch.setenv("RUNTIME_DIR", str(tmp_path))
    client = TestClient(app)

    client.post("/jobs/demo")
    client.post(
        "/jobs/demo-support-call/speakers",
        data={"agent": "Agent", "customer": "Customer"},
    )

    response = client.get("/jobs/demo-support-call/export.md")

    assert response.status_code == 200
    assert response.headers["content-disposition"] == 'attachment; filename="demo-support-call-qa-report.md"'
    assert response.headers["content-type"].startswith("text/markdown")


def test_locked_real_job_shows_unlock_guidance(monkeypatch, tmp_path):
    class FakeClient:
        def get_status(self, job_id):
            return {
                "job_id": job_id,
                "status": "done",
                "locked": True,
                "locked_code": "transcript_locked",
                "unlock_url": "https://whipscribe.com/credits",
            }

    monkeypatch.setenv("RUNTIME_DIR", str(tmp_path))
    monkeypatch.setattr(main_module, "_client", lambda: FakeClient())
    client = TestClient(app)

    response = client.get("/jobs/job-123")

    assert response.status_code == 402
    assert "Transcript is locked" in response.text
    assert "https://whipscribe.com/credits" in response.text


def test_failed_real_job_shows_api_error(monkeypatch, tmp_path):
    class FakeClient:
        def get_status(self, job_id):
            return {"job_id": job_id, "status": "failed", "error": "Unsupported media"}

    monkeypatch.setenv("RUNTIME_DIR", str(tmp_path))
    monkeypatch.setattr(main_module, "_client", lambda: FakeClient())
    client = TestClient(app)

    response = client.get("/jobs/job-123")

    assert response.status_code == 502
    assert "WhipScribe job failed" in response.text
    assert "Unsupported media" in response.text


def test_real_upload_saves_account_retention(monkeypatch, tmp_path):
    class FakeClient:
        def submit_file(self, file_path, idempotency_key):
            assert file_path.name.startswith("72401f193251f177-")
            assert ".." not in file_path.name
            return {"job_id": "job-123", "status": "queued"}

        def get_account(self):
            return {"tier": "starter", "retention_days": 7}

    monkeypatch.setenv("RUNTIME_DIR", str(tmp_path))
    monkeypatch.setattr(main_module, "_client", lambda: FakeClient())
    client = TestClient(app)

    response = client.post(
        "/jobs",
        files={"file": ("../call name.mp3", b"fake audio", "audio/mpeg")},
        follow_redirects=False,
    )

    assert response.status_code == 303
    assert response.headers["location"] == "/jobs/job-123"
    saved_account = main_module._store().load("job-123", "account")
    assert saved_account["retention_days"] == 7


def test_generic_demo_skips_speaker_mapping_and_report_has_no_score(monkeypatch, tmp_path):
    monkeypatch.delenv("WHIPSCRIBE_API_KEY", raising=False)
    monkeypatch.setenv("RUNTIME_DIR", str(tmp_path))
    client = TestClient(app)

    response = client.post("/jobs/demo", data={"workflow": "generic_review"}, follow_redirects=False)

    assert response.status_code == 303
    assert response.headers["location"] == "/jobs/demo-support-call/report"

    report_response = client.get(response.headers["location"])
    assert report_response.status_code == 200
    assert "Transcript Intelligence Review" in report_response.text
    assert "QA Report" not in report_response.text
    assert "Score" not in report_response.text
    assert "Key Moments" in report_response.text


def test_real_upload_saves_selected_workflow(monkeypatch, tmp_path):
    class FakeClient:
        def submit_file(self, file_path, idempotency_key):
            return {"job_id": "job-456", "status": "queued"}

        def get_account(self):
            return {"tier": "starter", "retention_days": 7}

    monkeypatch.setenv("RUNTIME_DIR", str(tmp_path))
    monkeypatch.setattr(main_module, "_client", lambda: FakeClient())
    client = TestClient(app)

    response = client.post(
        "/jobs",
        data={"workflow": "generic_review"},
        files={"file": ("meeting.mp3", b"fake audio", "audio/mpeg")},
        follow_redirects=False,
    )

    assert response.status_code == 303
    assert main_module._store().load("job-456", "workflow")["type"] == "generic_review"
