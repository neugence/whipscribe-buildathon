import { resumeQueue } from '@/lib/worker';
import { json, problem, sameOrigin } from '@/lib/http';

export function POST(req: Request) {
  if (!sameOrigin(req)) return problem(403, 'Not allowed from another site');
  resumeQueue();
  return json({ ok: true });
}
