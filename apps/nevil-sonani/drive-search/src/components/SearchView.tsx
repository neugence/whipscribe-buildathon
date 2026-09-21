'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { clock, length, plural, speakerName } from '@/lib/format';
import type { SearchResponse } from '@/lib/api-types';

const START = '\u0001';
const END = '\u0002';

// The words the index actually matched ("pricing" for a search on "prices"),
// so the transcript can highlight exactly those.
function matched(snippets: string[]): string {
  const words = new Set<string>();
  for (const s of snippets) for (const m of s.matchAll(new RegExp(`${START}([^${END}]*)${END}`, 'g'))) words.add(m[1].toLowerCase());
  return [...words].join(' ');
}

// The index marks matches with two control characters; turn them into <mark>.
function Snippet({ text }: { text: string }) {
  const parts = text.split(new RegExp(`(${START}[^${END}]*${END})`));
  return (
    <>
      {parts.map((p, i) => (p.startsWith(START) ? <mark key={i}>{p.slice(1, -1)}</mark> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

export function SearchView({ folders, q: initialQ, folder: initialFolder }: { folders: { id: string; name: string }[]; q: string; folder: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [folder, setFolder] = useState(initialFolder);
  const [res, setRes] = useState<SearchResponse | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const seq = useRef(0);

  // Search as you type, a beat after the last key, and keep the address shareable.
  useEffect(() => {
    const term = q.trim();
    const params = new URLSearchParams();
    if (term) params.set('q', term);
    if (folder) params.set('folder', folder);
    router.replace(`/search${params.size ? `?${params}` : ''}`, { scroll: false });
    if (!term) {
      setRes(null);
      setState('idle');
      return;
    }
    const id = ++seq.current;
    setState('loading');
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?${params}`, { cache: 'no-store' });
        const body = (await r.json()) as SearchResponse;
        if (id === seq.current) {
          setRes(body);
          setState('idle');
        }
      } catch {
        if (id === seq.current) setState('error');
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [q, folder, router]);

  const moments = res?.files.reduce((a, f) => a + f.hits.length, 0) ?? 0;

  return (
    <main className="page narrow">
      <h1 className="sr">Search</h1>
      <form className="search-big" role="search" onSubmit={(e) => e.preventDefault()}>
        <Icon name="search" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search what was said" aria-label="Search what was said" autoFocus={!initialQ} enterKeyHint="search" />
      </form>

      <div className="search-tools">
        {folders.length > 1 && (
          <label>
            <span className="sr">Where to search</span>
            <select value={folder} onChange={(e) => setFolder(e.target.value)}>
              <option value="">All folders</option>
              {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </label>
        )}
        <span role="status">
          {state === 'loading' && 'Searching…'}
          {state === 'error' && 'Could not search just now. Is the app still running?'}
          {state === 'idle' && res && res.total > 0 && `${plural(moments, 'moment')} in ${plural(res.files.length, 'recording')}`}
        </span>
        <span className="muted">Tip: “quote a phrase” to match it exactly.</span>
      </div>

      {!q.trim() && (
        <div className="card empty">
          <Icon name="search" size="lg" />
          <h2>Search every recording at once</h2>
          <p>Type a word someone said. Similar forms count too: “price” finds “pricing”. Each result opens at the second it was said.</p>
        </div>
      )}

      {q.trim() && res && res.total === 0 && state === 'idle' && (
        <div className="card empty" role="status">
          <h2>Nobody said “{q.trim()}” in {folder ? 'this folder' : 'your recordings'}</h2>
          <p>Try a shorter word or a different spelling.{res.pending ? ` ${plural(res.pending, 'recording is', 'recordings are')} still being transcribed and can be searched when they are done.` : ''}</p>
        </div>
      )}

      {res?.files.map((f) => (
        <section key={f.fileId} className="card result" aria-label={f.fileName}>
          <div className="result-head">
            <Link href={`/files/${encodeURIComponent(f.fileId)}?q=${encodeURIComponent(matched(f.hits.map((h) => h.snippet)) || q.trim())}`}>{f.fileName.replace(/\.[^.]+$/, '')}</Link>
            <span className="where">{f.folderName}{f.subpath ? ` / ${f.subpath}` : ''}{f.duration ? ` · ${length(f.duration)}` : ''}</span>
          </div>
          {f.hits.slice(0, 5).map((h, i) => (
            <Link key={i} className="hit" href={`/files/${encodeURIComponent(f.fileId)}?t=${h.start}&q=${encodeURIComponent(matched([h.snippet]) || q.trim())}`}>
              <span className="at"><Icon name="play" size="sm" />{clock(h.start)}</span>
              <span className="txt">
                {h.speaker && <span className="who">{speakerName(h.speaker)}</span>}
                <Snippet text={h.snippet} />
              </span>
            </Link>
          ))}
          {f.hits.length > 5 && (
            <Link className="hit" href={`/files/${encodeURIComponent(f.fileId)}?q=${encodeURIComponent(matched(f.hits.map((h) => h.snippet)) || q.trim())}`}>
              <span />
              <span className="txt" style={{ color: 'var(--green)', fontWeight: 600 }}>{plural(f.hits.length - 5, 'more moment')} in this recording</span>
            </Link>
          )}
        </section>
      ))}

      {res && res.total > 0 && res.pending > 0 && (
        <p className="muted" style={{ fontSize: 14 }}>{plural(res.pending, 'recording is', 'recordings are')} still being transcribed; they join the results when they are done.</p>
      )}
    </main>
  );
}
