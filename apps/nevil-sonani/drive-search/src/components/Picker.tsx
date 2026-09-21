'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { post } from './usePoll';
import { bytes, plural } from '@/lib/format';
import type { AppStatus, FolderPreview, PickerListing } from '@/lib/api-types';

type Kind = 'drive' | 'local';

// Pick a folder, see what is in it, then commit: the count, the size, and
// what will be left out and why, before a single file is sent.
export function Picker({ status, initialSource }: { status: AppStatus; initialSource: Kind | null }) {
  const router = useRouter();
  const usable = status.sources.filter((s) => s.configured);
  const [kind, setKind] = useState<Kind | null>(initialSource && usable.some((s) => s.kind === initialSource) ? initialSource : usable[0]?.kind ?? null);
  const [root, setRoot] = useState<'root' | 'shared'>('root');
  const [parent, setParent] = useState<string | undefined>(undefined);
  const [listing, setListing] = useState<PickerListing | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);
  const [preview, setPreview] = useState<FolderPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const needsDrive = kind === 'drive' && !status.drive.connected;

  useEffect(() => {
    if (!kind || needsDrive) return;
    let alive = true;
    setListing(null);
    setError(null);
    const p = parent ?? (kind === 'drive' ? root : undefined);
    fetch(`/api/sources/${kind}/folders${p ? `?parent=${encodeURIComponent(p)}` : ''}`, { cache: 'no-store' })
      .then(async (r) => {
        const body = await r.json();
        if (!alive) return;
        if (!r.ok) setError({ status: r.status, message: body.error || 'Could not list folders' });
        else setListing(body);
      })
      .catch(() => alive && setError({ status: 0, message: 'Could not reach the app. Is it still running?' }));
    return () => { alive = false; };
  }, [kind, parent, root, needsDrive]);

  // Inside a folder with nothing picked, the folder you are in is the candidate.
  const here = listing?.trail.length ? listing.trail[listing.trail.length - 1] : null;
  const candidate = selected ?? (here ? { id: here.id, name: here.name } : null);

  useEffect(() => {
    if (!candidate || !kind) { setPreview(null); return; }
    let alive = true;
    setPreview(null);
    setPreviewError(null);
    fetch(`/api/sources/${kind}/preview?folder=${encodeURIComponent(candidate.id)}`, { cache: 'no-store' })
      .then(async (r) => {
        const body = await r.json();
        if (!alive) return;
        if (!r.ok) setPreviewError(body.error || 'Could not look inside that folder');
        else setPreview(body);
      })
      .catch(() => alive && setPreviewError('Could not reach the app. Is it still running?'));
    return () => { alive = false; };
  }, [candidate?.id, kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = (id: string | undefined) => {
    setParent(id);
    setSelected(null);
  };

  async function add() {
    if (!candidate || !kind) return;
    setAdding(true);
    const res = await post<{ folderId: string }>('/api/folders', { kind, id: candidate.id });
    if (res.ok && res.data) router.push(`/folders/${encodeURIComponent(res.data.folderId)}`);
    else {
      setAdding(false);
      setPreviewError(res.error || 'Could not add the folder');
    }
  }

  const alreadyAdded = candidate && (listing?.folders.find((f) => f.id === candidate.id)?.added ?? false);

  return (
    <main className="page">
      <Link className="crumb" href="/"><Icon name="back" size="sm" /> Back</Link>
      <h1>Pick a folder to transcribe</h1>
      <p className="lede">Everything inside it is transcribed, including subfolders. Files added to it later are picked up too.</p>

      {usable.length > 1 && (
        <div className="tabs" role="tablist" aria-label="Where from">
          {usable.map((s) => (
            <button key={s.kind} role="tab" aria-selected={kind === s.kind} onClick={() => { setKind(s.kind); open(undefined); }}>
              {s.kind === 'drive' ? 'Google Drive' : 'This computer'}
            </button>
          ))}
        </div>
      )}

      {!kind && (
        <div className="card empty" style={{ marginTop: 20 }}>
          <h2>Nothing to pick from yet</h2>
          <p>Set up Google Drive in <span className="kbd">.env.local</span> (see the README), or point <span className="kbd">DEMO_FOLDER</span> at a folder of recordings.</p>
        </div>
      )}

      {needsDrive && (
        <div className="card empty" style={{ marginTop: 20 }}>
          <Icon name="drive" size="lg" />
          <h2>Connect Google Drive first</h2>
          <p>Read-only access: nothing in your Drive is changed, moved or shared.</p>
          <a className="btn primary" href="/api/google/connect">Connect Google Drive</a>
        </div>
      )}

      {kind && !needsDrive && (
        <div className="picker">
          <section className="card" aria-label="Folders">
            <nav className="trail" aria-label="Where you are">
              {kind === 'drive' ? (
                <>
                  <button onClick={() => { setRoot('root'); open(undefined); }} aria-current={!parent && root === 'root' ? 'page' : undefined}>My Drive</button>
                  <span className="sep">·</span>
                  <button onClick={() => { setRoot('shared'); open(undefined); }} aria-current={!parent && root === 'shared' ? 'page' : undefined}>Shared with me</button>
                </>
              ) : (
                <button onClick={() => open(undefined)}>Demo folder</button>
              )}
              {listing?.trail.map((t, i) => (
                <span key={t.id} style={{ display: 'contents' }}>
                  <span className="sep" aria-hidden="true">›</span>
                  {i === listing.trail.length - 1 ? <span className="here">{t.name}</span> : <button onClick={() => open(t.id)}>{t.name}</button>}
                </span>
              ))}
            </nav>

            {error ? (
              <div className="empty">
                <h2>{error.status === 401 ? 'Google needs you to sign in again' : 'Could not open this folder'}</h2>
                <p>{error.message}</p>
                {error.status === 401 ? <a className="btn primary" href="/api/google/connect">Connect Google Drive</a> : <button className="btn" onClick={() => open(parent)}>Try again</button>}
              </div>
            ) : !listing ? (
              <ul className="flist" aria-busy="true" aria-label="Loading folders">
                {[70, 55, 80, 45].map((w, i) => <li key={i} style={{ padding: '14px 12px' }}><div className="skel" style={{ height: 16, width: `${w}%` }} /></li>)}
              </ul>
            ) : listing.folders.length === 0 ? (
              <div className="empty">
                <p style={{ margin: 0 }}>{here ? 'No folders inside this one. You can transcribe this folder itself.' : 'No folders here.'}</p>
              </div>
            ) : (
              <ul className="flist" role="listbox" aria-label="Folders">
                {listing.folders.map((f) => (
                  <li key={f.id} className={`frow${selected?.id === f.id ? ' selected' : ''}`} role="option" aria-selected={selected?.id === f.id}>
                    <button className="pick" onClick={() => setSelected({ id: f.id, name: f.name })} onDoubleClick={() => open(f.id)}>
                      <Icon name="folder" />
                      <span>{f.name}</span>
                    </button>
                    {f.added && <span className="added">Added</span>}
                    <button className="into" onClick={() => open(f.id)} aria-label={`Open ${f.name}`}><Icon name="right" /></button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="card preview" aria-live="polite">
            {!candidate ? (
              <>
                <h2>Choose a folder</h2>
                <p className="big" style={{ marginBottom: 0 }}>Tap a folder to see what is inside, or open it with the arrow.</p>
              </>
            ) : (
              <>
                <h2>{candidate.name}</h2>
                {previewError ? (
                  <p className="big" style={{ color: 'var(--danger)' }}>{previewError}</p>
                ) : !preview ? (
                  <>
                    <p className="big">Looking inside…</p>
                    <div className="skel" style={{ height: 42, marginTop: 8 }} />
                  </>
                ) : (
                  <>
                    <p className="big">
                      {preview.count ? `${plural(preview.count, 'recording')}, ${bytes(preview.bytes)}` : 'No recordings in here yet'}
                    </p>
                    {preview.sample.length > 0 && (
                      <ul>
                        {preview.sample.map((s) => <li key={s}>{s}</li>)}
                        {preview.count > preview.sample.length && <li>and {(preview.count - preview.sample.length).toLocaleString('en')} more</li>}
                      </ul>
                    )}
                    {preview.skipped.length > 0 && (
                      <>
                        <p className="fine" style={{ marginTop: 0 }}>Left out, with the reason:</p>
                        <ul>
                          {preview.skipped.slice(0, 4).map((s) => <li key={s.name}>{s.name}: {s.reason.toLowerCase()}</li>)}
                          {preview.skipped.length > 4 && <li>and {(preview.skipped.length - 4).toLocaleString('en')} more</li>}
                        </ul>
                      </>
                    )}
                    {alreadyAdded ? (
                      <Link className="btn" href={`/folders/${encodeURIComponent(candidate.id)}`}>Already added: open it</Link>
                    ) : (
                      <button className="btn primary" onClick={add} disabled={adding}>
                        {adding ? 'Adding…' : preview.count ? `Transcribe ${plural(preview.count, 'recording')}` : 'Watch this folder'}
                      </button>
                    )}
                    <p className="fine">
                      {preview.count ? 'You can leave while it works; it keeps going. ' : 'Nothing to transcribe yet; new recordings will be picked up. '}
                      {status.whipscribe.hasKey ? 'Minutes come from your WhipScribe credit.' : 'Uses WhipScribe’s free guest tier (no API key set).'}
                    </p>
                  </>
                )}
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
