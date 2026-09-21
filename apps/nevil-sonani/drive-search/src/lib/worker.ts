// The queue. It runs in the server process, not the browser, and keeps its
// state in the database, so closing the tab changes nothing and a restart
// picks up where it stopped.
//
//   queued → downloading → uploading → transcribing → done
//                                     ↘ failed (with the reason, and Retry)
import os from 'node:os';
import path from 'node:path';
import fsp from 'node:fs/promises';
import { db, getFolder, kvGet, kvSet, now, tx, updateFile, type FileRow } from './db.ts';
import * as ws from './whipscribe.ts';
import { sourceFor } from './sources/index.ts';
import { SourceError } from './sources/types.ts';
import { rescanDueFolders } from './scan.ts';

const TRANSFERS = 2; // files moving bytes at the same time
const POLL_MS = 3000; // the docs' recommended poll cadence
const MAX_ATTEMPTS = 5;

type Paused = 'credit' | 'quota' | 'drive';

const g = globalThis as unknown as { __driveSearchWorker?: { busy: Set<string>; timers: NodeJS.Timeout[] } };

export function startWorker(): void {
  if (g.__driveSearchWorker) return;
  g.__driveSearchWorker = { busy: new Set(), timers: [] };
  // Anything caught mid-transfer by a restart starts that transfer again. If
  // the upload had in fact reached WhipScribe, the same Idempotency-Key gets
  // the original job back rather than a second one.
  db().prepare("UPDATE files SET status = 'queued', progress = NULL WHERE status IN ('downloading', 'uploading')").run();
  const w = g.__driveSearchWorker;
  w.timers.push(setInterval(() => tick().catch((e) => console.error('[worker]', e)), 1000));
  w.timers.push(setInterval(() => rescanDueFolders().catch((e) => console.error('[scan]', e)), 60_000));
}

export function pausedReason(): Paused | null {
  return kvGet('paused') as Paused | null;
}

export function resumeQueue(): void {
  kvSet('paused', null);
  db().prepare("UPDATE files SET next_try_at = NULL WHERE status = 'queued'").run();
}

// Try a failed file again. A new round means a new Idempotency-Key, so
// WhipScribe starts a fresh job instead of returning the failed one.
export function retryFile(id: string): void {
  db().prepare(`UPDATE files SET status = 'queued', progress = NULL, error = NULL, error_code = NULL, attempts = 0,
    round = round + 1, next_try_at = NULL, job_id = NULL, updated_at = ? WHERE id = ? AND status = 'failed'`).run(now(), id);
}

export function retryFolder(folderId: string): number {
  const ids = db().prepare("SELECT id FROM files WHERE folder_id = ? AND status = 'failed'").all(folderId) as { id: string }[];
  ids.forEach((r) => retryFile(r.id));
  return ids.length;
}

async function tick(): Promise<void> {
  const busy = g.__driveSearchWorker!.busy;

  // Jobs WhipScribe is working on: poll each one every 3 seconds.
  const polling = db()
    .prepare("SELECT * FROM files WHERE status = 'transcribing' AND (last_poll_at IS NULL OR last_poll_at <= ?) LIMIT 25")
    .all(now() - POLL_MS) as unknown as FileRow[];
  for (const f of polling) {
    if (busy.has(f.id)) continue;
    busy.add(f.id);
    poll(f).finally(() => busy.delete(f.id));
  }

  if (pausedReason()) return;

  // Start new transfers while there is a free slot.
  const moving = (db().prepare("SELECT COUNT(*) AS n FROM files WHERE status IN ('downloading', 'uploading')").get() as { n: number }).n;
  if (moving >= TRANSFERS) return;
  const next = db()
    .prepare("SELECT * FROM files WHERE status = 'queued' AND (next_try_at IS NULL OR next_try_at <= ?) ORDER BY added_at, subpath, name LIMIT ?")
    .all(now(), TRANSFERS - moving) as unknown as FileRow[];
  for (const f of next) {
    if (busy.has(f.id)) continue;
    busy.add(f.id);
    // Claimed synchronously, before any await, so the next tick can't pick it too.
    updateFile(f.id, { status: 'downloading', progress: 0, error: null, error_code: null, attempts: f.attempts + 1 });
    transfer(f).finally(() => busy.delete(f.id));
  }
}

const idempotencyKey = (f: FileRow) =>
  `drive-search:${f.id}:${f.version ?? 'v1'}:r${f.round}`.replace(/[^A-Za-z0-9_.:/-]/g, '-').slice(0, 255);

