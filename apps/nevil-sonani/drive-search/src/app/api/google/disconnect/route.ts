import { disconnectDrive } from '@/lib/sources/drive';
import { json, problem, sameOrigin } from '@/lib/http';

export function POST(req: Request) {
  if (!sameOrigin(req)) return problem(403, 'Not allowed from another site');
  disconnectDrive();
  return json({ ok: true });
}
