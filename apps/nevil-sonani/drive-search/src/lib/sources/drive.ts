// Google Drive over plain fetch: OAuth 2.0 authorization code with PKCE for a
// web app, then the Drive v3 REST API. Tokens stay in the local database; the
// client secret stays in .env.local.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import { kvGet, kvSet } from '../db.ts';
import { classify, SourceError, type Listing, type Source, type SourceFolder } from './types.ts';

const SCOPES = ['openid', 'email', 'https://www.googleapis.com/auth/drive.readonly'];
const FOLDER = 'application/vnd.google-apps.folder';
const API = 'https://www.googleapis.com/drive/v3';

const clientId = () => process.env.GOOGLE_CLIENT_ID || '';
const clientSecret = () => process.env.GOOGLE_CLIENT_SECRET || '';
export const appUrl = () => (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
export const redirectUri = () => `${appUrl()}/api/google/callback`;
export const driveConfigured = () => !!clientId() && !!clientSecret();

interface Tokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  email?: string;
}

const readTokens = (): Tokens | null => {
  const raw = kvGet('google_tokens');
  return raw ? (JSON.parse(raw) as Tokens) : null;
};

export function driveAccount(): { connected: boolean; email?: string } {
  const t = readTokens();
  return t ? { connected: true, email: t.email } : { connected: false };
}

export function disconnectDrive(): void {
  kvSet('google_tokens', null);
}

