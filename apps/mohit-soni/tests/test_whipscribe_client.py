import pytest
import httpx

from app.whipscribe_client import WhipScribeClient, WhipScribeError


def test_submit_file_sends_api_key_and_idempotency_key(tmp_path):
    audio = tmp_path / "call.mp3"
    audio.write_bytes(b"fake audio")
    seen = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["api_key"] = request.headers["X-API-Key"]
        seen["idempotency"] = request.headers["Idempotency-Key"]
        seen["path"] = request.url.path
        return httpx.Response(202, json={"job_id": "job-123", "status": "queued"})

    client = WhipScribeClient(
        "secret",
        "https://example.test",
        httpx.Client(transport=httpx.MockTransport(handler)),
    )

    response = client.submit_file(audio, "upload-abc")

    assert response == {"job_id": "job-123", "status": "queued"}
    assert seen == {
        "api_key": "secret",
        "idempotency": "upload-abc",
        "path": "/transcribe",
    }


def test_status_fetches_job_payload():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/jobs/job-123"
        return httpx.Response(200, json={"job_id": "job-123", "status": "done"})

    client = WhipScribeClient(
        "secret",
        "https://example.test",
        httpx.Client(transport=httpx.MockTransport(handler)),
    )

    assert client.get_status("job-123")["status"] == "done"


def test_account_retention_uses_me_endpoint():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/me"
        return httpx.Response(200, json={"tier": "guest", "retention_days": 3, "signed_in": False})

    client = WhipScribeClient(
        "secret",
        "https://example.test",
        httpx.Client(transport=httpx.MockTransport(handler)),
    )

    assert client.get_account()["retention_days"] == 3


def test_error_message_includes_api_code_and_upgrade_url():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            402,
            json={
                "error": "Insufficient credit to submit.",
                "code": "NO_CREDITS",
                "upgrade_url": "https://whipscribe.com/credits",
            },
        )

    client = WhipScribeClient(
        "secret",
        "https://example.test",
        httpx.Client(transport=httpx.MockTransport(handler)),
    )

    with pytest.raises(WhipScribeError) as exc:
        client.get_status("job-123")

    message = str(exc.value)
    assert "NO_CREDITS" in message
    assert "Insufficient credit to submit." in message
    assert "https://whipscribe.com/credits" in message
