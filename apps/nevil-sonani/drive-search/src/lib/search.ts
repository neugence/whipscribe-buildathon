// Full-text search over every transcript segment, grouped by file, each hit
// carrying the second it was said so the result can open at that moment.
import { db } from './db.ts';

export const MARK_START = '\u0001';
export const MARK_END = '\u0002';

// What people type, turned into a safe FTS5 query: every word is a quoted
// term (so punctuation can't break the query), "quoted phrases" stay
// phrases, and the last word matches as a prefix so results come as you type.
export function toFtsQuery(input: string): string | null {
  const parts: { phrase: boolean; text: string }[] = [];
  const re = /"([^"]*)"|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input))) {
    // Letters, digits, spaces, apostrophes and hyphens only: no FTS5 syntax
    // (and no double quote) can survive into the query.
    const text = (m[1] ?? m[2] ?? '').replace(/[^\p{L}\p{N}\s'’-]/gu, ' ').replace(/\s+/g, ' ').trim();
    if (text) parts.push({ phrase: m[1] !== undefined, text });
  }
  if (!parts.length) return null;
  return parts.map((p, i) => (!p.phrase && i === parts.length - 1 ? `"${p.text}"*` : `"${p.text}"`)).join(' ');
}

export interface Hit {
  segmentId: number;
  idx: number;
  start: number;
  end: number;
  speaker: string | null;
  snippet: string; // with MARK_START / MARK_END around matches
}

export interface FileHits {
  fileId: string;
  fileName: string;
  subpath: string;
  folderId: string;
  folderName: string;
  duration: number | null;
  hits: Hit[];
}

export function search(input: string, opts: { folderId?: string | null; limit?: number } = {}): { query: string | null; total: number; files: FileHits[] } {
  const query = toFtsQuery(input);
  if (!query) return { query: null, total: 0, files: [] };
  const rows = db()
    .prepare(
      `SELECT s.id AS segmentId, s.idx, s.start, s.end, s.speaker,
              snippet(segments_fts, 0, char(1), char(2), '…', 18) AS snippet,
              f.id AS fileId, f.name AS fileName, f.subpath, f.duration,
              fo.id AS folderId, fo.name AS folderName
         FROM segments_fts
         JOIN segments s ON s.id = segments_fts.rowid
         JOIN files f ON f.id = s.file_id
         JOIN folders fo ON fo.id = f.folder_id
        WHERE segments_fts MATCH ? AND (? IS NULL OR f.folder_id = ?)
        ORDER BY bm25(segments_fts)
        LIMIT ?`,
    )
    .all(query, opts.folderId ?? null, opts.folderId ?? null, opts.limit ?? 300) as unknown as (Hit & Omit<FileHits, 'hits'>)[];
  // Group by file, best file first; hits inside a file in the order they were said.
  const byFile = new Map<string, FileHits>();
  for (const r of rows) {
    let entry = byFile.get(r.fileId);
    if (!entry) {
      entry = { fileId: r.fileId, fileName: r.fileName, subpath: r.subpath, folderId: r.folderId, folderName: r.folderName, duration: r.duration, hits: [] };
      byFile.set(r.fileId, entry);
    }
    entry.hits.push({ segmentId: r.segmentId, idx: r.idx, start: r.start, end: r.end, speaker: r.speaker, snippet: r.snippet });
  }
  const files = [...byFile.values()];
  files.forEach((f) => f.hits.sort((a, b) => a.start - b.start));
  return { query, total: rows.length, files };
}
