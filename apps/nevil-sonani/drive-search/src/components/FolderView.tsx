'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Icon } from './Icon';
import { FileState } from './FileState';
import { post, usePoll } from './usePoll';
import { ago, clock, length, plural } from '@/lib/format';
import type { FileItem, FolderDetail } from '@/lib/api-types';

type Filter = 'all' | 'active' | 'done' | 'attention' | 'skipped';
const isActive = (f: FileItem) => ['queued', 'downloading', 'uploading', 'transcribing'].includes(f.status);
const needsAttention = (f: FileItem) => f.status === 'failed' || (f.status === 'done' && f.errorCode === 'LOCKED');

export function FolderView({ initial }: { initial: FolderDetail }) {
  const router = useRouter();
  const url = `/api/folders/${encodeURIComponent(initial.id)}`;
  const { data, refresh } = usePoll<FolderDetail>(url, { initial, isBusy: (d) => d.active > 0 });
  const folder = data ?? initial;
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const sourceLabel = folder.source === 'drive' ? 'Drive' : 'this computer';

  const counts = useMemo(() => ({
    all: folder.files.length,
    active: folder.files.filter(isActive).length,
    done: folder.files.filter((f) => f.status === 'done' || f.status === 'removed').length,
    attention: folder.files.filter(needsAttention).length,
    skipped: folder.files.filter((f) => f.status === 'skipped').length,
  }), [folder.files]);

  const shown = folder.files.filter((f) =>
    filter === 'all' ? true : filter === 'active' ? isActive(f) : filter === 'done' ? f.status === 'done' || f.status === 'removed' : filter === 'attention' ? needsAttention(f) : f.status === 'skipped',
  );

  const flash = (m: string) => {
    setNote(m);
    setTimeout(() => setNote(null), 4000);
  };

  async function checkNow() {
    setBusy('scan');
    const res = await post<{ added: number; changed: number; removed: number }>(`${url}/scan`);
    setBusy(null);
    await refresh();
    if (!res.ok) return flash(res.error || 'Could not check the folder');
    const { added = 0, changed = 0, removed = 0 } = res.data ?? {};
    const parts = [added && `${plural(added, 'new recording')}`, changed && `${plural(changed, 'changed file')}`, removed && `${removed} gone from ${sourceLabel}`].filter(Boolean);
    flash(parts.length ? `Found ${parts.join(', ')}.` : 'Nothing new since the last check.');
  }

  async function retryAll() {
    setBusy('retry');
    const res = await post<{ retried: number }>(`${url}/retry`);
    setBusy(null);
    await refresh();
    flash(res.ok ? `Trying ${plural(res.data?.retried ?? 0, 'recording')} again.` : res.error || 'Could not retry');
  }

  async function remove() {
    if (!window.confirm(`Stop watching “${folder.name}”?\n\nIts transcripts are removed from this app. Nothing is deleted from ${folder.source === 'drive' ? 'Google Drive' : 'this computer'} or from WhipScribe.`)) return;
    const res = await post(url, undefined, 'DELETE');
    if (res.ok) router.push('/');
    else flash(res.error || 'Could not remove the folder');
  }

  const pct = folder.total ? (folder.done / folder.total) * 100 : 0;

  return (
    <main className="page">
      <Link className="crumb" href="/"><Icon name="back" size="sm" /> All folders</Link>
      <div className="folder-head">
        <div className="grow">
          <h1>{folder.name}</h1>
          <div className="folder-meta">
            <span>{folder.source === 'drive' ? 'Google Drive' : 'Folder on this computer'}</span>
            <span>Checked {ago(folder.lastScanAt)}</span>
            <span>New files are picked up every 10 minutes</span>
          </div>
        </div>
        <button className="btn" onClick={checkNow} disabled={busy === 'scan'}>
          <Icon name="refresh" size="sm" /> {busy === 'scan' ? 'Checking…' : 'Check for new files'}
        </button>
        {folder.webUrl && (
          <a className="btn" href={folder.webUrl} target="_blank" rel="noreferrer">Open in Drive <Icon name="external" size="sm" /></a>
        )}
        <button className="btn danger-text" onClick={remove}>Remove</button>
      </div>

      {folder.scanError && (
        <div className="banner warn" role="alert" style={{ marginTop: 18 }}>
          <Icon name="alert" />
          <span className="grow"><b>Could not check this folder for new files.</b> {folder.scanError}</span>
          <button className="btn small" onClick={checkNow}>Try again</button>
        </div>
      )}
      {folder.failed > 0 && (
        <div className="banner danger" role="alert" style={{ marginTop: 18 }}>
          <Icon name="alert" />
          <span className="grow"><b>{plural(folder.failed, 'recording')} didn’t transcribe.</b> The reason is next to each one.</span>
          <button className="btn small" onClick={retryAll} disabled={busy === 'retry'}>Try them again</button>
        </div>
      )}

      {folder.total > 0 && (
        <div className="summary-bar">
          <div className="bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
          <div className="summary-line tabnum">
            <span><b style={{ color: 'var(--ink)' }}>{folder.done} of {folder.total}</b> transcribed</span>
            {folder.active > 0 && <span>{folder.active} in progress</span>}
            {folder.skipped > 0 && <span>{folder.skipped} skipped</span>}
            {folder.seconds > 0 && <span>{length(folder.seconds)} of audio</span>}
          </div>
        </div>
      )}

      {folder.files.length > 0 && (
        <>
          <form
            className="inline-search"
            role="search"
            style={{ marginTop: 22 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}&folder=${encodeURIComponent(folder.id)}`);
            }}
          >
            <Icon name="search" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search in ${folder.name}`} aria-label={`Search in ${folder.name}`} enterKeyHint="search" />
          </form>

          <div className="chips" role="group" aria-label="Show">
            {([['all', 'All'], ['active', 'In progress'], ['done', 'Transcribed'], ['attention', 'Needs attention'], ['skipped', 'Skipped']] as [Filter, string][])
              .filter(([k]) => k === 'all' || counts[k] > 0 || filter === k)
              .map(([k, label]) => (
                <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>
                  {label} <span className="n">{counts[k]}</span>
                </button>
              ))}
          </div>
        </>
      )}

      <div className="card files">
        {folder.files.length === 0 ? (
          <div className="empty">
            <Icon name="folder" size="lg" />
            <h2>No recordings in this folder yet</h2>
            <p>Anything you add to it in {folder.source === 'drive' ? 'Drive' : 'the folder'} shows up here within 10 minutes, or straight away when you check.</p>
            <button className="btn" onClick={checkNow}><Icon name="refresh" size="sm" /> Check now</button>
          </div>
        ) : shown.length === 0 ? (
          <div className="empty"><p style={{ margin: 0 }}>Nothing here right now.</p></div>
        ) : (
          <>
            <div className="file-row head" aria-hidden="true">
              <span>Recording</span>
              <span>Length</span>
              <span>Status</span>
              <span />
            </div>
            {shown.map((f) => (
              <FileLine key={f.id} f={f} sourceLabel={sourceLabel} onRetry={async () => { await post(`/api/files/${encodeURIComponent(f.id)}/retry`); refresh(); }} />
            ))}
          </>
        )}
      </div>

      {note && <div className="toast" role="status">{note}</div>}
    </main>
  );
}

function FileLine({ f, sourceLabel, onRetry }: { f: FileItem; sourceLabel: string; onRetry: () => void }) {
  const readable = (f.status === 'done' && !f.noSpeech) || f.status === 'removed';
  const href = `/files/${encodeURIComponent(f.id)}`;
  return (
    <div className="file-row">
      <div className="file-name">
        {readable ? <Link href={href}>{f.name}</Link> : <span className="n">{f.name}</span>}
        {f.subpath && <span className="sub">in {f.subpath}</span>}
      </div>
      <span className="file-len">{f.duration ? clock(f.duration) : ''}</span>
      <FileState f={f} sourceLabel={sourceLabel} />
      <div className="row-actions">
        {readable && <Link className="btn small" href={href}>Open</Link>}
        {f.status === 'failed' && <button className="btn small" onClick={onRetry}>Try again</button>}
      </div>
    </div>
  );
}
