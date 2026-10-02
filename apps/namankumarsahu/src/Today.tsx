import { CalendarDays, ExternalLink, Mic, Video, Volume2, RefreshCw, Plug } from 'lucide-react';
import type { Ctx } from './ctx';
import { api } from './api';
import { dayLabel, fmtDur, fmtTime, Empty, Pill } from './ui';
import type { Meeting } from './types';

export function Today({ c }: { c: Ctx }) {
  const hour = new Date(c.now).getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const s = c.settings;
  const soon = c.meetings.find((m) => {
    const st = new Date(m.start).getTime(), en = m.end ? new Date(m.end).getTime() : st + 3_600_000;
    return st - c.now < 10 * 60_000 && en > c.now;
  });
  const groups = new Map<string, Meeting[]>();
  for (const m of c.meetings) {
    const k = dayLabel(m.start, c.now);
    groups.set(k, [...(groups.get(k) ?? []), m]);
  }
  const toggle = async (k: 'captureMic' | 'captureSystem') => {
    if (!s) return;
    const next = { captureMic: s.captureMic, captureSystem: s.captureSystem, [k]: !s[k] };
    if (!next.captureMic && !next.captureSystem) { c.toast('Pick at least one audio source.', 'error'); return; }
    await api.saveSettings(next);
    await c.refreshSettings();
  };
  const recent = c.lib.recordings.slice(0, 3);

  return (
    <>
      <header className="pageHead"><div><h1>{greet}</h1><p>{c.settings?.googleConnected ? 'Here is what is coming up.' : 'Record a call now, or connect your calendar to see what is next.'}</p></div></header>

      {soon && (
        <section className="soon">
          <div><span className="eyebrow">{new Date(soon.start).getTime() <= c.now ? 'IN PROGRESS' : 'STARTING SOON'}</span><h2>{soon.title}</h2><p>{fmtTime(soon.start)}{soon.end ? ` – ${fmtTime(soon.end)}` : ''}{soon.attendees.length ? ` · ${soon.attendees.slice(0, 3).join(', ')}${soon.attendees.length > 3 ? ` +${soon.attendees.length - 3}` : ''}` : ''}</p></div>
          <div className="row">
            {soon.link && <button className="btn" onClick={() => api.openUrl(soon.link!).catch((e) => c.toast(String(e), 'error'))}><ExternalLink size={15} /> Join {soon.provider ?? 'call'}</button>}
            <button className="btn primary" disabled={!!c.recordingId} onClick={() => c.start(soon.title, soon.id)}><Mic size={15} /> Record this meeting</button>
          </div>
        </section>
      )}

      <section className="card quick">
        <div>
          <h3>Record now</h3>
          <p>Captures what you say and what you hear, straight from Windows. No bot joins the call.</p>
        </div>
        <div className="row">
          <button className={`chip ${s?.captureMic ? 'on' : ''}`} onClick={() => toggle('captureMic')} aria-pressed={!!s?.captureMic}><Mic size={14} /> Microphone</button>
          <button className={`chip ${s?.captureSystem ? 'on' : ''}`} onClick={() => toggle('captureSystem')} aria-pressed={!!s?.captureSystem}><Volume2 size={14} /> System audio</button>
          <button className="btn primary" disabled={!!c.recordingId} onClick={() => c.start('Quick recording')}><Mic size={15} /> Start recording</button>
        </div>
      </section>

      <div className="sectionHead"><h3>Coming up</h3>{s?.googleConnected && <button className="btn ghost" onClick={c.refreshMeetings} aria-label="Refresh calendar"><RefreshCw size={14} className={c.meetingsLoading ? 'spin' : ''} /> Refresh</button>}</div>
      {!s?.googleConnected ? (
        <Empty icon={<CalendarDays size={22} />} title="Connect Google Calendar" text="See your next meetings here and start recording with the right title in one click. Read-only access.">
          <button className="btn" onClick={() => c.go({ name: 'settings' })}><Plug size={15} /> Set up calendar</button>
        </Empty>
      ) : c.meetingsError ? (
        <div className="errorBox"><strong>Could not load your calendar</strong><p>{c.meetingsError}</p><button className="btn" onClick={c.refreshMeetings}>Try again</button></div>
      ) : c.meetings.length === 0 ? (
        <Empty icon={<CalendarDays size={22} />} title={c.meetingsLoading ? 'Loading…' : 'Nothing in the next 7 days'} text={c.meetingsLoading ? undefined : 'Timed events from your primary calendar show up here.'} />
      ) : (
        [...groups].map(([day, list]) => (
          <div key={day} className="dayGroup">
            <h4>{day}</h4>
            {list.map((m) => (
              <div className="meeting" key={m.id}>
                <div className="when"><strong>{fmtTime(m.start)}</strong><span>{m.end ? fmtTime(m.end) : ''}</span></div>
                <div className="grow"><h5>{m.title}</h5><p>{m.provider && <span className="tag"><Video size={11} /> {m.provider}</span>}{m.attendees.slice(0, 4).join(' · ')}</p></div>
                {m.link && <button className="btn ghost" onClick={() => api.openUrl(m.link!).catch((e) => c.toast(String(e), 'error'))}><ExternalLink size={14} /> Join</button>}
                <button className="btn" disabled={!!c.recordingId} onClick={() => c.start(m.title, m.id)}><Mic size={14} /> Record</button>
              </div>
            ))}
          </div>
        ))
      )}

      {recent.length > 0 && (
        <>
          <div className="sectionHead"><h3>Recent recordings</h3><button className="btn ghost" onClick={() => c.go({ name: 'library' })}>Open library</button></div>
          <div className="list">
            {recent.map((r) => (
              <button key={r.id} className="row-item" onClick={() => c.go({ name: 'detail', id: r.id })}>
                <div className="grow"><strong>{r.title}</strong><span>{new Date(r.startedAt).toLocaleString()} · {fmtDur(r.duration)}</span></div>
                <Pill status={r.status} />
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
