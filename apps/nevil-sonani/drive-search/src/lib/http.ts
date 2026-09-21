// Small helpers for the route handlers.
import { appUrl } from './sources/drive.ts';

export const json = (data: unknown, init: ResponseInit = {}) =>
  Response.json(data, { ...init, headers: { 'Cache-Control': 'no-store', ...(init.headers || {}) } });

export const problem = (status: number, message: string) => json({ error: message }, { status });

// The app has no login of its own: it is one person's, on localhost. Refuse
// state-changing requests from any other origin, so a web page open in the
// same browser cannot drive it.
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // same-origin fetches from older browsers, curl
  try {
    return new URL(origin).origin === new URL(appUrl()).origin || new URL(origin).origin === new URL(req.url).origin;
  } catch {
    return false;
  }
}

// Folder ids can hold ":" (local:…); make sure they arrive decoded.
export const param = (v: string) => {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
};
