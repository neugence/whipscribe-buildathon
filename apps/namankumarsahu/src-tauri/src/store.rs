//! Tiny JSON persistence in the app data dir: settings, the library index, transcripts.
//! All writes are atomic (write temp + rename) and serialized with one lock.

use serde_json::{json, Value};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

static LOCK: Mutex<()> = Mutex::new(());

pub fn recordings_dir(root: &Path) -> PathBuf {
    root.join("recordings")
}
fn transcripts_dir(root: &Path) -> PathBuf {
    root.join("transcripts")
}

fn write_atomic(path: &Path, bytes: &[u8]) -> Result<(), String> {
    if let Some(p) = path.parent() {
        fs::create_dir_all(p).map_err(|e| e.to_string())?;
    }
    let tmp = path.with_extension("tmp");
    fs::write(&tmp, bytes).map_err(|e| e.to_string())?;
    fs::rename(&tmp, path).map_err(|e| e.to_string())
}

fn read_json(path: &Path, default: Value) -> Value {
    fs::read(path).ok().and_then(|b| serde_json::from_slice(&b).ok()).unwrap_or(default)
}

// ------------------------------------------------------------------ settings
pub fn settings(root: &Path) -> Value {
    let _g = LOCK.lock().unwrap_or_else(|e| e.into_inner());
    read_json(&root.join("settings.json"), json!({}))
}

pub fn patch_settings(root: &Path, patch: &Value) -> Result<Value, String> {
    let _g = LOCK.lock().unwrap_or_else(|e| e.into_inner());
    let path = root.join("settings.json");
    let mut cur = read_json(&path, json!({}));
    if let (Some(c), Some(p)) = (cur.as_object_mut(), patch.as_object()) {
        for (k, v) in p {
            if v.is_null() {
                c.remove(k);
            } else {
                c.insert(k.clone(), v.clone());
            }
        }
    }
    write_atomic(&path, &serde_json::to_vec_pretty(&cur).map_err(|e| e.to_string())?)?;
    Ok(cur)
}

// ------------------------------------------------------------------ library
fn lib_path(root: &Path) -> PathBuf {
    root.join("library.json")
}
fn load_lib(root: &Path) -> Value {
    let mut v = read_json(&lib_path(root), json!({}));
    if !v["recordings"].is_array() {
        v["recordings"] = json!([]);
    }
    if !v["folders"].is_array() {
        v["folders"] = json!([]);
    }
    v
}
fn save_lib(root: &Path, v: &Value) -> Result<(), String> {
    write_atomic(&lib_path(root), &serde_json::to_vec(v).map_err(|e| e.to_string())?)
}

pub fn library(root: &Path) -> Value {
    let _g = LOCK.lock().unwrap_or_else(|e| e.into_inner());
    load_lib(root)
}

/// Insert a record, or shallow-merge `rec` into the existing record with the same id. Returns the merged record.
pub fn upsert(root: &Path, rec: &Value) -> Result<Value, String> {
    let _g = LOCK.lock().unwrap_or_else(|e| e.into_inner());
    let id = rec["id"].as_str().ok_or("record has no id")?.to_string();
    let mut lib = load_lib(root);
    let arr = lib["recordings"].as_array_mut().unwrap();
    let merged;
    if let Some(existing) = arr.iter_mut().find(|r| r["id"] == id.as_str()) {
        if let (Some(e), Some(p)) = (existing.as_object_mut(), rec.as_object()) {
            for (k, v) in p {
                if v.is_null() {
                    e.remove(k);
                } else {
                    e.insert(k.clone(), v.clone());
                }
            }
        }
        merged = existing.clone();
    } else {
        arr.insert(0, rec.clone());
        merged = rec.clone();
    }
    save_lib(root, &lib)?;
    Ok(merged)
}

