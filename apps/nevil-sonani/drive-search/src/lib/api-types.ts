// Shapes the JSON routes return. Type-only, so browser code can import it.

export type Status = 'queued' | 'downloading' | 'uploading' | 'transcribing' | 'done' | 'failed' | 'skipped' | 'removed';

export interface FileItem {
  id: string;
  name: string;
  subpath: string;
  status: Status;
  progress: number | null;
  size: number | null;
  duration: number | null;
  error: string | null;
  errorCode: string | null;
  noSpeech: boolean;
  retryAt: number | null;
  webUrl: string | null;
  doneAt: number | null;
}

export interface FolderSummary {
  id: string;
  source: 'drive' | 'local';
  name: string;
  webUrl: string | null;
  lastScanAt: number | null;
  scanError: string | null;
  done: number;
  active: number;
  failed: number;
  skipped: number;
  removed: number;
  total: number; // recordings, not counting skipped files
  seconds: number; // audio transcribed so far
}

export interface FolderDetail extends FolderSummary {
  files: FileItem[];
}

export interface AppStatus {
  paused: 'credit' | 'quota' | 'drive' | null;
  sources: { kind: 'drive' | 'local'; label: string; configured: boolean }[];
  drive: { configured: boolean; connected: boolean; email?: string };
  whipscribe: { hasKey: boolean };
  active: number;
  done: number;
  failed: number;
  folders: number;
  lastError: string | null;
}

export interface TranscriptData {
  file: FileItem;
  folder: { id: string; name: string; source: string };
  language: string | null;
  hasAudio: boolean;
  segments: { idx: number; start: number; end: number; speaker: string | null; text: string }[];
  insights: { summary: string | null; topics: string[]; quotes: { speaker?: string; text: string; start?: number }[] } | null;
}

export interface PickerFolder {
  id: string;
  name: string;
  added: boolean;
}

export interface PickerListing {
  folders: PickerFolder[];
  trail: { id: string; name: string }[];
}

export interface FolderPreview {
  count: number;
  bytes: number;
  skipped: { name: string; reason: string }[];
  sample: string[];
}

export interface SearchResponse {
  q: string;
  total: number;
  pending: number; // recordings still being transcribed, so not searchable yet
  files: {
    fileId: string;
    fileName: string;
    subpath: string;
    folderId: string;
    folderName: string;
    duration: number | null;
    hits: { start: number; speaker: string | null; snippet: string }[];
  }[];
}
