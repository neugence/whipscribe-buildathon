import { retryFile } from '@/lib/worker';
import { json, param, problem, sameOrigin } from '@/lib/http';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return problem(403, 'Not allowed from another site');
  retryFile(param((await params).id));
  return json({ ok: true });
}
