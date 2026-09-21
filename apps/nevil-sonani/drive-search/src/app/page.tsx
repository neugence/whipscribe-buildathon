import { appStatus, folderSummaries } from '@/lib/queries';
import { Setup } from '@/components/Setup';
import { Library } from '@/components/Library';

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const status = appStatus();
  const folders = folderSummaries();
  const driveNote = driveMessage(sp.drive);
  return folders.length ? <Library initial={folders} driveNote={driveNote} /> : <Setup status={status} driveNote={driveNote} />;
}

// What came back from Google, in words.
function driveMessage(code: string | undefined): string | null {
  if (!code) return null;
  if (code === 'cancelled') return 'You cancelled the Google sign-in, so nothing was connected.';
  if (code === 'expired') return 'That sign-in took too long and expired. Try connecting again.';
  if (code === 'failed') return 'Google did not accept the sign-in. Try connecting again.';
  return code;
}
