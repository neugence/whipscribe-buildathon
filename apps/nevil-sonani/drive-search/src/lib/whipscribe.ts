// The WhipScribe API, as documented at https://whipscribe.com/docs and as it
// actually answered when I tested it (see docs/real-responses.md). Server-side
// only: the key never reaches the browser.
import fs from 'node:fs';

const BASE = (process.env.WHIPSCRIBE_API_BASE || 'https://whipscribe.com/api/v1').replace(/\/$/, '');
const apiKey = () => (process.env.WHIPSCRIBE_API_KEY || '').trim();
export const hasApiKey = () => apiKey().length > 0;

export class WhipScribeError extends Error {
  status: number;
  code: string;
  retryAfterMs?: number;
  constructor(status: number, code: string, message: string, retryAfterMs?: number) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryAfterMs = retryAfterMs;
  }
  // 429s and server-side failures are worth retrying; the rest are not.
  get retryable(): boolean {
    return this.status === 0 || this.status === 429 || this.status >= 500;
  }
}

export interface SubmitResponse {
  job_id: string;
  status: string;
  claim_token?: string;
}

export interface JobStatus {
  job_id: string;
  status: 'queued' | 'processing' | 'done' | 'failed' | string;
  progress: number; // normalised to 0–100
  audio_duration_seconds?: number;
  speech_detected?: boolean;
  speech_ratio?: number;
  locked: boolean;
  error: string | null;
}

export interface ResultSegment {
  start: number;
  end: number;
  text: string;
  speaker: string | null;
  words: { start: number; end: number; text: string }[] | null;
}

export interface TranscriptResult {
  text: string;
  language: string | null;
  segments: ResultSegment[];
  speech_detected?: boolean;
  speech_ratio?: number;
  duration?: number;
}

export interface Insights {
  summary?: string;
  topics?: string[];
  quotes?: { speaker?: string; text: string; start?: number }[];
}

function headers(extra: Record<string, string> = {}, claimToken?: string | null): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/json', ...extra };
  if (apiKey()) h['X-API-Key'] = apiKey();
  // Jobs submitted without a key are proven ours with the claim token.
  if (claimToken) h['X-Claim-Token'] = claimToken;
  return h;
}

async function fail(res: Response): Promise<never> {
  let code = `HTTP_${res.status}`;
  let message = res.statusText || 'Request failed';
  try {
    const body = (await res.json()) as { error?: string; code?: string; detail?: string };
    code = body.code || code;
    message = body.error || body.detail || message;
  } catch {
    /* not JSON */
  }
  const ra = Number(res.headers.get('retry-after'));
  throw new WhipScribeError(res.status, code, message, Number.isFinite(ra) && ra > 0 ? ra * 1000 : undefined);
}

async function request(path: string, init: RequestInit & { claimToken?: string | null; extraHeaders?: Record<string, string> } = {}): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers: headers(init.extraHeaders, init.claimToken), cache: 'no-store' });
  } catch (e) {
    throw new WhipScribeError(0, 'NETWORK', `Could not reach WhipScribe: ${(e as Error).message}`);
  }
  if (!res.ok) await fail(res);
  return res;
}

// POST /transcribe, multipart. The file streams from disk (openAsBlob), so a
// 2 GB video is never held in memory. The Idempotency-Key makes a retry after
// a dropped connection return the original job instead of a second one.
export async function submitFile(opts: {
  filePath: string;
  filename: string;
  mime: string;
  idempotencyKey: string;
  language?: string;
}): Promise<SubmitResponse> {
  const blob = await fs.openAsBlob(opts.filePath, { type: opts.mime || 'application/octet-stream' });
  const form = new FormData();
  form.append('file', blob, opts.filename);
  if (opts.language && opts.language !== 'auto') form.append('language', opts.language);
  form.append('source', 'api');
  const res = await request('/transcribe', { method: 'POST', body: form, extraHeaders: { 'Idempotency-Key': opts.idempotencyKey } });
  return (await res.json()) as SubmitResponse;
}

// The docs describe progress as 0.0–1.0; the API answered 5 and 100. Accept both.
export function normaliseProgress(p: unknown): number {
  const n = typeof p === 'number' && Number.isFinite(p) ? p : 0;
  return Math.max(0, Math.min(100, n <= 1 ? n * 100 : n));
}

