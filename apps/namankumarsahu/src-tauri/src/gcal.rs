//! Google Calendar (read-only) via OAuth 2.0 for installed apps: system browser + PKCE + loopback redirect.
//! No embedded webview, no client secret in the UI bundle; tokens live in the app data dir.

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use rand::RngCore;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};
use std::time::Duration;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;

const AUTH: &str = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN: &str = "https://oauth2.googleapis.com/token";
const SCOPE: &str = "https://www.googleapis.com/auth/calendar.readonly";

#[derive(Serialize, Deserialize, Clone, Default)]
struct Tokens {
    client_id: String,
    client_secret: String,
    access_token: String,
    refresh_token: String,
    expires_at: i64,
}

fn file(dir: &Path) -> PathBuf {
    dir.join("google.json")
}
fn load(dir: &Path) -> Option<Tokens> {
    serde_json::from_slice(&std::fs::read(file(dir)).ok()?).ok()
}
fn save(dir: &Path, t: &Tokens) -> Result<(), String> {
    let tmp = dir.join("google.json.tmp");
    std::fs::write(&tmp, serde_json::to_vec(t).map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
    std::fs::rename(&tmp, file(dir)).map_err(|e| e.to_string())
}

pub fn connected(dir: &Path) -> bool {
    load(dir).map_or(false, |t| !t.refresh_token.is_empty())
}
pub fn disconnect(dir: &Path) {
    let _ = std::fs::remove_file(file(dir));
}

fn form(pairs: &[(&str, &str)]) -> String {
    pairs.iter().map(|(k, v)| format!("{}={}", urlencoding::encode(k), urlencoding::encode(v))).collect::<Vec<_>>().join("&")
}

async fn token_request(body: String) -> Result<Value, String> {
    let r = reqwest::Client::new()
        .post(TOKEN)
        .header("Content-Type", "application/x-www-form-urlencoded")
        .body(body)
        .timeout(Duration::from_secs(20))
        .send()
        .await
        .map_err(|e| format!("Google token request failed: {e}"))?;
    let ok = r.status().is_success();
    let v: Value = r.json().await.map_err(|e| e.to_string())?;
    if !ok {
        let d = v.get("error_description").or_else(|| v.get("error")).map(|x| x.to_string()).unwrap_or_default();
        return Err(format!("Google rejected the request: {d}"));
    }
    Ok(v)
}

fn rand_b64(n: usize) -> String {
    let mut b = vec![0u8; n];
    rand::thread_rng().fill_bytes(&mut b);
    URL_SAFE_NO_PAD.encode(b)
}

/// Runs the whole sign-in. `open_browser` receives the consent URL.
pub async fn connect(
    dir: &Path,
    client_id: &str,
    client_secret: &str,
    open_browser: impl FnOnce(String) -> Result<(), String>,
) -> Result<(), String> {
    if client_id.trim().is_empty() {
        return Err("Enter a Google OAuth client ID first (Desktop app type).".into());
    }
    let listener = TcpListener::bind("127.0.0.1:0").await.map_err(|e| e.to_string())?;
    let port = listener.local_addr().map_err(|e| e.to_string())?.port();
    let redirect = format!("http://127.0.0.1:{port}");
    let verifier = rand_b64(48);
    let challenge = URL_SAFE_NO_PAD.encode(Sha256::digest(verifier.as_bytes()));
    let state = rand_b64(16);

    let url = format!(
        "{AUTH}?{}",
        form(&[
            ("client_id", client_id.trim()),
            ("redirect_uri", redirect.as_str()),
            ("response_type", "code"),
            ("scope", SCOPE),
            ("code_challenge", challenge.as_str()),
            ("code_challenge_method", "S256"),
            ("access_type", "offline"),
            ("prompt", "consent"),
            ("state", state.as_str()),
        ])
    );
    open_browser(url)?;

    let code = tokio::time::timeout(Duration::from_secs(240), async {
        loop {
            let (mut sock, _) = listener.accept().await.map_err(|e| e.to_string())?;
            let mut buf = vec![0u8; 8192];
            let n = sock.read(&mut buf).await.unwrap_or(0);
            let req = String::from_utf8_lossy(&buf[..n]).to_string();
            let line = req.lines().next().unwrap_or("");
            let q = line.split_whitespace().nth(1).and_then(|p| p.split_once('?')).map(|x| x.1).unwrap_or("");
            let get = |k: &str| {
                q.split('&')
                    .filter_map(|kv| kv.split_once('='))
                    .find(|(a, _)| *a == k)
                    .map(|(_, v)| urlencoding::decode(v).map(|c| c.into_owned()).unwrap_or_default())
            };
            let (msg, result) = if let Some(err) = get("error") {
                ("Sign-in was cancelled. You can close this tab.", Some(Err(format!("Google sign-in failed: {err}"))))
            } else if let (Some(c), Some(s)) = (get("code"), get("state")) {
                if s == state {
                    ("Connected. You can close this tab and return to WhipScribe Recorder.", Some(Ok(c)))
                } else {
                    ("State mismatch. Please try again.", Some(Err("OAuth state mismatch".to_string())))
                }
            } else {
                ("", None) // favicon etc.
            };
            let body = format!("<!doctype html><meta charset=utf-8><body style=\"font-family:system-ui;padding:48px\"><h2>{msg}</h2>");
            let _ = sock
                .write_all(format!("HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}", body.len(), body).as_bytes())
                .await;
            if let Some(r) = result {
                return r;
            }
        }
    })
    .await
    .map_err(|_| "Timed out waiting for Google sign-in.".to_string())??;

    let v = token_request(form(&[
        ("client_id", client_id.trim()),
        ("client_secret", client_secret.trim()),
        ("code", code.as_str()),
        ("code_verifier", verifier.as_str()),
        ("redirect_uri", redirect.as_str()),
        ("grant_type", "authorization_code"),
    ]))
    .await?;
    let refresh = v["refresh_token"].as_str().ok_or("Google did not return a refresh token. Remove the app from your Google account's third-party access and retry.")?;
    save(
        dir,
        &Tokens {
            client_id: client_id.trim().into(),
            client_secret: client_secret.trim().into(),
            access_token: v["access_token"].as_str().unwrap_or("").into(),
            refresh_token: refresh.into(),
            expires_at: chrono::Utc::now().timestamp() + v["expires_in"].as_i64().unwrap_or(3600) - 60,
        },
    )
}

async fn access_token(dir: &Path) -> Result<String, String> {
    let mut t = load(dir).ok_or("Google Calendar is not connected.")?;
    if !t.access_token.is_empty() && chrono::Utc::now().timestamp() < t.expires_at {
        return Ok(t.access_token);
    }
    let v = token_request(form(&[
        ("client_id", t.client_id.as_str()),
        ("client_secret", t.client_secret.as_str()),
        ("refresh_token", t.refresh_token.as_str()),
        ("grant_type", "refresh_token"),
    ]))
    .await
    .map_err(|e| {
        if e.contains("invalid_grant") {
            disconnect(dir);
            "Google access was revoked. Reconnect your calendar.".to_string()
        } else {
            e
        }
    })?;
    t.access_token = v["access_token"].as_str().ok_or("no access token")?.into();
    t.expires_at = chrono::Utc::now().timestamp() + v["expires_in"].as_i64().unwrap_or(3600) - 60;
    save(dir, &t)?;
    Ok(t.access_token)
}

fn find_link(ev: &Value) -> Option<(String, &'static str)> {
    if let Some(l) = ev["hangoutLink"].as_str() {
        return Some((l.into(), "Google Meet"));
    }
    if let Some(eps) = ev["conferenceData"]["entryPoints"].as_array() {
        for e in eps {
            if e["entryPointType"] == "video" {
                if let Some(u) = e["uri"].as_str() {
                    return Some((u.into(), provider(u)));
                }
            }
        }
    }
    for field in ["location", "description"] {
        if let Some(s) = ev[field].as_str() {
            for w in s.split(|c: char| c.is_whitespace() || c == '"' || c == '<' || c == '>') {
                if w.starts_with("https://") && (w.contains("zoom.us") || w.contains("teams.microsoft.com") || w.contains("teams.live.com") || w.contains("meet.google.com") || w.contains("webex.com")) {
                    return Some((w.into(), provider(w)));
                }
            }
        }
    }
    None
}

fn provider(u: &str) -> &'static str {
    if u.contains("zoom.us") { "Zoom" } else if u.contains("teams.") { "Teams" } else if u.contains("meet.google") { "Google Meet" } else if u.contains("webex") { "Webex" } else { "Video call" }
}

