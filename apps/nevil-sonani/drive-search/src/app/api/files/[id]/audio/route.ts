import { getFile } from '@/lib/db';
import { getAudioUrl, WhipScribeError } from '@/lib/whipscribe';
import { param, problem } from '@/lib/http';

// The <audio> element points here. Each request gets a fresh, short-lived
// WhipScribe URL, so an expired one heals itself on the next load.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const f = getFile(param((await params).id));
  if (!f?.job_id) return problem(404, 'No audio for this file');
  try {
    const { url } = await getAudioUrl(f.job_id, f.claim_token);
    return new Response(null, { status: 307, headers: { Location: url, 'Cache-Control': 'no-store' } });
  } catch (e) {
    if (e instanceof WhipScribeError && e.status === 410) return problem(410, 'The audio is no longer kept for this file');
    return problem(502, 'Could not get the audio from WhipScribe');
  }
}