export async function getJob(jobId: string, claimToken?: string | null): Promise<JobStatus> {
  const res = await request(`/jobs/${encodeURIComponent(jobId)}`, { claimToken });
  const raw = (await res.json()) as Record<string, unknown>;
  return {
    job_id: String(raw.job_id ?? jobId),
    status: String(raw.status ?? 'queued'),
    progress: raw.status === 'done' ? 100 : normaliseProgress(raw.progress),
    audio_duration_seconds: typeof raw.audio_duration_seconds === 'number' ? raw.audio_duration_seconds : undefined,
    speech_detected: typeof raw.speech_detected === 'boolean' ? raw.speech_detected : undefined,
    speech_ratio: typeof raw.speech_ratio === 'number' ? raw.speech_ratio : undefined,
    // A finished job only carries "locked" when it is paywalled; absent means open.
    locked: raw.locked === true,
    error: typeof raw.error === 'string' ? raw.error : null,
  };
}

export async function getResult(jobId: string, claimToken?: string | null): Promise<TranscriptResult> {
  const res = await request(`/jobs/${encodeURIComponent(jobId)}/result?format=json`, { claimToken });
  const raw = (await res.json()) as Record<string, unknown>;
  const segments = Array.isArray(raw.segments) ? (raw.segments as Record<string, unknown>[]) : [];
  return {
    text: typeof raw.text === 'string' ? raw.text : '',
    language: typeof raw.language === 'string' ? raw.language : null,
    speech_detected: typeof raw.speech_detected === 'boolean' ? raw.speech_detected : undefined,
    speech_ratio: typeof raw.speech_ratio === 'number' ? raw.speech_ratio : undefined,
    duration: typeof raw.duration === 'number' ? raw.duration : undefined,
    segments: segments.map((s) => ({
      start: Number(s.start) || 0,
      end: Number(s.end) || 0,
      text: String(s.text ?? '').trim(),
      // Both came back null in my test even with diarize=true; keep them optional.
      speaker: typeof s.speaker === 'string' ? s.speaker : null,
      words: Array.isArray(s.words) ? (s.words as ResultSegment['words']) : null,
    })),
  };
}

// Summary, topics and key quotes. Answers 402 while a transcript is locked.
export async function getInsights(jobId: string, claimToken?: string | null): Promise<Insights | null> {
  try {
    const res = await request(`/jobs/${encodeURIComponent(jobId)}/insights`, { claimToken });
    const raw = (await res.json()) as { insights?: Insights };
    return raw.insights ?? null;
  } catch (e) {
    if (e instanceof WhipScribeError && (e.status === 402 || e.status === 404)) return null;
    throw e;
  }
}

// A short-lived URL an <audio> element can stream from (Range supported).
export async function getAudioUrl(jobId: string, claimToken?: string | null): Promise<{ url: string; expiresIn: number }> {
  const res = await request(`/jobs/${encodeURIComponent(jobId)}/audio/url`, { claimToken });
  const raw = (await res.json()) as { url?: string; storage?: string; expires_in?: number };
  if (!raw.url) throw new WhipScribeError(410, 'AUDIO_MISSING', 'No audio URL returned');
  // "disk" storage returns a backend-relative path; the docs say to prefix it.
  const url = raw.storage === 'disk' && raw.url.startsWith('/') ? `${new URL(BASE).origin}/api${raw.url}` : raw.url;
  return { url, expiresIn: raw.expires_in ?? 600 };
}

export async function whoAmI(): Promise<{ tier: string; email: string | null; signedIn: boolean }> {
  const res = await request('/me');
  const raw = (await res.json()) as { tier?: string; email?: string | null; signed_in?: boolean };
  return { tier: raw.tier ?? 'guest', email: raw.email ?? null, signedIn: !!raw.signed_in };
}

// What each documented failure means to the person watching the queue.
export function describeError(e: WhipScribeError): { message: string; pauseQueue?: 'credit' | 'quota' } {
  switch (e.code) {
    case 'NO_CREDITS':
      return { message: 'Out of credit. Add credit on WhipScribe, then resume.', pauseQueue: 'credit' };
    case 'QUOTA_EXCEEDED':
      return { message: 'Today’s free minutes are used up. The queue resumes tomorrow, or add credit.', pauseQueue: 'quota' };
    case 'transcript_locked':
      return { message: 'Transcribed, but locked until the account has credit.' };
    case 'FILE_TOO_LARGE':
      return { message: 'Too large for WhipScribe to accept.' };
    case 'BAD_MIME':
      return { message: 'Not a format WhipScribe can read.' };
    case 'RATE_LIMITED':
      return { message: 'WhipScribe asked us to slow down. Retrying shortly.' };
    case 'MISSING_API_KEY':
    case 'AUTHENTICATION_REQUIRED':
      return { message: 'WhipScribe did not accept the API key. Check WHIPSCRIBE_API_KEY.' };
    case 'NETWORK':
      return { message: 'Could not reach WhipScribe. Retrying.' };
    default:
      return { message: e.status >= 500 ? 'WhipScribe had a problem on its side. Retrying.' : e.message };
  }
}
