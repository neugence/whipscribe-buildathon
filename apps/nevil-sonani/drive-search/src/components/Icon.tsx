// Stroke icons drawn for this app (24×24).
const PATHS: Record<string, string> = {
  search: 'M11 4.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM20 20l-4.2-4.2',
  folder: 'M3 7.5A2 2 0 0 1 5 5.5h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  plus: 'M12 5v14M5 12h14',
  back: 'M19 12H5M11 18l-6-6 6-6',
  right: 'M9.5 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  alert: 'M12 8v5M12 16.5v.5M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  x: 'M6 6l12 12M18 6L6 18',
  refresh: 'M20 11a8 8 0 0 0-14.4-4.6M4 5v4h4M4 13a8 8 0 0 0 14.4 4.6M20 19v-4h-4',
  external: 'M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4',
  play: 'M8 5.5v13l10.5-6.5z',
  pause: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
  clock: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7.5V12l3 2',
  skip: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM5.7 5.7l12.6 12.6',
  drive: 'M8.5 4h7l5.5 9.5-3.5 6h-11L3 13.5zM8.5 4 13 12h8M3 13.5l5.5-9.5M6.5 19.5l4.5-7.5',
  computer: 'M3 5h18v11H3zM8 20h8M12 16v4',
  wave: 'M3 12h1.5M7 8.5v7M11 5v14M15 8v8M19 10.5v3',
  trash: 'M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13',
  spark: 'M12 3.5c.7 4 2.5 5.8 6.5 6.5-4 .7-5.8 2.5-6.5 6.5-.7-4-2.5-5.8-6.5-6.5 4-.7 5.8-2.5 6.5-6.5z',
  offline: 'M3 3l18 18M8.6 16a5 5 0 0 1 6.8 0M5.2 12.6A10 10 0 0 1 9.6 10.3M18.8 12.6a10 10 0 0 0-2.2-1.6M2 9a15 15 0 0 1 3.8-2.6M22 9a15 15 0 0 0-10.2-4',
};

const FILLED = new Set(['play', 'pause']);

export function Icon({ name, size, label }: { name: keyof typeof PATHS | string; size?: 'sm' | 'lg'; label?: string }) {
  return (
    <svg
      className={`i${size ? ` ${size}` : ''}`}
      viewBox="0 0 24 24"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      style={FILLED.has(name) ? { fill: 'currentColor', stroke: 'none' } : undefined}
    >
      <path d={PATHS[name] ?? ''} />
    </svg>
  );
}
