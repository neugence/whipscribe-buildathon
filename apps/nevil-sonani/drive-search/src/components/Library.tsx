'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icon } from './Icon';
import { usePoll } from './usePoll';
import { ago, length, plural } from '@/lib/format';
import type { FolderSummary } from '@/lib/api-types';

export function Library({ initial, driveNote }: { initial: FolderSummary[]; driveNote: string | null }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const { data } = usePoll<FolderSummary[]>('/api/folders', { initial, isBusy: (fs) => fs.some((f) => f.active > 0) });
  const folders = data ?? initial;
  const recordings = folders.reduce((a, f) => a + f.done, 0);
  const seconds = folders.reduce((a, f) => a + f.seconds, 0);

  return (
    <main className="page">
      {driveNote && (
        <div className="banner warn" role="alert">
          <Icon name="alert" />
          <span className="grow">{driveNote}</span>
        </div>
      )}
      <h1>Your folders</h1>
      <p className="lede">
        {recordings ? `${plural(recordings, 'recording')} transcribed, ${length(seconds) || 'under a minute'} of audio.` : 'The first transcripts are on their way.'}{' '}
        Search them all at once.
      </p>

      <form
        className="search-big"
        role="search"
        style={{ marginTop: 20, maxWidth: 720 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <Icon name="search" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search what was said, e.g. pricing" aria-label="Search every recording" enterKeyHint="search" />
      </form>

      <div className="section-head">
        <h2>Folders</h2>
        <Link className="btn small" href="/pick"><Icon name="plus" size="sm" /> Add a folder</Link>
      </div>
      <div className="grid">
        {folders.map((f) => (
          <FolderCard key={f.id} f={f} />
        ))}
        <Link className="add-card" href="/pick">
          <Icon name="plus" />
          Add a folder
        </Link>
      </div>
    </main>
  );
}

function FolderCard({ f }: { f: FolderSummary }) {
  const pct = f.total ? Math.round((f.done / f.total) * 100) : 0;
  return (
    <Link className="card folder-card" href={`/folders/${encodeURIComponent(f.id)}`}>
      <span className="name">
        <Icon name={f.source === 'drive' ? 'drive' : 'folder'} />
        <span>{f.name}</span>
      </span>
      <span className="facts">
        {f.total ? plural(f.total, 'recording') : 'No recordings yet'}
        {f.seconds ? ` · ${length(f.seconds)}` : ''}
      </span>
      {f.active > 0 && (
        <span>
          <span className="bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
          <span className="facts" style={{ display: 'block', marginTop: 6 }}>Transcribing, {f.done} of {f.total} done</span>
        </span>
      )}
      <span className="foot">
        {f.failed > 0 && <span className="flag danger"><Icon name="alert" size="sm" />{plural(f.failed, 'needs', 'need')} attention</span>}
        {f.scanError && <span className="flag warn"><Icon name="alert" size="sm" />Could not check for new files</span>}
        {!f.failed && !f.scanError && <span>Checked for new files {ago(f.lastScanAt)}</span>}
      </span>
    </Link>
  );
}
