import { useEffect, useRef, useState } from 'react';
import { CloudDownload, Folder as FolderIcon, FolderPlus, Library as LibIcon, Pencil, Search, Trash2, X } from 'lucide-react';
import type { Ctx } from './ctx';
import { api, errorMessage } from './api';
import type { Rec } from './types';
import { Empty, fmtDur, fmtStamp, Modal, Pill } from './ui';

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function LibraryView({ c, folder }: { c: Ctx; folder?: string }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Map<string, string> | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [del, setDel] = useState<Rec | null>(null);
  const [delRemote, setDelRemote] = useState(true);
  const [busy, setBusy] = useState(false);
  const [newFolder, setNewFolder] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(timer.current);
    if (!q.trim()) { setHits(null); return; }
    timer.current = window.setTimeout(() => {
      api.search(q).then((r) => setHits(new Map(r.map((x) => [x.id, x.snippet])))).catch(() => setHits(new Map()));
    }, 180);
    return () => window.clearTimeout(timer.current);
  }, [q]);

  const hi = (s: string) => {
    const t = q.trim();
    if (!t) return s;
    return s.split(new RegExp(`(${esc(t)})`, 'ig')).map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p));
  };
  const open = (id: string) => c.go({ name: 'detail', id, q: q.trim() || undefined });

  const folders = c.lib.folders;
  const rows = c.lib.recordings.filter((r) => (folder === undefined || folder === 'all' ? true : folder === 'none' ? !r.folderId : r.folderId === folder) && (!hits || hits.has(r.id)));
  const current = folders.find((f) => f.id === folder);

  const rename = async (r: Rec, title: string) => {
    setEditing(null);
    const t = title.trim();
    if (!t || t === r.title) return;
    await api.patch(r.id, { title: t }).catch((e) => c.toast(errorMessage(e), 'error'));
    await c.refreshLib();
  };
  const move = async (r: Rec, folderId: string) => {
    await api.patch(r.id, { folderId: folderId || null });
    await c.refreshLib();
  };
  const confirmDelete = async () => {
    if (!del) return;
    setBusy(true);
    try {
      await api.remove(del.id, !!del.jobId && delRemote);
      c.toast('Recording deleted.');
      setDel(null);
      await c.refreshLib();
    } catch (e) {
      c.toast(`Not deleted: ${errorMessage(e)}`, 'error');
    } finally {
      setBusy(false);
    }
  };
  const importRemote = async () => {
    setBusy(true);
    try {
      const jobs = await api.remoteJobs(50);
      const known = new Set(c.lib.recordings.map((r) => r.jobId).filter(Boolean));
      let added = 0;
      for (const j of jobs) {
        const jobId = String(j.job_id ?? j.id ?? '');
        if (!jobId || known.has(jobId)) continue;
        const name = String(j.filename ?? 'WhipScribe job').replace(/\.[a-z0-9]{2,4}$/i, '');
        await api.patch('remote-' + jobId, {
          title: name, startedAt: String(j.created_at ?? new Date().toISOString()), duration: Number(j.audio_duration_seconds ?? 0),
          status: 'processing', jobId, remote: true,
        });
        c.resumePoll('remote-' + jobId, jobId);
        added++;
      }
      await c.refreshLib();
      c.toast(added ? `Imported ${added} job${added > 1 ? 's' : ''} from WhipScribe.` : 'Nothing new on WhipScribe.');
    } catch (e) {
      c.toast(errorMessage(e), 'error');
    } finally {
      setBusy(false);
    }
  };
  const addFolder = async (name: string) => {
    setNewFolder(false);
    const n = name.trim();
    if (!n) return;
    await api.setFolders([...folders, { id: crypto.randomUUID(), name: n }]);
    await c.refreshLib();
  };
  const renameFolder = async () => {
    if (!current) return;
    const n = window.prompt('Rename folder', current.name)?.trim();
    if (!n) return;
    await api.setFolders(folders.map((f) => (f.id === current.id ? { ...f, name: n } : f)));
    await c.refreshLib();
  };
  const deleteFolder = async () => {
    if (!current || !window.confirm(`Delete folder “${current.name}”? Recordings inside are kept.`)) return;
    await api.setFolders(folders.filter((f) => f.id !== current.id));
    await c.refreshLib();
    c.go({ name: 'library' });
  };

  return (
    <>
      <header className="pageHead">
        <div><h1>{current ? current.name : folder === 'none' ? 'Unfiled' : 'Library'}</h1><p>{rows.length} recording{rows.length === 1 ? '' : 's'}{hits ? ' match your search' : ''}</p></div>
        <div className="row">
          {current && <><button className="btn ghost" onClick={renameFolder}><Pencil size={14} /> Rename</button><button className="btn ghost" onClick={deleteFolder}><Trash2 size={14} /> Delete folder</button></>}
          <button className="btn" onClick={() => setNewFolder(true)}><FolderPlus size={15} /> New folder</button>
          <button className="btn" disabled={busy || !c.settings?.hasKey || !c.online} onClick={importRemote} title="Pull jobs already on your WhipScribe account into this library"><CloudDownload size={15} /> Import from WhipScribe</button>
        </div>
      </header>

      {newFolder && <form className="inlineForm" onSubmit={(e) => { e.preventDefault(); addFolder(String(new FormData(e.currentTarget).get('n') ?? '')); }}><FolderIcon size={15} /><input name="n" autoFocus placeholder="Folder name" onKeyDown={(e) => e.key === 'Escape' && setNewFolder(false)} /><button className="btn primary">Create</button><button type="button" className="iconBtn" onClick={() => setNewFolder(false)}><X size={15} /></button></form>}

      <div className="search"><Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles and everything that was said…" aria-label="Search recordings" />{q && <button className="iconBtn plain" onClick={() => setQ('')} aria-label="Clear search"><X size={14} /></button>}</div>

      {rows.length === 0 ? (
        <Empty icon={<LibIcon size={22} />} title={q ? 'No matches' : 'Nothing here yet'} text={q ? 'Search covers titles and transcript text.' : 'Recordings appear here the moment you start them, even before they are transcribed.'} />
      ) : (
        <div className="list">
          {rows.map((r) => (
            <div key={r.id} className="libRow">
              <div className="grow" onClick={() => editing !== r.id && open(r.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && editing !== r.id && open(r.id)}>
                {editing === r.id ? (
                  <input className="titleEdit" autoFocus defaultValue={r.title} onClick={(e) => e.stopPropagation()} onBlur={(e) => rename(r, e.currentTarget.value)} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setEditing(null); }} />
                ) : <strong>{hi(r.title)}</strong>}
                <span>{fmtStamp(r.startedAt)} · {fmtDur(r.duration)}{r.folderId ? ` · ${folders.find((f) => f.id === r.folderId)?.name ?? ''}` : ''}{r.recovered ? ' · recovered' : ''}</span>
                {hits?.get(r.id) && <em className="snippet">…{hi(hits.get(r.id) ?? '')}…</em>}
              </div>
              <Pill status={r.status} />
              <select className="mini" value={r.folderId ?? ''} onChange={(e) => move(r, e.target.value)} aria-label={`Folder for ${r.title}`}>
                <option value="">No folder</option>{folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <button className="iconBtn" onClick={() => setEditing(r.id)} aria-label={`Rename ${r.title}`}><Pencil size={14} /></button>
              <button className="iconBtn danger" onClick={() => { setDel(r); setDelRemote(true); }} aria-label={`Delete ${r.title}`}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {del && (
        <Modal title="Delete recording?" onClose={() => setDel(null)}>
          <p className="muted">“{del.title}” and its transcript will be removed from this computer. This cannot be undone.</p>
          {del.jobId && <label className="check"><input type="checkbox" checked={delRemote} onChange={(e) => setDelRemote(e.target.checked)} /> Also delete it from WhipScribe</label>}
          <div className="modalActions"><button className="btn" onClick={() => setDel(null)}>Cancel</button><button className="btn danger" disabled={busy} onClick={confirmDelete}>{busy ? 'Deleting…' : 'Delete'}</button></div>
        </Modal>
      )}
    </>
  );
}
