import { scanFolder } from '@/lib/scan';
import { SourceError } from '@/lib/sources/types';
import { json, param, problem, sameOrigin } from '@/lib/http';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return problem(403, 'Not allowed from another site');
  try {
    return json(await scanFolder(param((await params).id)));
  } catch (e) {
    if (e instanceof SourceError) return problem(e.kind === 'auth' ? 401 : e.kind === 'gone' ? 404 : 502, e.message);
    return problem(500, (e as Error).message);
  }
}
