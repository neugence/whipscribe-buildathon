import { useEffect, useState } from 'react';
import { Pause, Play, Square, ShieldAlert } from 'lucide-react';
import { onLevels } from './api';
import { Meter } from './ui';
import { clock } from './transcript';
import type { RecInfo } from './types';

export function RecordingBar({ title, info, paused, onPause, onStop }: { title: string; info: RecInfo; paused: boolean; onPause: () => void; onStop: () => void }) {
  const [lv, setLv] = useState({ mic: 0, system: 0, seconds: 0 });
  useEffect(() => {
    let off: (() => void) | undefined, dead = false;
    onLevels((l) => setLv(l)).then((u) => (dead ? u() : (off = u)));
    return () => { dead = true; off?.(); };
  }, []);
  const src = info.mic && info.system ? 'Mic + system audio' : info.system ? 'System audio only' : 'Microphone only';
  return (
    <div className="recBar" role="region" aria-label="Recording in progress">
      <span className={`recDot ${paused ? 'paused' : ''}`} />
      <div className="recTitle"><strong>{paused ? 'Paused' : 'Recording'} · {title}</strong><span>{src} · saved to disk as you go</span></div>
      <div className="meters">
        {info.mic && <Meter level={paused ? 0 : lv.mic} label="Mic" />}
        {info.system && <Meter level={paused ? 0 : lv.system} label="System" />}
      </div>
      <time>{clock(lv.seconds)}</time>
      <button onClick={onPause} aria-label={paused ? 'Resume' : 'Pause'}>{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? 'Resume' : 'Pause'}</button>
      <button className="stop" onClick={onStop}><Square size={13} fill="currentColor" />Stop</button>
      <p className="consent"><ShieldAlert size={12} /> Tell everyone on the call that you are recording.</p>
    </div>
  );
}
