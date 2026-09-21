// A folder on this computer, standing in for Drive. Set DEMO_FOLDER and each
// subfolder of it can be picked like a Drive folder. For trying the app and
// for development; the worker cannot tell the difference.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { classify, SourceError, type Listing, type Source, type SourceFolder } from './types.ts';

// A runtime path outside the app; nothing for the bundler to trace.
const root = () => path.resolve(/*turbopackIgnore: true*/ process.env.DEMO_FOLDER || '');
const toId = (abs: string) => 'local:' + path.relative(root(), abs).split(path.sep).join('/');

function toAbs(id: string): string {
  const rel = id.replace(/^local:/, '');
  const abs = path.resolve(root(), rel);
  // Never read outside DEMO_FOLDER, whatever id the browser sends.
  if (abs !== root() && !abs.startsWith(root() + path.sep)) throw new SourceError('gone', 'Outside the demo folder');
  return abs;
}

const MIME: Record<string, string> = {
  mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac',
  mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', txt: 'text/plain',
};
const mimeOf = (name: string) => MIME[(name.split('.').pop() || '').toLowerCase()] || 'application/octet-stream';

export const localSource: Source = {
  kind: 'local',
  label: 'Folder on this computer',

  async listFolders(parentId) {
    const dir = parentId ? toAbs(parentId) : root();
    const entries = await fsp.readdir(dir, { withFileTypes: true }).catch(() => {
      throw new SourceError('gone', 'That folder is no longer there');
    });
    const folders: SourceFolder[] = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => ({ id: toId(path.join(dir, e.name)), name: e.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const trail: SourceFolder[] = [];
    if (parentId) {
      const parts = path.relative(root(), dir).split(path.sep);
      parts.forEach((name, i) => trail.push({ id: toId(path.join(root(), ...parts.slice(0, i + 1))), name }));
    }
    return { folders, trail };
  },

  async getFolder(id) {
    const abs = toAbs(id);
    const st = await fsp.stat(abs).catch(() => null);
    if (!st || !st.isDirectory()) throw new SourceError('gone', 'That folder is no longer there');
    return { id, name: path.basename(abs) };
  },

  async listMedia(folderId) {
    const top = toAbs(folderId);
    const out: Listing = { media: [], skipped: [] };
    async function walk(dir: string, depth: number) {
      const entries = await fsp.readdir(dir, { withFileTypes: true });
      for (const e of entries) {
        if (e.name.startsWith('.')) continue;
        const abs = path.join(dir, e.name);
        const subpath = path.relative(top, dir).split(path.sep).join('/');
        if (e.isDirectory()) {
          if (depth < 5) await walk(abs, depth + 1);
          continue;
        }
        const st = await fsp.stat(abs);
        const mime = mimeOf(e.name);
        const verdict = classify(e.name, mime, st.size);
        if (verdict.ok) {
          out.media.push({ id: toId(abs), name: e.name, subpath, mime, size: st.size, modifiedAt: Math.round(st.mtimeMs), version: `${st.size}-${Math.round(st.mtimeMs)}` });
        } else {
          out.skipped.push({ id: toId(abs), name: e.name, subpath, reason: verdict.reason });
        }
      }
    }
    await walk(top, 0);
    return out;
  },

  async download(file, destPath, onBytes) {
    let seen = 0;
    const count = new Transform({
      transform(chunk, _enc, done) {
        seen += chunk.length;
        onBytes?.(seen);
        done(null, chunk);
      },
    });
    await pipeline(fs.createReadStream(toAbs(file.id)), count, fs.createWriteStream(destPath));
  },
};
