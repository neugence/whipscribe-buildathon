import { Icon } from './Icon';
import type { FileItem } from '@/lib/api-types';

const QUEUE_STOPPERS = ['NO_CREDITS', 'QUOTA_EXCEEDED', 'DRIVE_AUTH'];

// One place that turns a file's status into words, so every screen agrees.
export function describe(f: FileItem, sourceLabel: string) {
  switch (f.status) {
    case 'queued':
      // Credit, free minutes and Drive sign-in stop the whole queue; anything
      // else was this file's own hiccup and it will be tried again.
      if (f.errorCode && QUEUE_STOPPERS.includes(f.errorCode)) return { cls: 'retrying', icon: 'alert', text: 'Paused', why: f.error };
      if (f.errorCode) return { cls: 'retrying', icon: 'refresh', text: 'Will try again', why: f.error };
      return { cls: 'queued', icon: 'clock', text: 'Waiting its turn' };
    case 'downloading':
      return { cls: 'active', icon: 'refresh', text: `Copying from ${sourceLabel}`, bar: f.progress ?? 0 };
    case 'uploading':
      return { cls: 'active', icon: 'refresh', text: 'Sending to WhipScribe', bar: -1 };
    case 'transcribing': {
      const p = Math.round(f.progress ?? 0);
      return { cls: 'active', icon: 'refresh', text: p > 0 && p < 100 ? `Transcribing, ${p}%` : 'Transcribing', bar: p > 0 ? p : -1 };
    }
    case 'done':
      if (f.noSpeech) return { cls: 'skipped', icon: 'wave', text: 'No speech found', why: 'It sounds like music or silence, so there is nothing to search.' };
      if (f.errorCode === 'LOCKED') return { cls: 'retrying', icon: 'alert', text: 'Preview only', why: f.error };
      return { cls: 'done', icon: 'check', text: 'Transcribed' };
    case 'failed':
      return { cls: 'failed', icon: 'alert', text: 'Didn’t transcribe', why: f.error };
    case 'skipped':
      return { cls: 'skipped', icon: 'skip', text: 'Skipped', why: f.error };
    case 'removed':
      return { cls: 'removed', icon: 'trash', text: `No longer in ${sourceLabel}`, why: 'The transcript is kept.' };
  }
}

export function FileState({ f, sourceLabel }: { f: FileItem; sourceLabel: string }) {
  const d = describe(f, sourceLabel);
  return (
    <div className={`state ${d.cls}`}>
      <span className="state-line">
        <Icon name={d.icon} size="sm" />
        <span className="t">{d.text}</span>
      </span>
      {'bar' in d && d.bar !== undefined && (
        <span className={`bar${d.bar < 0 ? ' busy' : ''}`} role="progressbar" aria-label={d.text} aria-valuemin={0} aria-valuemax={100} aria-valuenow={d.bar >= 0 ? Math.round(d.bar) : undefined}>
          <span style={{ width: `${Math.max(0, d.bar)}%` }} />
        </span>
      )}
      {'why' in d && d.why && <span className="why">{d.why}</span>}
    </div>
  );
}