// Step 1: send the person to Google with a one-time state and a PKCE challenge.
export function startAuth(): { url: string; state: string; verifier: string } {
  const state = crypto.randomBytes(16).toString('base64url');
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline', // a refresh token, so rescans work without the person here
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });
  return { url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`, state, verifier };
}

// Step 2: Google sends them back with a code; swap it for tokens.
export async function finishAuth(code: string, verifier: string): Promise<void> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, code_verifier: verifier, client_id: clientId(), client_secret: clientSecret(), redirect_uri: redirectUri(), grant_type: 'authorization_code' }),
  });
  const body = (await res.json()) as { access_token?: string; refresh_token?: string; expires_in?: number; id_token?: string; error_description?: string; scope?: string };
  if (!res.ok || !body.access_token) throw new SourceError('auth', body.error_description || 'Google did not accept the sign-in');
  if (!body.scope?.includes('drive.readonly')) throw new SourceError('auth', 'Drive access was not granted. Tick the Drive box on Google’s screen.');
  // The id_token came straight from Google over TLS; we only read the email from it.
  let email: string | undefined;
  try {
    email = JSON.parse(Buffer.from((body.id_token || '').split('.')[1] || '', 'base64url').toString()).email;
  } catch {
    /* no email is fine */
  }
  const previous = readTokens();
  kvSet('google_tokens', JSON.stringify({
    access_token: body.access_token,
    refresh_token: body.refresh_token || previous?.refresh_token,
    expires_at: Date.now() + (body.expires_in ?? 3600) * 1000,
    email,
  } satisfies Tokens));
}

async function accessToken(): Promise<string> {
  const t = readTokens();
  if (!t) throw new SourceError('auth', 'Google Drive is not connected');
  if (Date.now() < t.expires_at - 60_000) return t.access_token;
  if (!t.refresh_token) throw new SourceError('auth', 'Google sign-in expired. Connect Drive again.');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId(), client_secret: clientSecret(), refresh_token: t.refresh_token, grant_type: 'refresh_token' }),
  });
  const body = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!res.ok || !body.access_token) {
    // Revoked or expired (testing-mode apps get 7-day refresh tokens).
    throw new SourceError('auth', 'Google sign-in expired. Connect Drive again.');
  }
  kvSet('google_tokens', JSON.stringify({ ...t, access_token: body.access_token, expires_at: Date.now() + (body.expires_in ?? 3600) * 1000 }));
  return body.access_token;
}

async function drive(path: string, params: Record<string, string> = {}): Promise<Response> {
  const url = `${API}${path}?${new URLSearchParams({ supportsAllDrives: 'true', ...params })}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${await accessToken()}` }, cache: 'no-store' });
  if (res.status === 401) throw new SourceError('auth', 'Google sign-in expired. Connect Drive again.');
  if (res.status === 404) throw new SourceError('gone', 'Not found in Drive. It may have been moved or deleted.');
  if (!res.ok) throw new SourceError('other', `Drive answered ${res.status}`);
  return res;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  md5Checksum?: string;
  webViewLink?: string;
  parents?: string[];
}

const q = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

async function listAll(query: string, fields: string): Promise<DriveFile[]> {
  const out: DriveFile[] = [];
  let pageToken = '';
  do {
    const res = await drive('/files', {
      q: query,
      fields: `nextPageToken, files(${fields})`,
      pageSize: '1000',
      orderBy: 'folder,name_natural',
      includeItemsFromAllDrives: 'true',
      ...(pageToken ? { pageToken } : {}),
    });
    const body = (await res.json()) as { files?: DriveFile[]; nextPageToken?: string };
    out.push(...(body.files || []));
    pageToken = body.nextPageToken || '';
  } while (pageToken);
  return out;
}

export const driveSource: Source = {
  kind: 'drive',
  label: 'Google Drive',

  async listFolders(parentId = 'root') {
    const isShared = parentId === 'shared';
    const files = await listAll(
      isShared ? `sharedWithMe = true and mimeType = '${FOLDER}' and trashed = false` : `'${q(parentId)}' in parents and mimeType = '${FOLDER}' and trashed = false`,
      'id, name, webViewLink',
    );
    const folders: SourceFolder[] = files.map((f) => ({ id: f.id, name: f.name, webUrl: f.webViewLink }));
    // The trail back up to My Drive, for breadcrumbs.
    const trail: SourceFolder[] = [];
    let cursor = parentId;
    for (let i = 0; i < 8 && cursor !== 'root' && cursor !== 'shared'; i++) {
      const res = await drive(`/files/${encodeURIComponent(cursor)}`, { fields: 'id, name, parents' });
      const f = (await res.json()) as DriveFile;
      trail.unshift({ id: f.id, name: f.name });
      if (!f.parents?.length) break;
      cursor = f.parents[0];
      // My Drive's own id is not "root"; stop when we reach a folder with no name we can show.
    }
    return { folders, trail: trail.filter((t) => t.name !== 'My Drive') };
  },

  async getFolder(id) {
    const res = await drive(`/files/${encodeURIComponent(id)}`, { fields: 'id, name, mimeType, webViewLink, trashed' });
    const f = (await res.json()) as DriveFile & { trashed?: boolean };
    if (f.mimeType !== FOLDER || f.trashed) throw new SourceError('gone', 'That folder is no longer in Drive');
    return { id: f.id, name: f.name, webUrl: f.webViewLink };
  },

  // Everything under the folder, five levels deep.
  async listMedia(folderId) {
    const out: Listing = { media: [], skipped: [] };
    const queue: { id: string; subpath: string; depth: number }[] = [{ id: folderId, subpath: '', depth: 0 }];
    while (queue.length) {
      const dir = queue.shift()!;
      const files = await listAll(`'${q(dir.id)}' in parents and trashed = false`, 'id, name, mimeType, size, modifiedTime, md5Checksum, webViewLink');
      for (const f of files) {
        if (f.mimeType === FOLDER) {
          if (dir.depth < 5) queue.push({ id: f.id, subpath: dir.subpath ? `${dir.subpath}/${f.name}` : f.name, depth: dir.depth + 1 });
          continue;
        }
        if (f.mimeType.startsWith('application/vnd.google-apps.')) {
          out.skipped.push({ id: f.id, name: f.name, subpath: dir.subpath, reason: f.mimeType.endsWith('shortcut') ? 'A shortcut, not the file itself' : 'A Google Doc, Sheet or Slide' });
          continue;
        }
        const size = f.size ? Number(f.size) : null;
        const verdict = classify(f.name, f.mimeType, size);
        if (!verdict.ok) {
          out.skipped.push({ id: f.id, name: f.name, subpath: dir.subpath, reason: verdict.reason });
          continue;
        }
        out.media.push({
          id: f.id,
          name: f.name,
          subpath: dir.subpath,
          mime: f.mimeType,
          size,
          modifiedAt: f.modifiedTime ? Date.parse(f.modifiedTime) : null,
          version: f.md5Checksum || f.modifiedTime || 'v1',
          webUrl: f.webViewLink,
        });
      }
    }
    return out;
  },

  // Stream the bytes to disk; nothing large is held in memory.
  async download(file, destPath, onBytes) {
    const res = await drive(`/files/${encodeURIComponent(file.id)}`, { alt: 'media' });
    if (!res.body) throw new SourceError('other', 'Drive sent no data');
    let seen = 0;
    const count = new Transform({
      transform(chunk, _enc, done) {
        seen += chunk.length;
        onBytes?.(seen);
        done(null, chunk);
      },
    });
    await pipeline(Readable.fromWeb(res.body as unknown as WebReadableStream), count, fs.createWriteStream(destPath));
  },
};
