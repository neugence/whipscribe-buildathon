export type Status = 'recording' | 'saved' | 'uploading' | 'processing' | 'ready' | 'error';

export interface Rec {
  id: string;
  title: string;
  startedAt: string;
  duration: number;
  path?: string;
  status: Status;
  jobId?: string;
  error?: string;
  warning?: string;
  recovered?: boolean;
  progress?: number;
  remote?: boolean;
  folderId?: string;
  meetingId?: string;
  sources?: { mic: boolean; system: boolean };
  speakerNames?: Record<string, string>;
}

export interface Folder { id: string; name: string }
export interface Library { recordings: Rec[]; folders: Folder[] }

export interface Meeting {
  id: string;
  title: string;
  start: string;
  end?: string;
  attendees: string[];
  link?: string | null;
  provider?: string | null;
}

export interface Settings {
  hasKey: boolean;
  keyTail: string;
  baseUrl: string;
  googleClientId: string;
  googleSecretSet: boolean;
  googleConnected: boolean;
  language: string;
  autoUpload: boolean;
  captureMic: boolean;
  captureSystem: boolean;
}

export interface Turn { speaker: string; start: number; end: number; text: string }
export interface Transcript { turns: Turn[]; speakers: string[]; text: string }
export interface Levels { mic: number; system: number; seconds: number }
export interface RecInfo { mic: boolean; system: boolean; warnings: string[] }
