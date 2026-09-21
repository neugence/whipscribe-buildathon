import { appStatus } from '@/lib/queries';
import { Picker } from '@/components/Picker';

export default async function PickPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const status = appStatus();
  return <Picker status={status} initialSource={sp.source === 'local' || sp.source === 'drive' ? sp.source : null} />;
}
