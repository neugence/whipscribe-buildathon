'use client';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { post, usePoll } from './usePoll';
import type { AppStatus } from '@/lib/api-types';

export function Topbar({ initial }: { initial: AppStatus }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(path === '/search' ? params.get('q') || '' : '');
  const { data: status, offline, refresh } = usePoll<AppStatus>('/api/status', { initial, isBusy: (s) => s.active > 0, idle: 8000 });
  const s = status ?? initial;

  useEffect(() => {
    const again = () => refresh();
    window.addEventListener('app:changed', again);
    return () => window.removeEventListener('app:changed', again);
  }, [refresh]);

  // The layout does not re-render on navigation, so ask again on every page:
  // adding the first folder should show search and activity straight away.
  useEffect(() => {
    refresh();
    if (path === '/search') setQ(params.get('q') || '');
  }, [path, params, refresh]);

  const activity = s.paused
    ? { dot: 'warn', text: 'Paused' }
    : s.active
      ? { dot: 'live', text: `Transcribing ${s.active}` }
      : s.done
        ? { dot: 'ok', text: 'All caught up' }
        : null;

  return (
    <>
      <header className="topbar">
        <div className="topbar-in">
          <Link href="/" className="brand" aria-label="Folders, home">
            <span className="brand-mark" aria-hidden="true">W</span>
            Folders <small>on WhipScribe</small>
          </Link>
          {s.folders > 0 && path !== '/search' && (
            <form
              className="topsearch"
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
              }}
            >
              <Icon name="search" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search what was said, in every recording" aria-label="Search every recording" enterKeyHint="search" />
            </form>
          )}
          {s.folders > 0 && path !== '/search' && (
            <Link href="/search" className="btn ghost small only-phone" aria-label="Search">
              <Icon name="search" />
            </Link>
          )}
          {activity && (
            <span className="activity" role="status">
              <span className={`dot ${activity.dot}`} aria-hidden="true" />
              {activity.text}
            </span>
          )}
        </div>
      </header>
      {offline && (
        <div className="banner-wrap">
          <div className="banner warn" role="alert">
            <Icon name="offline" />
            <span className="grow"><b>Can’t reach the app right now.</b> Anything already queued keeps going on the server; this page catches up when it is back.</span>
          </div>
        </div>
      )}
      {!offline && s.paused && <PausedBanner reason={s.paused} />}
    </>
  );
}

function PausedBanner({ reason }: { reason: 'credit' | 'quota' | 'drive' }) {
  const [busy, setBusy] = useState(false);
  const copy = {
    credit: { title: 'The queue is paused: out of WhipScribe credit.', text: 'Nothing is lost. Add credit, then resume.', action: <a className="btn small" href="https://whipscribe.com/pricing" target="_blank" rel="noreferrer">Add credit <Icon name="external" size="sm" /></a> },
    quota: { title: 'The queue is paused: today’s free minutes are used up.', text: 'It can resume tomorrow, or now with an API key that has credit.', action: null },
    drive: { title: 'The queue is paused: Google Drive needs you to sign in again.', text: 'Google sign-ins for apps in testing expire after 7 days.', action: <a className="btn small" href="/api/google/connect">Connect Drive</a> },
  }[reason];
  return (
    <div className="banner-wrap">
      <div className="banner warn" role="alert">
        <Icon name="alert" />
        <span className="grow"><b>{copy.title}</b> {copy.text}</span>
        {copy.action}
        {reason !== 'drive' && (
          <button className="btn small primary" disabled={busy} onClick={async () => { setBusy(true); await post('/api/queue/resume'); setBusy(false); }}>
            Resume
          </button>
        )}
      </div>
    </div>
  );
}
