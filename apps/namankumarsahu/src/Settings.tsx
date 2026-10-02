import { useEffect, useState } from 'react';
import { CalendarCheck, Check, KeyRound, Loader2, Unplug } from 'lucide-react';
import type { Ctx } from './ctx';
import { api, errorMessage } from './api';

export function SettingsView({ c }: { c: Ctx }) {
  const s = c.settings;
  const [key, setKey] = useState('');
  const [cid, setCid] = useState('');
  const [secret, setSecret] = useState('');
  const [lang, setLang] = useState('');
  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { if (s) { setCid(s.googleClientId); setLang(s.language); } }, [s?.googleClientId, s?.language]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!s) return null;

  const saveKey = async () => {
    await api.saveSettings({ apiKey: key });
    setKey('');
    await c.refreshSettings();
    await test();
  };
  const test = async () => {
    setTesting(true); setResult(null);
    try {
      const me = await api.checkApi();
      setResult({ ok: true, text: `Connected${me.tier ? ` · ${String(me.tier)} plan` : ''}${me.email ? ` · ${String(me.email)}` : ''}` });
    } catch (e) { setResult({ ok: false, text: errorMessage(e) }); } finally { setTesting(false); }
  };
  const connect = async () => {
    setConnecting(true);
    try {
      await api.saveSettings({ googleClientId: cid, googleClientSecret: secret });
      await api.gcalConnect();
      setSecret('');
      await c.refreshSettings();
      c.refreshMeetings();
      c.toast('Google Calendar connected.');
    } catch (e) { c.toast(errorMessage(e), 'error'); } finally { setConnecting(false); }
  };

  return (
    <>
      <header className="pageHead"><div><h1>Settings</h1><p>Everything stays on this computer except audio you choose to transcribe.</p></div></header>

      <section className="card stack">
        <h3><KeyRound size={16} /> WhipScribe</h3>
        <p className="muted">{s.hasKey ? `API key saved (ends in ${s.keyTail}).` : 'No API key yet.'} Paste a new one to replace it.</p>
        <div className="row"><input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="tk_…" aria-label="WhipScribe API key" autoComplete="off" /><button className="btn primary" disabled={!key.trim()} onClick={saveKey}>Save key</button><button className="btn" disabled={!s.hasKey || testing} onClick={test}>{testing ? <Loader2 size={14} className="spin" /> : <Check size={14} />} Test connection</button></div>
        {result && <p className={result.ok ? 'ok' : 'bad'}>{result.text}</p>}
        <label className="field">Transcription language <small>(blank = auto-detect)</small><input value={lang} onChange={(e) => setLang(e.target.value)} onBlur={() => api.saveSettings({ language: lang }).then(c.refreshSettings)} placeholder="e.g. en, hi" style={{ maxWidth: 160 }} /></label>
        <p className="muted">Privacy: after every recording the app asks before anything is sent. Nothing leaves this computer until you approve it.</p>
      </section>

      <section className="card stack">
        <h3><CalendarCheck size={16} /> Google Calendar</h3>
        {s.googleConnected ? (
          <div className="row"><span className="ok">Connected (read-only).</span><button className="btn" onClick={() => api.gcalDisconnect().then(async () => { await c.refreshSettings(); c.refreshMeetings(); })}><Unplug size={14} /> Disconnect</button></div>
        ) : (
          <>
            <p className="muted">Create an OAuth client of type <b>Desktop app</b> in Google Cloud Console (enable the Calendar API), then paste its ID and secret. Sign-in happens in your browser.</p>
            <div className="row"><input value={cid} onChange={(e) => setCid(e.target.value)} placeholder="Client ID" aria-label="Google client ID" /><input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder={s.googleSecretSet ? 'Client secret (saved)' : 'Client secret'} aria-label="Google client secret" /></div>
            <div><button className="btn primary" disabled={connecting || !cid.trim()} onClick={connect}>{connecting ? <><Loader2 size={14} className="spin" /> Waiting for browser…</> : 'Connect Google Calendar'}</button></div>
          </>
        )}
      </section>
    </>
  );
}
