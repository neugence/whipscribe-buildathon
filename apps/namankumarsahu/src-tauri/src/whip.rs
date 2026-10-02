//! WhipScribe REST client. Auth header and endpoints follow the public `whipscribe-mcp` client:
//! `X-API-Key`, `POST /transcribe`, `GET /jobs`, `GET /jobs/{id}`, `GET /jobs/{id}/result?format=json`,
//! `DELETE /jobs/{id}`, `GET /me`. Transient failures (network, 429, 5xx) are retried with backoff;
//! uploads carry an `Idempotency-Key` so a retry after a lost response cannot create a duplicate job.

use serde_json::Value;
use std::path::Path;
use std::time::Duration;

pub struct Client {
    key: String,
    base: String,
    http: reqwest::Client,
}

fn transient(status: u16) -> bool {
    status == 429 || status >= 500
}

impl Client {
    pub fn new(key: &str, base: &str) -> Result<Self, String> {
        if key.trim().is_empty() {
            return Err("No WhipScribe API key configured. Add it in Settings.".into());
        }
        let http = reqwest::Client::builder()
            .connect_timeout(Duration::from_secs(15))
            .timeout(Duration::from_secs(900))
            .user_agent("whipscribe-recorder/0.2")
            .build()
            .map_err(|e| e.to_string())?;
        Ok(Self { key: key.trim().to_string(), base: base.trim_end_matches('/').to_string(), http })
    }

    fn url(&self, path: &str) -> String {
        format!("{}{}", self.base, path)
    }

    async fn finish(resp: reqwest::Response) -> Result<Value, (u16, String)> {
        let status = resp.status().as_u16();
        let text = resp.text().await.unwrap_or_default();
        if (200..300).contains(&status) {
            if text.trim().is_empty() {
                return Ok(Value::Null);
            }
            return serde_json::from_str(&text).map_err(|e| (status, format!("bad JSON from server: {e}")));
        }
        // Documented error shape: {"error": "<sentence>", "code": "<ENUM>"}
        let detail = serde_json::from_str::<Value>(&text)
            .ok()
            .map(|v| {
                let msg = v.get("error").or_else(|| v.get("detail")).or_else(|| v.get("message"))
                    .map(|d| d.as_str().map(str::to_string).unwrap_or_else(|| d.to_string()))
                    .unwrap_or_default();
                match v.get("code").and_then(|c| c.as_str()) {
                    Some(c) if !msg.is_empty() => format!("{msg} [{c}]"),
                    Some(c) => c.to_string(),
                    None => msg,
                }
            })
            .filter(|d| !d.is_empty())
            .unwrap_or_else(|| text.chars().take(300).collect());
        Err((status, detail))
    }

    fn explain(status: u16, detail: &str) -> String {
        match status {
            401 | 403 => format!("WhipScribe rejected the API key ({status}). Check it in Settings. {detail}"),
            404 => format!("Not found on WhipScribe (404). {detail}"),
            410 => format!("WhipScribe no longer has this item (retention window passed). {detail}"),
            402 => format!("This WhipScribe account has no credit for that (402). Add credit at whipscribe.com/credits. {detail}"),
            413 => "The recording is larger than WhipScribe accepts (413).".to_string(),
            415 => "WhipScribe did not accept the audio format (415).".to_string(),
            429 => format!("WhipScribe limit reached (429). {detail}"),
            400 | 422 => format!("WhipScribe rejected the request ({status}). {detail}"),
            s => format!("WhipScribe API error {s}: {detail}"),
        }
    }

    async fn get(&self, path: &str) -> Result<Value, String> {
        let mut last = String::new();
        for attempt in 0..3u64 {
            if attempt > 0 {
                tokio::time::sleep(Duration::from_millis(600 * (1 << attempt))).await;
            }
            match self.http.get(self.url(path)).header("X-API-Key", &self.key).send().await {
                Ok(r) => match Self::finish(r).await {
                    Ok(v) => return Ok(v),
                    Err((s, d)) if transient(s) => last = Self::explain(s, &d),
                    Err((s, d)) => return Err(Self::explain(s, &d)),
                },
                Err(e) => last = format!("Network error: {e}"),
            }
        }
        Err(last)
    }

    pub async fn upload(
        &self,
        path: &Path,
        filename: &str,
        idempotency_key: &str,
        language: Option<&str>,
    ) -> Result<Value, String> {
        let bytes = tokio::fs::read(path).await.map_err(|e| format!("Could not read recording: {e}"))?;
        let mut last = String::new();
        for attempt in 0..3u64 {
            if attempt > 0 {
                tokio::time::sleep(Duration::from_millis(1500 * (1 << attempt))).await;
            }
            let part = reqwest::multipart::Part::bytes(bytes.clone())
                .file_name(filename.to_string())
                .mime_str("audio/wav")
                .map_err(|e| e.to_string())?;
            let mut form = reqwest::multipart::Form::new()
                .part("file", part)
                .text("diarize", "true")
                .text("word_timestamps", "true")
                .text("source", "recording"); // docs: upload | url | recording | api (anything else is 422 BAD_SOURCE)
            if let Some(l) = language.filter(|l| !l.is_empty()) {
                form = form.text("language", l.to_string());
            }
            let req = self
                .http
                .post(self.url("/transcribe"))
                .header("X-API-Key", &self.key)
                .header("Idempotency-Key", idempotency_key)
                .multipart(form);
            match req.send().await {
                Ok(r) => match Self::finish(r).await {
                    Ok(v) => return Ok(v),
                    Err((s, d)) if transient(s) => last = Self::explain(s, &d),
                    Err((s, d)) => return Err(Self::explain(s, &d)),
                },
                Err(e) => last = format!("Upload failed (network): {e}"),
            }
        }
        Err(last)
    }

    pub async fn job(&self, id: &str) -> Result<Value, String> {
        self.get(&format!("/jobs/{}", urlencoding::encode(id))).await
    }

    pub async fn result(&self, id: &str) -> Result<Value, String> {
        self.get(&format!("/jobs/{}/result?format=json", urlencoding::encode(id))).await
    }

    pub async fn list(&self, limit: u32) -> Result<Value, String> {
        self.get(&format!("/jobs?limit={}", limit.clamp(1, 100))).await
    }

    pub async fn me(&self) -> Result<Value, String> {
        self.get("/me").await
    }

    pub async fn delete(&self, id: &str) -> Result<(), String> {
        let r = self
            .http
            .delete(self.url(&format!("/jobs/{}", urlencoding::encode(id))))
            .header("X-API-Key", &self.key)
            .send()
            .await
            .map_err(|e| format!("Network error: {e}"))?;
        match Self::finish(r).await {
            Ok(_) => Ok(()),
            Err((404, _)) | Err((410, _)) => Ok(()), // already gone
            Err((s, d)) => Err(Self::explain(s, &d)),
        }
    }
}
