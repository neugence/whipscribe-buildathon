import { cookies } from 'next/headers';
import { driveConfigured, startAuth } from '@/lib/sources/drive';
import { problem } from '@/lib/http';

// Send the person to Google. State and the PKCE verifier ride in short-lived,
// httpOnly cookies and are checked when Google sends them back.
export async function GET() {
  if (!driveConfigured()) return problem(400, 'Google Drive is not set up: add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local');
  const { url, state, verifier } = startAuth();
  const jar = await cookies();
  const opts = { httpOnly: true, sameSite: 'lax' as const, path: '/api/google', maxAge: 600 };
  jar.set('g_state', state, opts);
  jar.set('g_verifier', verifier, opts);
  return Response.redirect(url, 302);
}