async function transfer(f: FileRow): Promise<void> {
  const folder = getFolder(f.folder_id);
  if (!folder) return;
  const ext = path.extname(f.name).toLowerCase();
  const tmp = path.join(os.tmpdir(), 'drive-search', `${f.id.replace(/[^A-Za-z0-9_-]/g, '_')}${ext}`);
  try {
    await fsp.mkdir(path.dirname(tmp), { recursive: true });
    let shown = 0;
    await sourceFor(folder.source).download({ id: f.id, name: f.name }, tmp, (bytes) => {
      if (!f.size) return;
      const pct = Math.min(99, (bytes / f.size) * 100);
      if (pct - shown >= 3) {
        shown = pct;
        updateFile(f.id, { progress: pct });
      }
    });
    updateFile(f.id, { status: 'uploading', progress: null });
    const job = await ws.submitFile({ filePath: tmp, filename: f.name, mime: f.mime || '', idempotencyKey: idempotencyKey(f) });
    updateFile(f.id, { status: 'transcribing', progress: 0, job_id: job.job_id, claim_token: job.claim_token ?? null, last_poll_at: now() });
  } catch (e) {
    fail(f, e);
  } finally {
    await fsp.rm(tmp, { force: true }).catch(() => {});
  }
}

async function poll(f: FileRow): Promise<void> {
  try {
    const job = await ws.getJob(f.job_id!, f.claim_token);
    updateFile(f.id, { last_poll_at: now(), progress: job.progress });
    if (job.status === 'done') await finish(f, job);
    else if (job.status === 'failed') {
      updateFile(f.id, { status: 'failed', error_code: 'JOB_FAILED', error: job.error || 'WhipScribe could not transcribe this file.' });
    }
  } catch (e) {
    if (e instanceof ws.WhipScribeError && e.status === 404) {
      updateFile(f.id, { status: 'failed', error_code: 'JOB_GONE', error: 'WhipScribe no longer has this job. Try again to send the file afresh.' });
      return;
    }
    // Transient: poll again a little later.
    updateFile(f.id, { last_poll_at: now() + 10_000 });
  }
}

async function finish(f: FileRow, job: ws.JobStatus): Promise<void> {
  const result = await ws.getResult(f.job_id!, f.claim_token);
  const speech = result.speech_detected ?? job.speech_detected;
  tx(() => {
    db().prepare('DELETE FROM segments WHERE file_id = ?').run(f.id);
    const insert = db().prepare('INSERT INTO segments (file_id, idx, start, end, speaker, text) VALUES (?, ?, ?, ?, ?, ?)');
    result.segments.forEach((s, i) => {
      if (s.text) insert.run(f.id, i, s.start, s.end, s.speaker, s.text);
    });
    updateFile(f.id, {
      status: 'done',
      progress: 100,
      done_at: now(),
      duration: result.duration ?? job.audio_duration_seconds ?? null,
      speech_detected: speech === false ? 0 : 1,
      speech_ratio: result.speech_ratio ?? job.speech_ratio ?? null,
      language: result.language,
      // A paywalled job returns only the opening; say so on the file.
      error_code: job.locked ? 'LOCKED' : null,
      error: job.locked ? 'Preview only. Add credit on WhipScribe to open the whole transcript.' : null,
    });
  });
  // Summary, topics and quotes are extra. If they fail, the transcript stands.
  ws.getInsights(f.job_id!, f.claim_token)
    .then((ins) => {
      if (!ins) return;
      db().prepare('INSERT OR REPLACE INTO insights (file_id, summary, topics, quotes) VALUES (?, ?, ?, ?)')
        .run(f.id, ins.summary ?? null, JSON.stringify(ins.topics ?? []), JSON.stringify(ins.quotes ?? []));
    })
    .catch(() => {});
}

function backoff(attempt: number, hintMs?: number): number {
  return hintMs ?? Math.min(10 * 60_000, 5000 * 2 ** attempt);
}

function fail(f: FileRow, e: unknown): void {
  const attempt = f.attempts + 1;
  if (e instanceof ws.WhipScribeError) {
    const d = ws.describeError(e);
    if (d.pauseQueue) {
      // Out of credit or free minutes: stop everything, keep this file first in line.
      kvSet('paused', d.pauseQueue);
      updateFile(f.id, { status: 'queued', progress: null, error_code: e.code, error: d.message, attempts: f.attempts });
      return;
    }
    if (e.retryable && attempt < MAX_ATTEMPTS) {
      updateFile(f.id, { status: 'queued', progress: null, error_code: e.code, error: d.message, next_try_at: now() + backoff(attempt, e.retryAfterMs) });
      return;
    }
    updateFile(f.id, { status: 'failed', progress: null, error_code: e.code, error: d.message });
    return;
  }
  if (e instanceof SourceError) {
    if (e.kind === 'auth') {
      kvSet('paused', 'drive');
      updateFile(f.id, { status: 'queued', progress: null, error_code: 'DRIVE_AUTH', error: e.message, attempts: f.attempts });
      return;
    }
    if (e.kind === 'gone') {
      updateFile(f.id, { status: 'removed', progress: null, error_code: 'GONE', error: e.message });
      return;
    }
  }
  const message = e instanceof Error ? e.message : 'Something went wrong';
  if (attempt < MAX_ATTEMPTS) {
    updateFile(f.id, { status: 'queued', progress: null, error_code: 'RETRYING', error: `${message}. Trying again.`, next_try_at: now() + backoff(attempt) });
  } else {
    updateFile(f.id, { status: 'failed', progress: null, error_code: 'GAVE_UP', error: message });
  }
}
