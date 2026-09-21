import { sourceFor } from '@/lib/sources';
import { SourceError } from '@/lib/sources/types';
import { json, param, problem } from '@/lib/http';
import type { FolderPreview } from '@/lib/api-types';

// What is inside a folder before anything is queued: how many recordings the
// person is about to send, and what will be left out and why.
export async function GET(req: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const folder = new URL(req.url).searchParams.get('folder');
  if (!folder) return problem(400, 'Which folder?');
  try {
    const { media, skipped } = await sourceFor(kind).listMedia(param(folder));
    const body: FolderPreview = {
      count: media.length,
      bytes: media.reduce((a, m) => a + (m.size ?? 0), 0),
      skipped: skipped.map((s) => ({ name: s.subpath ? `${s.subpath}/${s.name}` : s.name, reason: s.reason })),
      sample: media.slice(0, 5).map((m) => (m.subpath ? `${m.subpath}/${m.name}` : m.name)),
    };
    return json(body);
  } catch (e) {
    if (e instanceof SourceError) return problem(e.kind === 'auth' ? 401 : e.kind === 'gone' ? 404 : 502, e.message);
    return problem(500, (e as Error).message);
  }
}
