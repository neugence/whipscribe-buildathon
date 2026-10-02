mod audio;
mod gcal;
mod store;
mod whip;

use serde_json::{json, Value};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_opener::OpenerExt;

const DEFAULT_BASE: &str = "https://whipscribe.com/api/v1";

struct Active {
    id: String,
    handle: audio::Handle,
}
#[derive(Default)]
struct Rec(Mutex<Option<Active>>);

fn root(app: &AppHandle) -> Result<PathBuf, String> {
    let d = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&d).map_err(|e| e.to_string())?;
    Ok(d)
}

fn setting_or_env(root: &Path, key: &str, env: &str) -> String {
    store::settings(root)[key]
        .as_str()
        .map(String::from)
        .filter(|s| !s.is_empty())
        .or_else(|| std::env::var(env).ok())
        .unwrap_or_default()
}

fn client(root: &Path) -> Result<whip::Client, String> {
    let key = setting_or_env(root, "apiKey", "WHIPSCRIBE_API_KEY");
    let base = {
        let b = setting_or_env(root, "baseUrl", "WHIPSCRIBE_BASE_URL");
        if b.is_empty() { DEFAULT_BASE.to_string() } else { b }
    };
    whip::Client::new(&key, &base)
}

// ----------------------------------------------------------------- settings
#[tauri::command]
fn get_settings(app: AppHandle) -> Result<Value, String> {
    let root = root(&app)?;
    let s = store::settings(&root);
    let key = setting_or_env(&root, "apiKey", "WHIPSCRIBE_API_KEY");
    let key_tail: String = key.chars().rev().take(4).collect::<Vec<_>>().into_iter().rev().collect();
    Ok(json!({
        "hasKey": !key.is_empty(),
        "keyTail": key_tail,
        "baseUrl": s["baseUrl"].as_str().unwrap_or(DEFAULT_BASE),
        "googleClientId": setting_or_env(&root, "googleClientId", "GOOGLE_CLIENT_ID"),
        "googleSecretSet": !setting_or_env(&root, "googleClientSecret", "GOOGLE_CLIENT_SECRET").is_empty(),
        "googleConnected": gcal::connected(&root),
        "language": s["language"].as_str().unwrap_or(""),
        "autoUpload": false, // recordings are only uploaded after the user approves each one
        "captureMic": s["captureMic"].as_bool().unwrap_or(true),
        "captureSystem": s["captureSystem"].as_bool().unwrap_or(true),
    }))
}

#[tauri::command]
fn save_settings(app: AppHandle, patch: Value) -> Result<(), String> {
    let root = root(&app)?;
    let allowed = ["apiKey", "baseUrl", "googleClientId", "googleClientSecret", "language", "autoUpload", "captureMic", "captureSystem"];
    let mut clean = serde_json::Map::new();
    if let Some(p) = patch.as_object() {
        for (k, v) in p {
            if !allowed.contains(&k.as_str()) { continue; }
            match v.as_str() {
                Some(s) if s.trim().is_empty() => { clean.insert(k.clone(), Value::Null); }
                Some(s) => { clean.insert(k.clone(), Value::String(s.trim().to_string())); }
                None => { clean.insert(k.clone(), v.clone()); }
            }
        }
    }
    store::patch_settings(&root, &Value::Object(clean)).map(|_| ())
}

#[tauri::command]
async fn check_api(app: AppHandle) -> Result<Value, String> {
    let root = root(&app)?;
    client(&root)?.me().await
}

// ----------------------------------------------------------------- recording
#[tauri::command]
async fn start_recording(
    app: AppHandle,
    rec: State<'_, Rec>,
    title: String,
    mic: bool,
    system: bool,
    meeting_id: Option<String>,
) -> Result<Value, String> {
    let root = root(&app)?;
    if rec.0.lock().unwrap().is_some() {
        return Err("A recording is already in progress.".into());
    }
    let id = uuid::Uuid::new_v4().to_string();
    let dir = store::recordings_dir(&root);
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = dir.join(format!("{id}.wav"));
    let app2 = app.clone();
    let handle = audio::start(path.clone(), mic, system, Box::new(move |l| { let _ = app2.emit("rec-level", l); }))?;
    let info = handle.info.clone();
    let clean_title = if title.trim().is_empty() { "Untitled meeting".to_string() } else { title.trim().to_string() };
    let record = store::upsert(
        &root,
        &json!({
            "id": id,
            "title": clean_title,
            "startedAt": chrono::Utc::now().to_rfc3339(),
            "duration": 0,
            "path": path.to_string_lossy(),
            "status": "recording", // stays "recording" on disk until a clean stop; recovered on next launch otherwise
            "sources": { "mic": info.mic, "system": info.system },
            "meetingId": meeting_id,
        }),
    )?;
    *rec.0.lock().unwrap() = Some(Active { id, handle });
    Ok(json!({ "record": record, "info": info }))
}

