import type { Library, Meeting, Settings } from './types';

export type View = { name: 'today' } | { name: 'library'; folder?: string } | { name: 'detail'; id: string; q?: string } | { name: 'settings' };

export interface Ctx {
  settings: Settings | null;
  lib: Library;
  meetings: Meeting[];
  meetingsError?: string;
  meetingsLoading: boolean;
  online: boolean;
  recordingId: string | null;
  now: number;
  go: (v: View) => void;
  start: (title: string, meetingId?: string) => void;
  upload: (id: string) => void;
  refreshSettings: () => Promise<void>;
  refreshMeetings: () => void;
  refreshLib: () => Promise<void>;
  toast: (text: string, kind?: 'error' | 'info') => void;
  resumePoll: (id: string, jobId: string) => void;
}
