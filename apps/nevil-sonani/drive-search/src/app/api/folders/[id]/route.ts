import { db } from '@/lib/db';
import { folderDetail } from '@/lib/queries';
import { json, param, problem, sameOrigin } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const detail = folderDetail(param((await params).id));
  return detail ? json(detail) : problem(404, 'No such folder');
}

// Stop watching a folder and forget its transcripts here. Nothing is deleted
// from Drive or from the WhipScribe account.
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return problem(403, 'Not allowed from another site');
  db().prepare('DELETE FROM folders WHERE id = ?').run(param((await params).id));
  return json({ ok: true });
}
