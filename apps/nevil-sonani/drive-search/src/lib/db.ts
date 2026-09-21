// One SQLite file holds everything: the folders being watched, every file's
// place in the queue, and the transcript segments with a full-text index.
// node:sqlite ships with Node 22.13+, so there is no native module to build.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

export type FileStatus =
  | 'queued' // waiting for a free slot
  | 'downloading' // bytes coming from the source
  | 'uploading' // bytes going to WhipScribe
  | 'transcribing' // WhipScribe has it; polling the job
  | 'done'
  | 'failed'
  | 'skipped' // not audio or video, or too large
  | 'removed'; // gone from the source; the transcript is kept

export interface FolderRow {
  id: string;
  source: 'drive' | 'local';
  name: string;
  web_url: string | null;
  added_at: number;
  last_scan_at: number | null;
  scan_error: string | null;
  watching: number;
}

export interface FileRow {
  id: string;
  folder_id: string;
  name: string;
  subpath: string;
  mime: string | null;
  size: number | null;
  modified_at: number | null;
  version: string | null;
  web_url: string | null;
  status: FileStatus;
  progress: number | null;
  job_id: string | null;
  claim_token: string | null;
  error_code: string | null;
  error: string | null;
  attempts: number;
  round: number;
  next_try_at: number | null;
  last_poll_at: number | null;
  duration: number | null;
  speech_detected: number | null;
  speech_ratio: number | null;
  language: string | null;
  added_at: number;
  updated_at: number;
  done_at: number | null;
}

export interface SegmentRow {
  id: number;
  file_id: string;
  idx: number;
  start: number;
  end: number;
  speaker: string | null;
  text: string;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  name TEXT NOT NULL,
  web_url TEXT,
  added_at INTEGER NOT NULL,
  last_scan_at INTEGER,
  scan_error TEXT,
  watching INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subpath TEXT NOT NULL DEFAULT '',
  mime TEXT,
  size INTEGER,
  modified_at INTEGER,
  version TEXT,
  web_url TEXT,
  status TEXT NOT NULL,
  progress REAL,
  job_id TEXT,
  claim_token TEXT,
  error_code TEXT,
  error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  round INTEGER NOT NULL DEFAULT 0, -- bumped by an explicit retry: a new Idempotency-Key
  next_try_at INTEGER,
  last_poll_at INTEGER,
  duration REAL,
  speech_detected INTEGER,
  speech_ratio REAL,
  language TEXT,
  added_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  done_at INTEGER
);
CREATE INDEX IF NOT EXISTS files_by_folder ON files(folder_id, status);
CREATE INDEX IF NOT EXISTS files_by_status ON files(status, next_try_at);

CREATE TABLE IF NOT EXISTS segments (
  id INTEGER PRIMARY KEY,
  file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  idx INTEGER NOT NULL,
  start REAL NOT NULL,
  end REAL NOT NULL,
  speaker TEXT,
  text TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS segments_by_file ON segments(file_id, idx);

-- Porter stemming, so "prices" finds "pricing".
CREATE VIRTUAL TABLE IF NOT EXISTS segments_fts USING fts5(
  text, content='segments', content_rowid='id', tokenize='porter unicode61'
);
CREATE TRIGGER IF NOT EXISTS segments_ai AFTER INSERT ON segments BEGIN
  INSERT INTO segments_fts(rowid, text) VALUES (new.id, new.text);
END;
CREATE TRIGGER IF NOT EXISTS segments_ad AFTER DELETE ON segments BEGIN
  INSERT INTO segments_fts(segments_fts, rowid, text) VALUES ('delete', old.id, old.text);
END;

CREATE TABLE IF NOT EXISTS insights (
  file_id TEXT PRIMARY KEY REFERENCES files(id) ON DELETE CASCADE,
  summary TEXT,
  topics TEXT,
  quotes TEXT
);
`;

const g = globalThis as unknown as { __driveSearchDb?: DatabaseSync };

// Next's dev server re-evaluates modules on every edit; keep one connection
// per process so the worker and the routes share it.
export function db(): DatabaseSync {
  if (g.__driveSearchDb) return g.__driveSearchDb;
  const dir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  fs.mkdirSync(dir, { recursive: true });
  const conn = new DatabaseSync(path.join(dir, 'drive-search.db'));
  conn.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  conn.exec(SCHEMA);
  g.__driveSearchDb = conn;
  return conn;
}

export const now = () => Date.now();

export function kvGet(key: string): string | null {
  const row = db().prepare('SELECT value FROM kv WHERE key = ?').get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

export function kvSet(key: string, value: string | null): void {
  if (value === null) db().prepare('DELETE FROM kv WHERE key = ?').run(key);
  else db().prepare('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
}

export function updateFile(id: string, patch: Partial<FileRow>): void {
  const keys = Object.keys(patch) as (keyof FileRow)[];
  if (!keys.length) return;
  const sets = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => patch[k] as string | number | null);
  db().prepare(`UPDATE files SET ${sets}, updated_at = ? WHERE id = ?`).run(...values, now(), id);
}

export function getFile(id: string): FileRow | undefined {
  return db().prepare('SELECT * FROM files WHERE id = ?').get(id) as unknown as FileRow | undefined;
}

export function getFolder(id: string): FolderRow | undefined {
  return db().prepare('SELECT * FROM folders WHERE id = ?').get(id) as unknown as FolderRow | undefined;
}

// Run fn in one transaction; node:sqlite has no helper for it.
export function tx<T>(fn: () => T): T {
  const conn = db();
  conn.exec('BEGIN IMMEDIATE');
  try {
    const out = fn();
    conn.exec('COMMIT');
    return out;
  } catch (e) {
    conn.exec('ROLLBACK');
    throw e;
  }
}
