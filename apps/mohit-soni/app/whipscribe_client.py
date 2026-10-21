from pathlib import Path
from typing import Any

import httpx


class WhipScribeError(RuntimeError):
    pass


class WhipScribeClient:
    def __init__(self, api_key: str, base_url: str, client: httpx.Client | None = None):
        if not api_key:
            raise WhipScribeError("WHIPSCRIBE_API_KEY is missing. Copy .env.example to .env and set your own key.")
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.client = client or httpx.Client(timeout=60)

    def _headers(self, extra: dict[str, str] | None = None) -> dict[str, str]:
        headers = {"X-API-Key": self.api_key}
        if extra:
            headers.update(extra)
        return headers

    def submit_file(self, file_path: Path, idempotency_key: str) -> dict[str, Any]:
        with file_path.open("rb") as handle:
            response = self.client.post(
                f"{self.base_url}/transcribe",
                headers=self._headers({"Idempotency-Key": idempotency_key}),
                files={"file": (file_path.name, handle)},
                data={"source": "api", "diarize": "true", "word_timestamps": "true"},
            )
        return self._json(response)

    def get_status(self, job_id: str) -> dict[str, Any]:
        response = self.client.get(f"{self.base_url}/jobs/{job_id}", headers=self._headers())
        return self._json(response)

    def get_transcript(self, job_id: str) -> dict[str, Any]:
        response = self.client.get(f"{self.base_url}/jobs/{job_id}/result?format=json", headers=self._headers())
        return self._json(response)

    def get_audio_url(self, job_id: str) -> dict[str, Any]:
        response = self.client.get(f"{self.base_url}/jobs/{job_id}/audio/url", headers=self._headers())
        return self._json(response)

    def get_account(self) -> dict[str, Any]:
        response = self.client.get(f"{self.base_url}/me", headers=self._headers())
        return self._json(response)

    def _json(self, response: httpx.Response) -> dict[str, Any]:
        if response.status_code >= 400:
            raise WhipScribeError(self._error_message(response))
        return response.json()

    def _error_message(self, response: httpx.Response) -> str:
        try:
            payload = response.json()
        except ValueError:
            return f"WhipScribe request failed: HTTP {response.status_code} {response.text}"

        parts = [f"WhipScribe request failed: HTTP {response.status_code}"]
        if payload.get("code"):
            parts.append(str(payload["code"]))
        if payload.get("error"):
            parts.append(str(payload["error"]))
        if payload.get("message") and payload.get("message") != payload.get("error"):
            parts.append(str(payload["message"]))
        if payload.get("upgrade_url"):
            parts.append(str(payload["upgrade_url"]))
        return " - ".join(parts)
