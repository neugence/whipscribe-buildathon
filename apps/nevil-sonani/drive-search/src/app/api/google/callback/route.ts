import { cookies } from 'next/headers';
import { appUrl, finishAuth } from '@/lib/sources/drive';
import { SourceError } from '@/lib/sources/types';
import { kvSet } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jar = await cookies();
  const state = jar.get('g_state')?.value;
  const verifier = jar.get('g_verifier')?.value;
  jar.delete('g_state');
  jar.delete('g_verifier');
  const back = (path: string) => Response.redirect(`${appUrl()}${path}`, 302);

  const error = url.searchParams.get('error');
  if (error) return back(`/?drive=${error === 'access_denied' ? 'cancelled' : 'failed'}`);
  if (!state || !verifier || state !== url.searchParams.get('state')) return back('/?drive=expired');
  try {
    await finishAuth(url.searchParams.get('code') || '', verifier);
  } catch (e) {
    return back(`/?drive=${encodeURIComponent(e instanceof SourceError ? e.message : 'failed')}`);
  }
  kvSet('paused', null); // a pause caused by Drive ends once Drive is back
  return back('/pick?source=drive');
}
