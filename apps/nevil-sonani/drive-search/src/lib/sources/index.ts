import { driveSource, driveConfigured } from './drive.ts';
import { localSource } from './local.ts';
import type { Source } from './types.ts';

export function sourceFor(kind: string): Source {
  if (kind === 'drive') return driveSource;
  if (kind === 'local' && process.env.DEMO_FOLDER) return localSource;
  throw new Error(`Unknown or unconfigured source: ${kind}`);
}

// Which sources this install can offer, in the order the UI shows them.
export function availableSources(): { kind: 'drive' | 'local'; label: string; configured: boolean }[] {
  const out: { kind: 'drive' | 'local'; label: string; configured: boolean }[] = [
    { kind: 'drive', label: driveSource.label, configured: driveConfigured() },
  ];
  if (process.env.DEMO_FOLDER) out.push({ kind: 'local', label: localSource.label, configured: true });
  return out;
}
