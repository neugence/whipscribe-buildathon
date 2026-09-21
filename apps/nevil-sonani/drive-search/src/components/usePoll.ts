'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

// Fetch JSON now and again every `every` ms (or `idle` ms when `isBusy` says
// nothing is moving). If the server stops answering, keep the last data,
// report `offline`, and back off until it answers again.
export function usePoll<T>(url: string | null, opts: { every?: number; idle?: number; initial?: T; isBusy?: (d: T) => boolean } = {}) {
  const { every = 1500, idle = 15000, initial, isBusy } = opts;
  const [data, setData] = useState<T | undefined>(initial);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const failures = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const busyRef = useRef(isBusy);
  busyRef.current = isBusy;

  const load = useCallback(async () => {
    if (!url) return undefined;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok) {
        setError(body?.error || `Request failed (${res.status})`);
      } else {
        setData(body as T);
        setError(null);
      }
      failures.current = 0;
      setOffline(false);
      return body as T;
    } catch {
      failures.current += 1;
      if (failures.current >= 2) setOffline(true);
      return undefined;
    }
  }, [url]);

  useEffect(() => {
    let alive = true;
    const loop = async () => {
      const d = await load();
      if (!alive) return;
      const busy = d && busyRef.current ? busyRef.current(d) : true;
      const wait = failures.current ? Math.min(15000, 2000 * 2 ** failures.current) : busy ? every : idle;
      timer.current = setTimeout(loop, document.hidden ? Math.max(wait, 10000) : wait);
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(timer.current);
    };
  }, [load, every, idle]);

  return { data, offline, error, refresh: load };
}

// POST helper: JSON in, JSON out, errors as a message.
export async function post<T = unknown>(url: string, body?: unknown, method = 'POST'): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => undefined);
    if (res.ok) window.dispatchEvent(new Event('app:changed'));
    return res.ok ? { ok: true, data } : { ok: false, error: data?.error || `Something went wrong (${res.status})` };
  } catch {
    return { ok: false, error: 'Could not reach the app. Is it still running?' };
  }
}
