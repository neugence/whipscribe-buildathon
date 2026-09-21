'use client';
import Link from 'next/link';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Icon';
import { FileState } from './FileState';
import { usePoll } from './usePoll';
import { ago, clock, length, speakerName } from '@/lib/format';
import type { TranscriptData } from '@/lib/api-types';

const LANGS: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', hi: 'Hindi', pt: 'Portuguese', it: 'Italian', ja: 'Japanese' };
const RATES = [1, 1.25, 1.5, 2, 0.75];

// Mark every case-insensitive occurrence of the words in `q`.
function withMarks(text: string, q: string): React.ReactNode {
  const words = q.replace(/"/g, ' ').split(/\s+/).filter((w) => w.length > 1).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!words.length) return text;
  const re = new RegExp(`(${words.join('|')})`, 'gi');
  return text.split(re).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : <Fragment key={i}>{part}</Fragment>));
}

export function Transcript({ initial, at, q: initialQ }: { initial: TranscriptData; at: number | null; q: string }) {
  const url = `/api/files/${encodeURIComponent(initial.file.id)}`;
  // Keep polling while it is still being transcribed, then stop.
  const stillWorking = ['queued', 'downloading', 'uploading', 'transcribing'].includes(initial.file.status);
  const { data } = usePoll<TranscriptData>(stillWorking ? `${url}/data` : null, { initial, isBusy: (d) => d.file.status !== 'done' });
  const t = data ?? initial;
  const f = t.file;
  const name = f.name.replace(/\.[^.]+$/, '');
  const sourceLabel = t.folder.source === 'drive' ? 'Drive' : 'this computer';

  const [find, setFind] = useState(initialQ);
  const [hitIdx, setHitIdx] = useState(0);
  const [current, setCurrent] = useState(-1); // segment being played
  const [target, setTarget] = useState<number | null>(null); // segment a link pointed at
  const segRefs = useRef<(HTMLDivElement | null)[]>([]);
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(f.duration ?? 0);
  const [rate, setRate] = useState(1);
  const [audioError, setAudioError] = useState<string | null>(null);

  const segs = t.segments;
  const indexAt = (sec: number) => {
    let idx = 0;
    segs.forEach((s, i) => { if (s.start <= sec + 0.05) idx = i; });
    return idx;
  };

  // Opened from a search result: mark the moment and bring it into view.
  useEffect(() => {
    if (at === null || !segs.length) return;
    const i = indexAt(at);
    setTarget(i);
    setTime(segs[i].start);
    requestAnimationFrame(() => segRefs.current[i]?.scrollIntoView({ block: 'center' }));
    if (audio.current) audio.current.currentTime = segs[i].start;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at, segs.length]);

  const hits = useMemo(() => {
    const words = find.replace(/"/g, ' ').toLowerCase().split(/\s+/).filter((w) => w.length > 1);
    if (!words.length) return [] as number[];
    return segs.map((s, i) => (words.some((w) => s.text.toLowerCase().includes(w)) ? i : -1)).filter((i) => i >= 0);
  }, [find, segs]);

  useEffect(() => setHitIdx(0), [find]);
  const goHit = (k: number) => {
    if (!hits.length) return;
    const n = (k + hits.length) % hits.length;
    setHitIdx(n);
    segRefs.current[hits[n]]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  function playFrom(sec: number) {
    const a = audio.current;
    if (!a) return;
    a.currentTime = sec;
    a.play().catch(() => setAudioError('The browser blocked playback. Press play.'));
  }

  // If the short-lived audio link expires mid-listen, fetch a new one and carry on.
  function onAudioError() {
    const a = audio.current;
    if (!a) return;
    const resumeAt = a.currentTime;
    const retried = a.dataset.retried === '1';
    if (retried) {
      setAudioError('The audio could not be loaded. The transcript is all still here.');
      return;
    }
    a.dataset.retried = '1';
    a.src = `${url}/audio?r=${Date.now()}`;
    a.currentTime = resumeAt;
  }

  const isDone = f.status === 'done' || f.status === 'removed';

  return (
    <main className="page narrow">
      <Link className="crumb" href={`/folders/${encodeURIComponent(t.folder.id)}`}><Icon name="back" size="sm" /> {t.folder.name}</Link>
      <div className="t-head">
        <div className="grow">
          <h1 style={{ overflowWrap: 'anywhere' }}>{name}</h1>
          <div className="folder-meta">
            {f.duration ? <span>{length(f.duration)}</span> : null}
            {t.language && <span>{LANGS[t.language] ?? t.language.toUpperCase()}</span>}
            {f.doneAt && <span>Transcribed {ago(f.doneAt)}</span>}
            {f.subpath && <span>in {f.subpath}</span>}
          </div>
        </div>
        {f.webUrl && <a className="btn" href={f.webUrl} target="_blank" rel="noreferrer">Open in Drive <Icon name="external" size="sm" /></a>}
      </div>

      {!isDone && (
        <div className="card" style={{ marginTop: 20, padding: 18 }}>
          <FileState f={f} sourceLabel={sourceLabel} />
          {['queued', 'downloading', 'uploading', 'transcribing'].includes(f.status) && (
            <p className="muted" style={{ margin: '10px 0 0', fontSize: 14 }}>This page fills in by itself when it is done. You can leave it; the work carries on.</p>
          )}
        </div>
      )}
      {f.errorCode === 'LOCKED' && (
        <div className="banner warn" style={{ marginTop: 18 }}><Icon name="alert" /><span className="grow">{f.error}</span></div>
      )}
      {isDone && f.noSpeech && (
        <div className="card empty" style={{ marginTop: 20 }}>
          <Icon name="wave" size="lg" />
          <h2>No speech in this recording</h2>
          <p>WhipScribe heard music, silence or background noise, so there is nothing to read or search. It did not use any minutes.</p>
        </div>
      )}

      {t.insights?.summary && (
        <section className="card insight" aria-labelledby="sum">
          <h2 id="sum">What it is about</h2>
          <p>{t.insights.summary}</p>
          {t.insights.topics.length > 0 && (
            <div className="topics">{t.insights.topics.slice(0, 8).map((x) => <span key={x} className="topic">{x}</span>)}</div>
          )}
        </section>
      )}

      {segs.length > 0 && (
        <>
          <div className="t-tools">
            <form className="inline-search" role="search" onSubmit={(e) => { e.preventDefault(); goHit(hitIdx + 1); }}>
              <Icon name="search" />
              <input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Find in this transcript" aria-label="Find in this transcript" enterKeyHint="search" />
            </form>
            {find.trim().length > 1 && (
              <>
                <span className="t-count" role="status">{hits.length ? `${hitIdx + 1} of ${hits.length}` : 'Not found'}</span>
                <button className="btn small" onClick={() => goHit(hitIdx - 1)} disabled={!hits.length} aria-label="Previous match">↑</button>
                <button className="btn small" onClick={() => goHit(hitIdx + 1)} disabled={!hits.length} aria-label="Next match">↓</button>
              </>
            )}
          </div>

          {target !== null && t.hasAudio && (
            <div className="card jump-note">
              <span className="grow" style={{ flex: 1 }}>Opened at <b>{clock(segs[target].start)}</b>, the moment from your search.</span>
              <button className="btn primary small" onClick={() => playFrom(segs[target].start)}><Icon name="play" size="sm" /> Play from {clock(segs[target].start)}</button>
            </div>
          )}

          <div className="card t-body" style={{ marginTop: 14 }}>
            {segs.map((s, i) => {
              const showWho = s.speaker && (i === 0 || segs[i - 1].speaker !== s.speaker);
              return (
                <div
                  key={s.idx}
                  ref={(el) => { segRefs.current[i] = el; }}
                  className={`seg${current === i ? ' playing' : ''}${target === i ? ' target' : ''}`}
                >
                  <button className="at" onClick={() => (t.hasAudio ? playFrom(s.start) : undefined)} aria-label={t.hasAudio ? `Play from ${clock(s.start)}` : clock(s.start)} disabled={!t.hasAudio}>
                    {clock(s.start)}
                  </button>
                  <p>
                    {showWho && <span className="who">{speakerName(s.speaker)}</span>}
                    {withMarks(s.text, find)}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {t.hasAudio && isDone && !f.noSpeech && (
        <div className="player" role="region" aria-label="Player">
          <div className="player-in">
            <button className="play" onClick={() => (playing ? audio.current?.pause() : audio.current?.play().catch(() => setAudioError('Press play again to start.')))} aria-label={playing ? 'Pause' : 'Play'}>
              <Icon name={playing ? 'pause' : 'play'} />
            </button>
            {audioError ? (
              <span className="player-note" role="status">{audioError}</span>
            ) : (
              <input
                className="scrub"
                type="range"
                min={0}
                max={dur || 0}
                step={0.1}
                value={time}
                onChange={(e) => { if (audio.current) audio.current.currentTime = Number(e.target.value); }}
                aria-label="Position"
                aria-valuetext={`${clock(time)} of ${clock(dur)}`}
              />
            )}
            <span className="time">{clock(time)} / {clock(dur)}</span>
            <button className="rate" onClick={() => { const r = RATES[(RATES.indexOf(rate) + 1) % RATES.length]; setRate(r); if (audio.current) audio.current.playbackRate = r; }} aria-label={`Speed ${rate} times`}>
              {rate}×
            </button>
          </div>
          <audio
            ref={audio}
            src={`${url}/audio`}
            preload="metadata"
            onPlay={() => { setPlaying(true); setAudioError(null); }}
            onPause={() => setPlaying(false)}
            onSeeked={(e) => setTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => { setDur(e.currentTarget.duration || f.duration || 0); if (target !== null) e.currentTarget.currentTime = segs[target].start; }}
            onTimeUpdate={(e) => {
              const now = e.currentTarget.currentTime;
              setTime(now);
              const i = indexAt(now);
              if (i !== current && playing) {
                setCurrent(i);
                const el = segRefs.current[i];
                const r = el?.getBoundingClientRect();
                if (r && (r.top < 130 || r.bottom > window.innerHeight - 100)) el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
              }
            }}
            onError={onAudioError}
          />
        </div>
      )}
    </main>
  );
}
