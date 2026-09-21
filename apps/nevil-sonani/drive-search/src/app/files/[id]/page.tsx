import { notFound } from 'next/navigation';
import { transcript } from '@/lib/queries';
import { param } from '@/lib/http';
import { Transcript } from '@/components/Transcript';

export default async function FilePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const data = transcript(param((await params).id));
  if (!data) notFound();
  const sp = await searchParams;
  const t = sp.t ? Number(sp.t) : null;
  return <Transcript initial={data} at={t !== null && Number.isFinite(t) ? t : null} q={sp.q ?? ''} />;
}