/// Upcoming (and in-progress) timed events for the next `days` days.
pub async fn events(dir: &Path, days: i64) -> Result<Value, String> {
    let token = access_token(dir).await?;
    let now = chrono::Utc::now();
    let q = form(&[
        ("singleEvents", "true"),
        ("orderBy", "startTime"),
        ("maxResults", "50"),
        ("timeMin", now.to_rfc3339_opts(chrono::SecondsFormat::Secs, true).as_str()),
        ("timeMax", (now + chrono::Duration::days(days)).to_rfc3339_opts(chrono::SecondsFormat::Secs, true).as_str()),
        ("fields", "items(id,summary,status,start,end,location,description,hangoutLink,conferenceData(entryPoints(entryPointType,uri)),attendees(email,displayName,self,responseStatus))"),
    ]);
    let r = reqwest::Client::new()
        .get(format!("https://www.googleapis.com/calendar/v3/calendars/primary/events?{q}"))
        .bearer_auth(token)
        .timeout(Duration::from_secs(20))
        .send()
        .await
        .map_err(|e| format!("Calendar request failed: {e}"))?;
    let status = r.status();
    let v: Value = r.json().await.map_err(|e| e.to_string())?;
    if !status.is_success() {
        let m = v["error"]["message"].as_str().unwrap_or("unknown error");
        return Err(format!("Google Calendar API {}: {m}", status.as_u16()));
    }
    let mut out = vec![];
    for ev in v["items"].as_array().cloned().unwrap_or_default() {
        if ev["status"] == "cancelled" { continue; }
        let Some(start) = ev["start"]["dateTime"].as_str() else { continue }; // skip all-day events
        let attendees = ev["attendees"].as_array().cloned().unwrap_or_default();
        if attendees.iter().any(|a| a["self"] == true && a["responseStatus"] == "declined") { continue; }
        let names: Vec<String> = attendees
            .iter()
            .filter(|a| a["self"] != true)
            .map(|a| a["displayName"].as_str().or_else(|| a["email"].as_str()).unwrap_or("").to_string())
            .filter(|s| !s.is_empty())
            .collect();
        let link = find_link(&ev);
        out.push(json!({
            "id": ev["id"],
            "title": ev["summary"].as_str().unwrap_or("Untitled event"),
            "start": start,
            "end": ev["end"]["dateTime"],
            "attendees": names,
            "link": link.as_ref().map(|l| l.0.clone()),
            "provider": link.map(|l| l.1),
        }));
    }
    Ok(Value::Array(out))
}
