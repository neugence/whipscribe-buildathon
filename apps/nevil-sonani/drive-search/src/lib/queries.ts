// Read models for the pages and the JSON routes, so both show the same thing.
import { db, getFile, kvGet, type FileRow, type FolderRow, type SegmentRow } from './db.ts';
import { pausedReason } from './worker.ts';
import { driveAccount, driveConfigured } from './sources/drive.ts';
import { availableSources } from './sources/index.ts';
import { hasApiKey } from './whipscribe.ts';
import type { AppStatus, FileItem, FolderDetail, FolderSummary, TranscriptData } from './api-types.ts';

const ACTIVE = ['queued', 'downloading', 'uploading', 'transcribing'];

export function folderSummaries(): FolderSummary[] {
  const folders = db().prepare('SELECT * FROM folders ORDER BY added_at DESC').all() as unknown as FolderRow[];
  const counts = db()
    .prepare(`SELECT folder_id, status, COUNT(*) AS n, SUM(COALESCE(duration, 0)) AS secs,
      SUM(CASE WHEN error_code IS NOT NULL AND status = 'queued' THEN 1 ELSE 0 END) AS retrying
      FROM files GROUP BY folder_id, status`)
    .all() as { folder_id: string; status: string; n: number; secs: number; retrying: number }[];
  return folders.map((f) => {
    const mine = counts.filter((c) => c.folder_id === f.id);
    const n = (s: string) => mine.find((c) => c.status === s)?.n ?? 0;
    const active = mine.filter((c) => ACTIVE.includes(c.status)).reduce((a, c) => a + c.n, 0);
    return {
      id: f.id,
      source: f.source,
      name: f.name,
      webUrl: f.web_url,
      lastScanAt: f.last_scan_at,
      scanError: f.scan_error,
      done: n('done'),
      active,
      failed: n('failed'),
      skipped: n('skipped'),
      removed: n('removed'),
      total: mine.filter((c) => c.status !== 'skipped').reduce((a, c) => a + c.n, 0),
      seconds: mine.find((c) => c.status === 'done')?.secs ?? 0,
    };
  });
}

export function toItem(r: FileRow): FileItem {
  return {
    id: r.id,
    name: r.name,
    subpath: r.subpath,
    status: r.status,
    progress: r.progress,
    size: r.size,
    duration: r.duration,
    error: r.error,
    errorCode: r.error_code,
    noSpeech: r.speech_detected === 0,
    retryAt: r.status === 'queued' && r.next_try_at && r.next_try_at > Date.now() ? r.next_try_at : null,
    webUrl: r.web_url,
    doneAt: r.done_at,
  };
}

export function folderDetail(id: string): FolderDetail | null {
  const summary = folderSummaries().find((f) => f.id === id);
  if (!summary) return null;
  const rows = db()
    .prepare('SELECT * FROM files WHERE folder_id = ? ORDER BY subpath, name COLLATE NOCASE')
    .all(id) as unknown as FileRow[];
  return { ...summary, files: rows.map(toItem) };
}

export function appStatus(): AppStatus {
  const totals = db()
    .prepare(`SELECT
      SUM(CASE WHEN status IN ('queued','downloading','uploading','transcribing') THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed
      FROM files`)
    .get() as { active: number | null; done: number | null; failed: number | null };
  return {
    paused: pausedReason(),
    sources: availableSources(),
    drive: { configured: driveConfigured(), ...driveAccount() },
    whipscribe: { hasKey: hasApiKey() },
    active: totals.active ?? 0,
    done: totals.done ?? 0,
    failed: totals.failed ?? 0,
    folders: (db().prepare('SELECT COUNT(*) AS n FROM folders').get() as { n: number }).n,
    lastError: kvGet('last_error'),
  };
}

export function transcript(id: string): TranscriptData | null {
  const f = getFile(id);
  if (!f) return null;
  const folder = db().prepare('SELECT id, name, source FROM folders WHERE id = ?').get(f.folder_id) as { id: string; name: string; source: string };
  // node:sqlite rows have a null prototype, which React will not pass to a
  // client component; copy them into plain objects.
  const segments = (db()
    .prepare('SELECT idx, start, end, speaker, text FROM segments WHERE file_id = ? ORDER BY idx')
    .all(id) as unknown as Pick<SegmentRow, 'idx' | 'start' | 'end' | 'speaker' | 'text'>[])
    .map((s) => ({ idx: s.idx, start: s.start, end: s.end, speaker: s.speaker, text: s.text }));
  const ins = db().prepare('SELECT summary, topics, quotes FROM insights WHERE file_id = ?').get(id) as { summary: string | null; topics: string; quotes: string } | undefined;
  return {
    file: toItem(f),
    folder: { id: folder.id, name: folder.name, source: folder.source },
    language: f.language,
    hasAudio: !!f.job_id,
    segments,
    insights: ins ? { summary: ins.summary, topics: JSON.parse(ins.topics || '[]'), quotes: JSON.parse(ins.quotes || '[]') } : null,
  };
}
