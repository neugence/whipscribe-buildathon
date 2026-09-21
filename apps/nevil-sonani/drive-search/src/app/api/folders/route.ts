import { addFolder } from '@/lib/scan';
import { folderSummaries } from '@/lib/queries';
import { SourceError } from '@/lib/sources/types';
import { json, problem, sameOrigin } from '@/lib/http';

export const dynamic = 'force-dynamic';

export function GET() {
  return json(folderSummaries());
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return problem(403, 'Not allowed from another site');
  const body = (await req.json().catch(() => ({}))) as { kind?: string; id?: string };
  if ((body.kind !== 'drive' && body.kind !== 'local') || !body.id) return problem(400, 'Send { kind, id }');
  try {
    return json(await addFolder(body.kind, body.id));
  } catch (e) {
    if (e instanceof SourceError) return problem(e.kind === 'auth' ? 401 : e.kind === 'gone' ? 404 : 502, e.message);
    return problem(500, (e as Error).message);
  }
}
