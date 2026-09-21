import { notFound } from 'next/navigation';
import { folderDetail } from '@/lib/queries';
import { param } from '@/lib/http';
import { FolderView } from '@/components/FolderView';

export default async function FolderPage({ params }: { params: Promise<{ id: string }> }) {
  const detail = folderDetail(param((await params).id));
  if (!detail) notFound();
  return <FolderView initial={detail} />;
}
