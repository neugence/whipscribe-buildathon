import { useEffect, useMemo, useRef, useState } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { AlertCircle, ArrowLeft, Copy, Home, HardDriveDownload, Loader2, RefreshCw, Search, ShieldCheck, UploadCloud } from 'lucide-react';
import type { Ctx } from './ctx';
import { api, errorMessage } from './api';
import { clock, normalize, speakerName, toPlain } from './transcript';
import type { Transcript } from './types';
import { fmtDur, fmtStamp, Pill } from './ui';

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function Detail({ c, id, initialQ = '' }: { c: Ctx; id: string; initialQ?: string }) {
  const rec = c.lib.recordings.find((r) => r.id === id);
  const [raw, setRaw] = useState<unknown>(null);
  const [audioDur, setAudioDur] = useState(0);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState(initialQ);
  const [time, setTime] = useState(0);
  const [renaming, setRenaming] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let dead = false;
    setRaw(null);
    if (rec?.status !== 'ready') return;
    setLoading(true);
    (async () => {
      let data = await api.loadTranscript(id).catch(() => null);
      if (!data && rec.jobId) {
        data = await api.jobResult(rec.jobId); // local copy missing: re-fetch from WhipScribe
        await api.saveTranscript(id, data, toPlain(normalize(data, rec.duration)));
      }
      if (!dead && data) setRaw(data);
    })().catch((e) => c.toast(errorMessage(e), 'error')).finally(() => !dead && setLoading(false));
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, rec?.status]);

  const t: Transcript | null = useMemo(() => (raw ? normalize(raw, rec?.duration || audioDur) : null), [raw, rec?.duration, audioDur]);
  const names = rec?.speakerNames ?? {};
  const activeIdx = useMemo(() => (t ? t.turns.findIndex((x, i) => time >= x.start && (i === t.turns.length - 1 || time < t.turns[i + 1].start)) : -1), [t, time]);
  useEffect(() => { if (!audio.current?.paused) { const el = activeRef.current, box = el?.closest('.main') as HTMLElement | null; if (el && box) { const r = el.getBoundingClientRect(), b = box.getBoundingClientRect(); if (r.bottom > b.bottom - 40 || r.top < b.top + 120) box.scrollBy({ top: r.top - b.top - 160, behavior: 'smooth' }); } } }, [activeIdx]);

  if (!rec) return <div className="errorBox"><strong>Recording not found</strong><button className="btn" onClick={() => c.go({ name: 'library' })}>Back to library</button></div>;

  const seek = (sec: number) => {
    const a = audio.current;
    if (!a) return;
    const go = () => { a.currentTime = sec; setTime(sec); void a.play().catch(() => undefined); };
    if (a.readyState >= 1) go(); else { a.addEventListener('loadedmetadata', go, { once: true }); a.load(); }
  };
  const canSeek = !!rec.path && !rec.remote;
  const renameSpeaker = async (raw: string, value: string) => {
    setRenaming(null);
    const v = value.trim();
    const next = { ...names };
    if (v) next[raw] = v; else delete next[raw];
    await api.patch(rec.id, { speakerNames: next });
    await c.refreshLib();
  };
  const copy = async () => {
    if (!t) return;
    await navigator.clipboard.writeText(toPlain(t, names));
    c.toast('Transcript copied.');
  };
  const re = q.trim() ? new RegExp(`(${esc(q.trim())})`, 'ig') : null;
  const hl = (s: string) => (re ? s.split(re).map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p)) : s);
  const canUpload = c.settings?.hasKey && c.online;

  return (
    <>
      <div className="crumbs">
        <button className="btn ghost" onClick={() => c.go({ name: 'today' })}><Home size={15} /> Home</button>
        <button className="btn ghost" onClick={() => c.go({ name: 'library' })}><ArrowLeft size={15} /> Library</button>
      </div>
      <header className="pageHead">
        <div><h1>{rec.title}</h1><p>{fmtStamp(rec.startedAt)} · {fmtDur(rec.duration)}{rec.sources ? ` · ${rec.sources.mic && rec.sources.system ? 'mic + system audio' : rec.sources.system ? 'system audio' : 'microphone'}` : ''}</p></div>
        <Pill status={rec.status} />
      </header>

      {rec.recovered && <div className="note"><ShieldCheck size={16} /> The app closed unexpectedly during this call. The audio up to that moment was recovered.</div>}
      {rec.warning && <div className="note"><AlertCircle size={16} /> {rec.warning}</div>}

      {rec.path && !rec.remote && rec.status !== 'recording' && <div className="playerWrap"><audio ref={audio} className="player" controls preload="metadata" src={convertFileSrc(rec.path)} onLoadedMetadata={(e) => { const d = e.currentTarget.duration; if (Number.isFinite(d)) setAudioDur(d); }} onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} /></div>}

      {rec.status === 'error' && (
        <div className="errorBox"><AlertCircle size={18} /><div><strong>{rec.jobId ? 'Transcription failed' : 'Upload failed'}</strong><p>{rec.error}</p><p className="muted">Your audio is safe on this computer.</p><button className="btn" disabled={!canUpload} onClick={() => c.upload(rec.id)}><RefreshCw size={14} /> Try again</button></div></div>
      )}
      {rec.status === 'saved' && (
        <div className="stateBox"><HardDriveDownload size={26} /><h3>Saved on this computer</h3><p>{!c.settings?.hasKey ? 'Add your WhipScribe API key in Settings to transcribe it.' : !c.online ? 'You are offline. It uploads automatically when you are back online.' : 'Ready to transcribe.'}</p><button className="btn primary" disabled={!canUpload} onClick={() => c.upload(rec.id)}><UploadCloud size={15} /> Transcribe with WhipScribe</button></div>
      )}
      {(rec.status === 'uploading' || rec.status === 'processing') && (
        <div className="stateBox"><Loader2 size={26} className="spin" /><h3>{rec.status === 'uploading' ? 'Uploading…' : `WhipScribe is transcribing${typeof rec.progress === 'number' ? ` · ${Math.round(rec.progress * 100)}%` : ''}`}</h3><p>You can keep working or close the app; it picks up where it left off.</p></div>
      )}
      {rec.status === 'recording' && <div className="stateBox"><h3>Recording in progress</h3></div>}

      {rec.status === 'ready' && (
        <>
          <div className="toolbar">
            <div className="search grow"><Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search this transcript" aria-label="Search transcript" /></div>
            <button className="btn" onClick={copy} disabled={!t}><Copy size={14} /> Copy</button>
          </div>
          {re && t && <p className="hitCount">{t.turns.filter((x) => x.text.toLowerCase().includes(q.trim().toLowerCase())).length} matching lines</p>}
          {loading && <p className="muted">Loading transcript…</p>}
          {t && t.turns.length === 0 && <div className="note">WhipScribe returned no speech for this recording.</div>}
          {t && (
            <div className="transcript">
              {t.turns.map((x, i) => {
                const shown = !re || x.text.toLowerCase().includes(q.trim().toLowerCase());
                if (!shown) return null;
                const idx = Math.max(0, t.speakers.indexOf(x.speaker));
                return (
                  <div key={i} ref={i === activeIdx ? activeRef : undefined} className={`turn ${i === activeIdx ? 'active' : ''}`} onClick={() => canSeek && seek(x.start)} title={canSeek ? 'Click to play from here' : undefined}>
                    <div className="who" onClick={(e) => e.stopPropagation()}>
                      {i > 0 && !re && t.turns[i - 1].speaker === x.speaker && renaming !== x.speaker ? null : renaming === x.speaker ? (
                        <input autoFocus defaultValue={speakerName(x.speaker, t.speakers, names)} onBlur={(e) => renameSpeaker(x.speaker, e.currentTarget.value)} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setRenaming(null); }} />
                      ) : (
                        <button className={`spk s${idx % 6}`} title="Click to rename this speaker everywhere" onClick={() => setRenaming(x.speaker)}>{speakerName(x.speaker, t.speakers, names)}</button>
                      )}
                      <button className="stamp" onClick={() => seek(x.start)} disabled={!canSeek} title="Play from here">{clock(x.start)}</button>
                    </div>
                    <p>{hl(x.text)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}
