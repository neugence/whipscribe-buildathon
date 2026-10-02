import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { Folder, Levels, Library, Meeting, Rec, RecInfo, Settings } from './types';

const msg = (e: unknown) => (typeof e === 'string' ? e : e instanceof Error ? e.message : JSON.stringify(e));
async function call<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(cmd, args);
  } catch (e) {
    throw new Error(msg(e));
  }
}

export const api = {
  settings: () => call<Settings>('get_settings'),
  saveSettings: (patch: Record<string, unknown>) => call<void>('save_settings', { patch }),
  checkApi: () => call<Record<string, unknown>>('check_api'),

  startRecording: (title: string, mic: boolean, system: boolean, meetingId?: string) =>
    call<{ record: Rec; info: RecInfo }>('start_recording', { title, mic, system, meetingId }),
  togglePause: () => call<boolean>('toggle_pause'),
  stopRecording: () => call<Rec>('stop_recording'),
  recordingState: () => call<{ id: string; paused: boolean; info: RecInfo } | null>('recording_state'),

  library: () => call<Library>('library_load'),
  patch: (id: string, patch: Record<string, unknown>) => call<Rec>('library_patch', { id, patch }),
  setFolders: (folders: Folder[]) => call<void>('library_set_folders', { folders }),
  search: (query: string) => call<{ id: string; snippet: string }[]>('library_search', { query }),
  remove: (id: string, deleteRemote: boolean) => call<void>('library_remove', { id, deleteRemote }),
  saveTranscript: (id: string, data: unknown, text: string) => call<void>('transcript_save', { id, data, text }),
  loadTranscript: (id: string) => call<unknown>('transcript_load', { id }),

  upload: (id: string) => call<Rec>('upload_recording', { id }),
  jobStatus: (jobId: string) => call<Record<string, unknown>>('job_status', { jobId }),
  jobResult: (jobId: string) => call<unknown>('job_result', { jobId }),
  remoteJobs: (limit = 50) => call<Record<string, unknown>[]>('remote_jobs', { limit }),

  gcalConnect: () => call<void>('gcal_connect'),
  gcalEvents: () => call<Meeting[]>('gcal_events'),
  gcalDisconnect: () => call<void>('gcal_disconnect'),
  openUrl: (url: string) => call<void>('open_url', { url }),
};

export const onLevels = (fn: (l: Levels) => void) => listen<Levels>('rec-level', (e) => fn(e.payload));
export { msg as errorMessage };
