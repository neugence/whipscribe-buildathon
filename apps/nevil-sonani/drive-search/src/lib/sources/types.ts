// A source is where recordings live: Google Drive, or a local folder for
// trying the app without a Google client. The worker only sees this shape.

export interface SourceFolder {
  id: string;
  name: string;
  webUrl?: string;
}

export interface SourceFile {
  id: string;
  name: string;
  subpath: string; // folders between the picked folder and the file, "" at the top
  mime: string;
  size: number | null;
  modifiedAt: number | null;
  version: string; // changes when the file's bytes change
  webUrl?: string;
}

export interface SkippedFile {
  id: string;
  name: string;
  subpath: string;
  reason: string;
}

export interface Listing {
  media: SourceFile[];
  skipped: SkippedFile[];
}

export interface Source {
  kind: 'drive' | 'local';
  label: string;
  listFolders(parentId?: string): Promise<{ folders: SourceFolder[]; trail: SourceFolder[] }>;
  getFolder(id: string): Promise<SourceFolder>;
  listMedia(folderId: string): Promise<Listing>;
  download(file: Pick<SourceFile, 'id' | 'name'>, destPath: string, onBytes?: (bytes: number) => void): Promise<void>;
}

// Something went wrong on the source's side. `auth` means the person has to
// connect again; `gone` means the file or folder no longer exists.
export class SourceError extends Error {
  kind: 'auth' | 'gone' | 'other';
  constructor(kind: 'auth' | 'gone' | 'other', message: string) {
    super(message);
    this.kind = kind;
  }
}

// The formats the API docs list for POST /transcribe. Anything else is
// skipped with a reason rather than sent and left to fail.
const DOCUMENTED_EXTENSIONS = ['mp3', 'm4a', 'wav', 'mp4', 'mov', 'ogg', 'webm', 'flac'];
export const MAX_BYTES = 5 * 1024 ** 3; // "up to 10 hours or 5 GB per file"

export function classify(name: string, mime: string, size: number | null): { ok: true } | { ok: false; reason: string } {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const isMedia = mime.startsWith('audio/') || mime.startsWith('video/') || DOCUMENTED_EXTENSIONS.includes(ext);
  if (!isMedia) return { ok: false, reason: 'Not audio or video' };
  if (!DOCUMENTED_EXTENSIONS.includes(ext)) return { ok: false, reason: `.${ext || '?'} is not a format WhipScribe lists` };
  if (size !== null && size > MAX_BYTES) return { ok: false, reason: 'Larger than 5 GB, WhipScribe’s limit' };
  return { ok: true };
}
