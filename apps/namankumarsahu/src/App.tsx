import { useCallback, useEffect, useRef, useState } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { Folder, Home, Library, Settings as Cog, Shield, Trash2, Wifi, WifiOff, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, errorMessage } from './api';
import type { Ctx, View } from './ctx';
import type { Library as Lib, Meeting, RecInfo, Settings } from './types';
import { normalize, toPlain } from './transcript';
import { RecordingBar } from './RecordingBar';
import { Today } from './Today';
import { LibraryView } from './Library';
import { Detail } from './Detail';
import { SettingsView } from './Settings';
import { fmtDur, Modal } from './ui';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const DONE = ['done', 'completed', 'complete', 'succeeded'];
const FAILED = ['failed', 'error', 'cancelled', 'canceled'];

export default function App() {
  const [view, setView] = useState<View>({ name: 'today' });
  const [settings, setSettings] = useState<Settings | null>(null);
  const [lib, setLib] = useState<Lib>({ recordings: [], folders: [] });
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingsError, setMeetingsError] = useState<string>();
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [now, setNow] = useState(Date.now());
  const [rec, setRec] = useState<{ id: string; title: string; info: RecInfo; paused: boolean } | null>(null);
  const [ask, setAsk] = useState<string | null>(null); // recording waiting for the user's OK to leave this computer
  const [toasts, setToasts] = useState<{ id: number; text: string; kind: 'error' | 'info' }[]>([]);
  const polling = useRef(new Set<string>());
  const uploading = useRef(new Set<string>());
  const settingsRef = useRef<Settings | null>(null);
  settingsRef.current = settings;

  const toast = useCallback((text: string, kind: 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 9000 : 4500);
  }, []);

  const refreshLib = useCallback(async () => { setLib(await api.library()); }, []);
  const refreshSettings = useCallback(async () => { setSettings(await api.settings()); }, []);

  const refreshMeetings = useCallback(() => {
    if (!settingsRef.current?.googleConnected) { setMeetings([]); setMeetingsError(undefined); return; }
    setMeetingsLoading(true);
    api.gcalEvents()
      .then((m) => { setMeetings(m); setMeetingsError(undefined); })
      .catch((e) => { setMeetingsError(errorMessage(e)); refreshSettings(); })
      .finally(() => setMeetingsLoading(false));
  }, [refreshSettings]);

  // ---- WhipScribe job polling (survives transient network errors; resumes after restart)
  const poll = useCallback(async (id: string, jobId: string) => {
    if (polling.current.has(id)) return;
    polling.current.add(id);
    const t0 = Date.now();
    let delay = 3000, fails = 0, lastProg = -1;
    try {
      for (;;) {
        if (Date.now() - t0 > 90 * 60_000) throw new Error('Still processing after 90 minutes. Try again later; the job may still finish on WhipScribe.');
        let job: Record<string, unknown>;
        try { job = await api.jobStatus(jobId); fails = 0; }
        catch (e) {
          const m = errorMessage(e);
          if (/rejected the API key|Not found|no longer has/.test(m) || ++fails >= 6) throw new Error(m);
          await sleep(delay); continue;
        }
        const st = String(job.status ?? '').toLowerCase();
        if (DONE.includes(st)) {
          if (job.locked === true) {
            // Paywalled: the result endpoint would only return a preview. Keep the audio, explain, allow retry after adding credit.
            throw new Error(`The transcript is locked until this WhipScribe account has credit. Add credit at ${String(job.unlock_url ?? 'whipscribe.com/credits')}, then press Try again.`);
          }
          const raw = await api.jobResult(jobId);
          const dur = Number(job.audio_duration_seconds ?? 0);
          const tr = normalize(raw, dur);
          await api.saveTranscript(id, raw, toPlain(tr));
          const noSpeech = job.speech_detected === false;
          await api.patch(id, { status: 'ready', error: null, progress: null, warning: noSpeech ? 'WhipScribe found no speech in this recording (music, silence or very low volume). Check that the right audio source was on.' : null, ...(dur > 0 ? { duration: dur } : {}) });
          toast(noSpeech ? 'No speech detected in this recording.' : 'Transcript ready.', noSpeech ? 'error' : 'info');
          return;
        }
        if (FAILED.includes(st)) throw new Error(String(job.error ?? job.message ?? 'WhipScribe could not process this recording.'));
        const prog = typeof job.progress === 'number' ? job.progress : undefined;
        if (prog !== undefined && Math.abs(prog - lastProg) >= 0.05) { lastProg = prog; await api.patch(id, { progress: prog }).catch(() => undefined); await refreshLib(); }
        await sleep(3000); // docs recommend 3 s while queued/processing
      }
    } catch (e) {
      await api.patch(id, { status: 'error', error: errorMessage(e) }).catch(() => undefined);
      toast(errorMessage(e), 'error');
    } finally {
      polling.current.delete(id);
      await refreshLib();
    }
  }, [refreshLib, toast]);

  const upload = useCallback(async (id: string) => {
    if (uploading.current.has(id)) return;
    uploading.current.add(id);
    setLib((l) => ({ ...l, recordings: l.recordings.map((r) => (r.id === id ? { ...r, status: 'uploading', error: undefined } : r)) }));
    try {
      const r = await api.upload(id);
      await refreshLib();
      if (r.jobId) void poll(id, r.jobId);
    } catch (e) {
      toast(errorMessage(e), 'error');
    } finally {
      uploading.current.delete(id);
      await refreshLib();
    }
  }, [poll, refreshLib, toast]);

  // ---- recording controls
  const start = useCallback(async (title: string, meetingId?: string) => {
    const s = settingsRef.current;
    try {
      const { record, info } = await api.startRecording(title, s?.captureMic ?? true, s?.captureSystem ?? true, meetingId);
      setRec({ id: record.id, title: record.title, info, paused: false });
      info.warnings.forEach((w) => toast(w, 'error'));
      await refreshLib();
    } catch (e) { toast(errorMessage(e), 'error'); }
  }, [refreshLib, toast]);

  const stop = useCallback(async () => {
    try {
      const saved = await api.stopRecording();
      setRec(null);
      await refreshLib();
      setView({ name: 'detail', id: saved.id });
      setAsk(saved.id); // nothing is sent anywhere until the user says yes
    } catch (e) { toast(errorMessage(e), 'error'); }
  }, [refreshLib, toast]);

  const pause = useCallback(async () => {
    try { const p = await api.togglePause(); setRec((r) => (r ? { ...r, paused: p } : r)); } catch (e) { toast(errorMessage(e), 'error'); }
  }, [toast]);

  // ---- boot: load everything, re-attach to in-flight work
  useEffect(() => {
    (async () => {
      const [s, l, active] = await Promise.all([api.settings(), api.library(), api.recordingState()]);
      setSettings(s); settingsRef.current = s;
      const recovered = l.recordings.filter((r) => r.recovered && r.status === 'saved').length;
      if (recovered) toast(`Recovered ${recovered} recording${recovered > 1 ? 's' : ''} from an interrupted session.`);
      if (active) { const r = l.recordings.find((x) => x.id === active.id); setRec({ id: active.id, title: r?.title ?? 'Recording', info: active.info, paused: active.paused }); }
      for (const r of l.recordings) {
        if (r.status === 'uploading') await api.patch(r.id, { status: 'saved' }); // interrupted upload; idempotency key prevents duplicates
        else if (r.status === 'processing' && r.jobId) void poll(r.id, r.jobId);
      }
      const fresh = await api.library();
      setLib(fresh);
      if (s.googleConnected) refreshMeetings();
    })().catch((e) => toast(errorMessage(e), 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- connectivity: queue pending uploads when we come back online
  useEffect(() => {
    const on = () => {
      setOnline(true);
      const s = settingsRef.current;
      if (!s?.hasKey) return;
      api.library().then((l) => l.recordings
        .filter((r) => r.status === 'error' && !r.jobId && /network/i.test(r.error ?? ''))
        .forEach((r) => void upload(r.id)));
    };
    const off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, [upload]);

  // ---- the shell never scrolls: undo any programmatic/overscroll shift of the page itself
  useEffect(() => {
    const fix = (e: Event) => {
      const t = e.target as HTMLElement | Document;
      const el = t === document ? document.scrollingElement : (t as HTMLElement);
      if (el && (el === document.scrollingElement || el === document.body || el.id === 'root' || el.classList?.contains('app') || el.classList?.contains('sidebar'))) { el.scrollTop = 0; el.scrollLeft = 0; }
    };
    window.addEventListener('scroll', fix, true);
    return () => window.removeEventListener('scroll', fix, true);
  }, []);

  // ---- clock + calendar refresh
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (!settings?.googleConnected) return;
    refreshMeetings();
    const t = setInterval(refreshMeetings, 5 * 60_000);
    const f = () => document.visibilityState === 'visible' && refreshMeetings();
    document.addEventListener('visibilitychange', f);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', f); };
  }, [settings?.googleConnected, refreshMeetings]);

  // ---- shortcut: Ctrl/Cmd+Shift+R starts or stops a recording
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') { e.preventDefault(); rec ? void stop() : void start('Quick recording'); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [rec, start, stop]);

  const c: Ctx = {
    settings, lib, meetings, meetingsError, meetingsLoading, online, recordingId: rec?.id ?? null, now,
    go: setView, start: (t, m) => void start(t, m), upload: (id) => void upload(id),
    refreshSettings, refreshMeetings, refreshLib, toast, resumePoll: (id, j) => void poll(id, j),
  };

  const folderOf = view.name === 'library' ? view.folder : undefined;
  const nav = (active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count?: number) => (
    <button className={`nav ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{count !== undefined && <small>{count}</small>}</button>
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand" role="button" tabIndex={0} title="Home" onClick={() => setView({ name: 'today' })} onKeyDown={(e) => e.key === 'Enter' && setView({ name: 'today' })}><div className="mark">W</div><div><strong>WhipScribe</strong><small>Recorder</small></div></div>
        <nav>
          {nav(view.name === 'today', () => setView({ name: 'today' }), <Home size={17} />, 'Home')}
          {nav(view.name === 'library' && !folderOf, () => setView({ name: 'library' }), <Library size={17} />, 'Library', lib.recordings.length)}
          {lib.folders.map((f) => nav(folderOf === f.id, () => setView({ name: 'library', folder: f.id }), <Folder size={15} />, f.name, lib.recordings.filter((r) => r.folderId === f.id).length))}
        </nav>
        <div className="sidebarBottom">
          {nav(view.name === 'settings', () => setView({ name: 'settings' }), <Cog size={17} />, 'Settings')}
          <div className={`conn ${online ? '' : 'off'}`}>{online ? <Wifi size={13} /> : <WifiOff size={13} />}{online ? (settings?.hasKey ? 'Online' : 'Online · no API key') : 'Offline · saving locally'}</div>
        </div>
      </aside>

      <main className={`main ${rec ? 'withBar' : ''}`}>
        {view.name === 'today' && <Today c={c} />}
        {view.name === 'library' && <LibraryView c={c} folder={view.folder} />}
        {view.name === 'detail' && <Detail key={view.id} c={c} id={view.id} initialQ={view.q} />}
        {view.name === 'settings' && <SettingsView c={c} />}
      </main>

      {ask && (() => {
        const r = lib.recordings.find((x) => x.id === ask);
        if (!r) return null;
        const keep = () => setAsk(null);
        const ready = !!settings?.hasKey && online;
        return (
          <Modal title="Send this recording to WhipScribe?" onClose={keep}>
            <p className="muted"><Shield size={14} style={{ verticalAlign: '-2px' }} /> Recorded {fmtDur(r.duration)}. It is saved on this computer only. To get a transcript, the audio has to be uploaded to the WhipScribe API.</p>
            {r.path && <audio controls preload="metadata" style={{ width: '100%' }} src={convertFileSrc(r.path)} />}
            {!settings?.hasKey && <p className="bad">Add your WhipScribe API key in Settings before you can transcribe.</p>}
            {settings?.hasKey && !online && <p className="bad">You are offline. You can send it later from the recording page.</p>}
            <div className="modalActions" style={{ flexWrap: 'wrap' }}>
              <button className="btn danger" onClick={async () => { setAsk(null); try { await api.remove(r.id, false); await refreshLib(); setView({ name: 'library' }); toast('Recording deleted.'); } catch (e) { toast(errorMessage(e), 'error'); } }}><Trash2 size={14} /> Delete</button>
              <button className="btn" onClick={keep}>Keep on this computer only</button>
              <button className="btn primary" disabled={!ready} onClick={() => { setAsk(null); void upload(r.id); }}>Send &amp; transcribe</button>
            </div>
          </Modal>
        );
      })()}

      {rec && <RecordingBar title={rec.title} info={rec.info} paused={rec.paused} onPause={() => void pause()} onStop={() => void stop()} />}

      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>{t.kind === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}<span>{t.text}</span><button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} aria-label="Dismiss"><X size={13} /></button></div>
        ))}
      </div>
    </div>
  );
}