#[tauri::command]
fn toggle_pause(rec: State<'_, Rec>) -> Result<bool, String> {
    let g = rec.0.lock().unwrap();
    let a = g.as_ref().ok_or("Not recording.")?;
    let p = !a.handle.is_paused();
    a.handle.set_paused(p);
    Ok(p)
}

fn finalize(app: &AppHandle) -> Result<Value, String> {
    let state = app.state::<Rec>();
    let active = state.0.lock().unwrap().take().ok_or("Nothing is being recorded.")?;
    let id = active.id.clone();
    let root = root(app)?;
    match active.handle.finish() {
        Ok(sum) => {
            let mut patch = json!({ "id": id, "status": "saved", "duration": sum.seconds });
            if sum.mic_on && sum.seconds > 3.0 && sum.mic_peak < 0.004 {
                patch["warning"] = json!("The microphone captured no sound. Check Windows Settings > Privacy & security > Microphone, and that the right default input device is selected.");
            }
            let _ = sum.system_on;
            let _ = sum.system_peak;
            store::upsert(&root, &patch)
        }
        Err(e) => {
            // The file is still usable up to the failure point.
            let p = store::recordings_dir(&root).join(format!("{id}.wav"));
            let secs = audio::repair_wav(&p).unwrap_or(0.0);
            store::upsert(&root, &json!({ "id": id, "status": "saved", "duration": secs, "warning": e }))
        }
    }
}

#[tauri::command]
async fn stop_recording(app: AppHandle) -> Result<Value, String> {
    finalize(&app)
}

#[tauri::command]
fn recording_state(rec: State<'_, Rec>) -> Value {
    match rec.0.lock().unwrap().as_ref() {
        Some(a) => json!({ "id": a.id, "paused": a.handle.is_paused(), "info": a.handle.info }),
        None => Value::Null,
    }
}

/// Anything still marked "recording" at launch was interrupted (crash, power loss, force quit).
fn recover(root: &Path) {
    let lib = store::library(root);
    for r in lib["recordings"].as_array().cloned().unwrap_or_default() {
        if r["status"] != "recording" { continue; }
        let id = r["id"].as_str().unwrap_or_default();
        let path = PathBuf::from(r["path"].as_str().unwrap_or_default());
        let patch = match audio::repair_wav(&path) {
            Ok(secs) if secs > 0.5 => json!({ "id": id, "status": "saved", "duration": secs, "recovered": true }),
            Ok(_) => json!({ "id": id, "status": "error", "error": "The app closed before any audio was captured." }),
            Err(e) => json!({ "id": id, "status": "error", "error": format!("Audio file could not be recovered: {e}") }),
        };
        let _ = store::upsert(root, &patch);
    }
}

// ----------------------------------------------------------------- library
#[tauri::command]
fn library_load(app: AppHandle) -> Result<Value, String> {
    Ok(store::library(&root(&app)?))
}

#[tauri::command]
fn library_patch(app: AppHandle, id: String, patch: Value) -> Result<Value, String> {
    let mut p = patch;
    p["id"] = Value::String(id);
    store::upsert(&root(&app)?, &p)
}

#[tauri::command]
fn library_set_folders(app: AppHandle, folders: Value) -> Result<(), String> {
    store::set_folders(&root(&app)?, &folders)
}

#[tauri::command]
fn library_search(app: AppHandle, query: String) -> Result<Value, String> {
    Ok(store::search(&root(&app)?, &query))
}

#[tauri::command]
async fn library_remove(app: AppHandle, id: String, delete_remote: bool) -> Result<(), String> {
    let root = root(&app)?;
    if delete_remote {
        let job = store::library(&root)["recordings"]
            .as_array()
            .and_then(|a| a.iter().find(|r| r["id"] == id.as_str()).and_then(|r| r["jobId"].as_str().map(String::from)));
        if let Some(job) = job {
            client(&root)?.delete(&job).await?; // if this fails the local copy is kept so nothing is orphaned
        }
    }
    store::remove(&root, &id, true)
}

#[tauri::command]
fn transcript_save(app: AppHandle, id: String, data: Value, text: String) -> Result<(), String> {
    store::save_transcript(&root(&app)?, &id, &data, &text)
}

#[tauri::command]
fn transcript_load(app: AppHandle, id: String) -> Result<Value, String> {
    Ok(store::load_transcript(&root(&app)?, &id).unwrap_or(Value::Null))
}