pub fn set_folders(root: &Path, folders: &Value) -> Result<(), String> {
    let _g = LOCK.lock().unwrap_or_else(|e| e.into_inner());
    let mut lib = load_lib(root);
    lib["folders"] = folders.clone();
    // Recordings pointing at a deleted folder fall back to "no folder".
    let ids: Vec<String> = folders.as_array().map(|a| a.iter().filter_map(|f| f["id"].as_str().map(String::from)).collect()).unwrap_or_default();
    for r in lib["recordings"].as_array_mut().unwrap().iter_mut() {
        if let Some(f) = r["folderId"].as_str() {
            if !ids.iter().any(|i| i == f) {
                r.as_object_mut().unwrap().remove("folderId");
            }
        }
    }
    save_lib(root, &lib)
}

pub fn remove(root: &Path, id: &str, delete_audio: bool) -> Result<(), String> {
    let _g = LOCK.lock().unwrap_or_else(|e| e.into_inner());
    let mut lib = load_lib(root);
    let arr = lib["recordings"].as_array_mut().unwrap();
    if let Some(pos) = arr.iter().position(|r| r["id"] == id) {
        let rec = arr.remove(pos);
        if delete_audio {
            if let Some(p) = rec["path"].as_str() {
                let _ = fs::remove_file(p);
            }
        }
    }
    let _ = fs::remove_file(transcripts_dir(root).join(format!("{}.json", safe(id))));
    let _ = fs::remove_file(transcripts_dir(root).join(format!("{}.txt", safe(id))));
    save_lib(root, &lib)
}

// ------------------------------------------------------------------ transcripts
fn safe(id: &str) -> String {
    id.chars().filter(|c| c.is_ascii_alphanumeric() || *c == '-' || *c == '_').collect()
}

pub fn save_transcript(root: &Path, id: &str, json_v: &Value, text: &str) -> Result<(), String> {
    let d = transcripts_dir(root);
    write_atomic(&d.join(format!("{}.json", safe(id))), &serde_json::to_vec(json_v).map_err(|e| e.to_string())?)?;
    write_atomic(&d.join(format!("{}.txt", safe(id))), text.as_bytes())
}

pub fn load_transcript(root: &Path, id: &str) -> Option<Value> {
    let b = fs::read(transcripts_dir(root).join(format!("{}.json", safe(id)))).ok()?;
    serde_json::from_slice(&b).ok()
}

/// Drop the leading "Speaker [m:ss]: " label from each saved transcript line.
fn strip_markers(text: &str) -> String {
    text.lines()
        .map(|line| match line.find("]: ") {
            Some(p) => {
                let head = &line[..p];
                match head.rfind(" [") {
                    Some(b) if head[b + 2..].chars().all(|c| c.is_ascii_digit() || c == ':') => &line[p + 3..],
                    _ => line,
                }
            }
            None => line,
        })
        .collect::<Vec<_>>()
        .join(" ")
}

/// Full-text search over titles and transcripts. Returns [{id, snippet}].
pub fn search(root: &Path, query: &str) -> Value {
    let q = query.trim().to_lowercase();
    if q.is_empty() {
        return json!([]);
    }
    let lib = library(root);
    let mut out = vec![];
    for r in lib["recordings"].as_array().unwrap() {
        let id = r["id"].as_str().unwrap_or("");
        let title = r["title"].as_str().unwrap_or("").to_lowercase();
        let text = strip_markers(&fs::read_to_string(transcripts_dir(root).join(format!("{}.txt", safe(id)))).unwrap_or_default());
        let lower = text.to_lowercase();
        let hit = lower.find(&q);
        if title.contains(&q) || hit.is_some() {
            let snippet = hit
                .map(|i| {
                    // Work on char boundaries of the original text.
                    let start = text.char_indices().map(|c| c.0).filter(|&c| c + 60 >= i).next().unwrap_or(0);
                    let s: String = text[start..].chars().take(160).collect();
                    s.replace('\n', " ")
                })
                .unwrap_or_default();
            out.push(json!({ "id": id, "snippet": snippet }));
        }
    }
    Value::Array(out)
}
