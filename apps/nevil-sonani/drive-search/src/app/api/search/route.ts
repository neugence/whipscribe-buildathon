import { db } from '@/lib/db';
import { search } from '@/lib/search';
import { json, param } from '@/lib/http';
import type { SearchResponse } from '@/lib/api-types';

export const dynamic = 'force-dynamic';

export function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const q = (sp.get('q') || '').slice(0, 200);
  const folder = sp.get('folder');
  const res = search(q, { folderId: folder ? param(folder) : null });
  const pending = (db().prepare("SELECT COUNT(*) AS n FROM files WHERE status IN ('queued','downloading','uploading','transcribing')").get() as { n: number }).n;
  const body: SearchResponse = {
    q,
    total: res.total,
    pending,
    files: res.files.map((f) => ({ ...f, hits: f.hits.map((h) => ({ start: h.start, speaker: h.speaker, snippet: h.snippet })) })),
  };
  return json(body);
}
