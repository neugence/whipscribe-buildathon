// Formatting shared by server and browser code. No Node imports here.

export function clock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
}

// "34 s", "12 min", "1 h 5 min" — with no-break spaces so it never splits.
export function length(sec: number | null | undefined): string {
  if (sec == null) return '';
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const nb = ' ';
  if (h) return `${h}${nb}h${m ? `${nb}${m}${nb}min` : ''}`;
  if (m) return `${m}${nb}min`;
  return `${s}${nb}s`;
}

export function bytes(n: number | null | undefined): string {
  if (n == null) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v >= 10 || i === 0 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}

export function ago(ts: number | null | undefined, now = Date.now()): string {
  if (!ts) return 'never';
  const s = Math.round((now - ts) / 1000);
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en')} ${n === 1 ? one : many}`;

// Speaker labels come as "SPEAKER_00" (or not at all); people read "Speaker 1".
export function speakerName(id: string | null): string | null {
  if (!id) return null;
  const n = /(\d+)$/.exec(id);
  return n ? `Speaker ${Number(n[1]) + 1}` : id;
}