// ----------------------------------------------------------------- WhipScribe
fn sanitize(title: &str) -> String {
    let s: String = title.chars().map(|c| if c.is_alphanumeric() || c == ' ' || c == '-' || c == '_' { c } else { '_' }).collect();
    let s = s.trim().to_string();
    if s.is_empty() { "meeting".into() } else { s.chars().take(80).collect() }
}

async fn do_upload(root: &Path, id: &str) -> Result<Value, String> {
    let rec = store::library(root)["recordings"]
        .as_array()
        .and_then(|a| a.iter().find(|r| r["id"] == id).cloned())
        .ok_or("Recording not found.")?;
    if rec["status"] == "recording" {
        return Err("Stop the recording before uploading it.".into());
    }
    let path = PathBuf::from(rec["path"].as_str().ok_or("Recording has no audio file.")?);
    if !path.exists() {
        return Err("The audio file is missing from disk.".into());
    }
    let c = client(root)?;
    store::upsert(root, &json!({ "id": id, "status": "uploading", "error": null }))?;
    let lang = store::settings(root)["language"].as_str().map(String::from);
    let filename = format!("{}.wav", sanitize(rec["title"].as_str().unwrap_or("meeting")));
    let v = c.upload(&path, &filename, &format!("ws-rec-{id}"), lang.as_deref()).await?;
    let job = v["job_id"].as_str().or_else(|| v["id"].as_str()).ok_or("WhipScribe accepted the upload but returned no job id.")?.to_string();
    store::upsert(root, &json!({ "id": id, "status": "processing", "jobId": job, "error": null }))
}

#[tauri::command]
async fn upload_recording(app: AppHandle, id: String) -> Result<Value, String> {
    let root = root(&app)?;
    let res = do_upload(&root, &id).await;
    if let Err(e) = &res {
        let _ = store::upsert(&root, &json!({ "id": id, "status": "error", "error": e }));
    }
    res
}

#[tauri::command]
async fn job_status(app: AppHandle, job_id: String) -> Result<Value, String> {
    client(&root(&app)?)?.job(&job_id).await
}

#[tauri::command]
async fn job_result(app: AppHandle, job_id: String) -> Result<Value, String> {
    client(&root(&app)?)?.result(&job_id).await
}

#[tauri::command]
async fn remote_jobs(app: AppHandle, limit: u32) -> Result<Value, String> {
    client(&root(&app)?)?.list(limit).await
}

// ----------------------------------------------------------------- calendar
#[tauri::command]
async fn gcal_connect(app: AppHandle) -> Result<(), String> {
    let root = root(&app)?;
    let id = setting_or_env(&root, "googleClientId", "GOOGLE_CLIENT_ID");
    let secret = setting_or_env(&root, "googleClientSecret", "GOOGLE_CLIENT_SECRET");
    let app2 = app.clone();
    gcal::connect(&root, &id, &secret, move |url| app2.opener().open_url(url, None::<&str>).map_err(|e| e.to_string())).await
}

#[tauri::command]
async fn gcal_events(app: AppHandle) -> Result<Value, String> {
    gcal::events(&root(&app)?, 7).await
}

#[tauri::command]
fn gcal_disconnect(app: AppHandle) -> Result<(), String> {
    gcal::disconnect(&root(&app)?);
    Ok(())
}

#[tauri::command]
fn open_url(app: AppHandle, url: String) -> Result<(), String> {
    if !(url.starts_with("https://") || url.starts_with("http://")) {
        return Err("Only http(s) links can be opened.".into());
    }
    app.opener().open_url(url, None::<&str>).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Dev convenience: read WHIPSCRIBE_API_KEY etc. from .env (project root when run via `tauri dev`).
    let _ = dotenvy::from_path("../.env");
    let _ = dotenvy::dotenv();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(Rec::default())
        .setup(|app| {
            if let Ok(r) = root(app.handle()) {
                recover(&r);
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_settings, save_settings, check_api,
            start_recording, toggle_pause, stop_recording, recording_state,
            library_load, library_patch, library_set_folders, library_search, library_remove,
            transcript_save, transcript_load,
            upload_recording, job_status, job_result, remote_jobs,
            gcal_connect, gcal_events, gcal_disconnect, open_url
        ])
        .build(tauri::generate_context!())
        .expect("error while building WhipScribe Recorder")
        .run(|app, event| {
            // Closing the window mid-call still finalizes the WAV cleanly.
            if let tauri::RunEvent::Exit = event {
                let _ = finalize(app);
            }
        });
}
