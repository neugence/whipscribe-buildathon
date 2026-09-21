import { folderSummaries } from '@/lib/queries';
import { SearchView } from '@/components/SearchView';

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const folders = folderSummaries().map((f) => ({ id: f.id, name: f.name }));
  return <SearchView folders={folders} q={sp.q ?? ''} folder={sp.folder ?? ''} />;
}
