import { db } from '@/lib/db';
import { sourceFor } from '@/lib/sources';
import { SourceError } from '@/lib/sources/types';
import { json, param, problem } from '@/lib/http';
import type { PickerListing } from '@/lib/api-types';

export async function GET(req: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const parent = new URL(req.url).searchParams.get('parent') || undefined;
  try {
    const { folders, trail } = await sourceFor(kind).listFolders(parent ? param(parent) : undefined);
    const added = new Set((db().prepare('SELECT id FROM folders').all() as { id: string }[]).map((r) => r.id));
    const body: PickerListing = { folders: folders.map((f) => ({ id: f.id, name: f.name, added: added.has(f.id) })), trail };
    return json(body);
  } catch (e) {
    if (e instanceof SourceError) return problem(e.kind === 'auth' ? 401 : e.kind === 'gone' ? 404 : 502, e.message);
    return problem(500, (e as Error).message);
  }
}
