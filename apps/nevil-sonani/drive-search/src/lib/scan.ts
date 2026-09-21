// Scanning a folder: compare what the source has now with what we have, queue
// what is new or changed, and remember what was skipped and why.
import { db, getFolder, now, tx, type FileRow } from './db.ts';
import { sourceFor } from './sources/index.ts';
import { SourceError } from './sources/types.ts';

export const SCAN_EVERY_MS = 10 * 60_000;

export interface ScanResult {
  added: number;
  changed: number;
  removed: number;
  skipped: number;
}

export async function addFolder(kind: 'drive' | 'local', id: string): Promise<{ folderId: string; scan: ScanResult }> {
  const source = sourceFor(kind);
  const info = await source.getFolder(id);
  db()
    .prepare(`INSERT INTO folders (id, source, name, web_url, added_at, watching) VALUES (?, ?, ?, ?, ?, 1)
      ON CONFLICT(id) DO UPDATE SET name = excluded.name, web_url = excluded.web_url, watching = 1`)
    .run(info.id, kind, info.name, info.webUrl ?? null, now());
  return { folderId: info.id, scan: await scanFolder(info.id) };
}

export async function scanFolder(folderId: string): Promise<ScanResult> {
  const folder = getFolder(folderId);
  if (!folder) throw new Error('Unknown folder');
  let listing;
  try {
    listing = await sourceFor(folder.source).listMedia(folder.id);
  } catch (e) {
    const message = e instanceof SourceError ? e.message : 'Could not read the folder';
    db().prepare('UPDATE folders SET scan_error = ?, last_scan_at = ? WHERE id = ?').run(message, now(), folderId);
    throw e;
  }
  const result: ScanResult = { added: 0, changed: 0, removed: 0, skipped: 0 };
  const t = now();
  tx(() => {
    const rows = db().prepare('SELECT id, version, status FROM files WHERE folder_id = ?').all(folderId) as unknown as Pick<FileRow, 'id' | 'version' | 'status'>[];
    const existing = new Map(rows.map((r) => [r.id, r]));
    const seen = new Set<string>();
    const insert = db().prepare(`INSERT INTO files (id, folder_id, name, subpath, mime, size, modified_at, version, web_url, status, error, added_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET folder_id = excluded.folder_id, name = excluded.name, subpath = excluded.subpath`);

    for (const m of listing.media) {
      seen.add(m.id);
      const ex = existing.get(m.id);
      if (!ex) {
        insert.run(m.id, folderId, m.name, m.subpath, m.mime, m.size, m.modifiedAt, m.version, m.webUrl ?? null, 'queued', null, t, t);
        result.added++;
      } else if (ex.version !== m.version && ex.status !== 'queued') {
        // The bytes changed in the source: transcribe the new version.
        db().prepare(`UPDATE files SET name = ?, subpath = ?, size = ?, modified_at = ?, version = ?, status = 'queued', progress = NULL,
          job_id = NULL, error = NULL, error_code = NULL, attempts = 0, next_try_at = NULL, updated_at = ? WHERE id = ?`)
          .run(m.name, m.subpath, m.size, m.modifiedAt, m.version, t, m.id);
        result.changed++;
      } else if (ex.status === 'removed') {
        const hasText = db().prepare('SELECT 1 FROM segments WHERE file_id = ? LIMIT 1').get(m.id);
        db().prepare('UPDATE files SET status = ?, updated_at = ? WHERE id = ?').run(hasText ? 'done' : 'queued', t, m.id);
      } else {
        db().prepare('UPDATE files SET name = ?, subpath = ? WHERE id = ?').run(m.name, m.subpath, m.id);
      }
    }
    for (const s of listing.skipped) {
      seen.add(s.id);
      if (!existing.has(s.id)) {
        insert.run(s.id, folderId, s.name, s.subpath, null, null, null, null, null, 'skipped', s.reason, t, t);
        result.skipped++;
      }
    }
    // Gone from the source: keep the transcript, say where it went.
    for (const [id, ex] of existing) {
      if (!seen.has(id) && ex.status !== 'removed') {
        if (ex.status === 'skipped' || ex.status === 'queued') db().prepare('DELETE FROM files WHERE id = ?').run(id);
        else db().prepare("UPDATE files SET status = 'removed', updated_at = ? WHERE id = ?").run(t, id);
        result.removed++;
      }
    }
    db().prepare('UPDATE folders SET last_scan_at = ?, scan_error = NULL WHERE id = ?').run(t, folderId);
  });
  return result;
}

export async function rescanDueFolders(): Promise<void> {
  const due = db().prepare('SELECT id FROM folders WHERE watching = 1 AND (last_scan_at IS NULL OR last_scan_at < ?)').all(now() - SCAN_EVERY_MS) as { id: string }[];
  for (const f of due) {
    await scanFolder(f.id).catch(() => { /* recorded on the folder */ });
  }
}
