import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X, HardDriveDownload, Mic } from 'lucide-react';
import type { Status } from './types';

export const fmtDur = (sec: number) => {
  const s = Math.round(sec || 0);
  if (s < 60) return `${s}s`;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${m}m` : m >= 10 ? `${m}m` : `${m}m ${s % 60}s`;
};
export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
export const fmtStamp = (iso: string) => `${fmtDate(iso)}, ${fmtTime(iso)}`;
export const dayLabel = (iso: string, now: number) => {
  const d = new Date(iso), n = new Date(now);
  const key = (x: Date) => x.getFullYear() * 400 + x.getMonth() * 32 + x.getDate();
  const diff = key(d) - key(n);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
};

const LABEL: Record<Status, string> = {
  recording: 'Recording', saved: 'On this PC', uploading: 'Uploading', processing: 'Transcribing', ready: 'Transcript ready', error: 'Needs attention',
};
export function Pill({ status }: { status: Status }) {
  const icon = status === 'ready' ? <CheckCircle2 size={12} /> : status === 'error' ? <AlertCircle size={12} /> : status === 'uploading' || status === 'processing' ? <Loader2 size={12} className="spin" /> : status === 'saved' ? <HardDriveDownload size={12} /> : <Mic size={12} />;
  return <span className={`pill ${status}`}>{icon}{LABEL[status]}</span>;
}

export function Modal({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modalHead"><h2>{title}</h2><button className="iconBtn" onClick={onClose} aria-label="Close"><X size={16} /></button></div>
        {children}
      </div>
    </div>
  );
}

export function Meter({ level, label }: { level: number; label: string }) {
  const w = Math.min(1, Math.sqrt(level) * 2.2);
  return (
    <div className="meter" title={label} aria-label={`${label} level`}>
      <span>{label}</span>
      <div><i style={{ width: `${Math.round(w * 100)}%` }} /></div>
    </div>
  );
}

export function Empty({ icon, title, text, children }: { icon: React.ReactNode; title: string; text?: string; children?: React.ReactNode }) {
  return <div className="empty"><div className="emptyIcon">{icon}</div><h3>{title}</h3>{text && <p>{text}</p>}{children}</div>;
}
