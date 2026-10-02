import type { Transcript, Turn } from './types';

/* The /jobs/{id}/result?format=json payload is documented only as "segments, speakers, word timing".
   This normalizer accepts the plausible shapes (segments / utterances / word-level speakers / plain text)
   so a small schema difference degrades to "less structure", never to an empty screen. */

const num = (...vals: unknown[]): number | undefined => {
  for (const v of vals) {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  }
  return undefined;
};
const str = (...vals: unknown[]): string | undefined => {
  for (const v of vals) if (typeof v === 'string' && v.trim() !== '') return v;
  return undefined;
};
const obj = (v: unknown): Record<string, any> | undefined => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, any>) : undefined);

function speakerOf(s: Record<string, any>): string | undefined {
  const v = s.speaker ?? s.speaker_label ?? s.speaker_id ?? s.speakerId ?? s.spk ?? s.speaker_name;
  return v === undefined || v === null || v === '' ? undefined : String(v);
}

function findSegments(raw: any): any[] | undefined {
  if (Array.isArray(raw)) return raw;
  const r = obj(raw);
  if (!r) return undefined;
  for (const c of [r.segments, r.utterances, r.transcript?.segments, r.transcript?.utterances, r.result?.segments, r.results?.segments, r.data?.segments, r.paragraphs]) {
    if (Array.isArray(c) && c.length) return c;
  }
  return undefined;
}

function findWords(raw: any): any[] | undefined {
  const r = obj(raw);
  if (!r) return undefined;
  for (const c of [r.words, r.transcript?.words, r.result?.words]) if (Array.isArray(c) && c.length) return c;
  return undefined;
}

const wordText = (w: any) => str(w.word, w.text, w.token) ?? '';

function turnsFromWords(words: any[]): Turn[] {
  const out: Turn[] = [];
  for (const w of words) {
    const sp = speakerOf(w) ?? '';
    const start = num(w.start, w.start_time, w.begin) ?? 0;
    const end = num(w.end, w.end_time) ?? start;
    const last = out[out.length - 1];
    if (last && last.speaker === sp && start - last.end < 1.5) {
      last.text += ' ' + wordText(w);
      last.end = end;
    } else out.push({ speaker: sp, start, end, text: wordText(w) });
  }
  return out;
}

export function normalize(raw: unknown, durationHint = 0): Transcript {
  let turns: Turn[] = [];
  const segs = findSegments(raw);
  if (segs) {
    const hasSeg = segs.some((s) => obj(s) && speakerOf(s));
    const words = findWords(raw);
    if (!hasSeg && words && words.some((w) => obj(w) && speakerOf(w))) {
      turns = turnsFromWords(words);
    } else {
      turns = segs
        .map((s): Turn | undefined => {
          if (typeof s === 'string') return { speaker: '', start: 0, end: 0, text: s };
          const o = obj(s);
          if (!o) return undefined;
          const text = str(o.text, o.content, o.transcript, o.sentence) ?? (Array.isArray(o.words) ? o.words.map(wordText).join(' ') : '');
          const start = num(o.start, o.start_time, o.startTime, o.begin, o.offset) ?? 0;
          const end = num(o.end, o.end_time, o.endTime) ?? start;
          return { speaker: speakerOf(o) ?? '', start, end, text: text.trim() };
        })
        .filter((t): t is Turn => !!t && t.text !== '');
    }
  } else {
    const words = findWords(raw);
    if (words && words.some((w) => obj(w) && speakerOf(w))) turns = turnsFromWords(words);
    else {
      const r = obj(raw);
      const text = typeof raw === 'string' ? raw : str(r?.text, r?.transcript, r?.transcription) ?? '';
      if (text) turns = [{ speaker: '', start: 0, end: 0, text }];
    }
  }

  // Milliseconds instead of seconds?
  const maxEnd = Math.max(0, ...turns.map((t) => t.end));
  if (durationHint > 0 ? maxEnd > durationHint * 20 : maxEnd > 86_400) turns = turns.map((t) => ({ ...t, start: t.start / 1000, end: t.end / 1000 }));

  // Merge consecutive same-speaker segments so the transcript reads like conversation.
  const merged: Turn[] = [];
  for (const t of turns) {
    const last = merged[merged.length - 1];
    if (last && last.speaker === t.speaker && t.start - last.end <= 2 && last.text.length < 240) {
      last.text += ' ' + t.text;
      last.end = Math.max(last.end, t.end);
    } else merged.push({ ...t });
  }
  const refined = refine(merged, durationHint);
  const speakers = [...new Set(refined.map((t) => t.speaker))];
  return { turns: refined, speakers, text: refined.map((t) => t.text).join(' ') };
}

const SENT = /[^.!?…।]+[.!?…।]+["')\]]*\s*|[^.!?…।]+$/g;

/** Break long blocks into sentence-sized lines, each with its own timestamp. When the API gives no
    timing inside a block (plain text, or one big segment), positions are spread over the block's time
    span by text length. That is close enough to land a click within a sentence of the right audio. */
function refine(turns: Turn[], dur: number): Turn[] {
  const out: Turn[] = [];
  turns.forEach((t, i) => {
    const next = turns[i + 1];
    const endAt = t.end > t.start ? t.end : next ? next.start : dur;
    const span = Math.max(0, endAt - t.start);
    const parts = (t.text.match(SENT) ?? [t.text]).map((s) => s.trim()).filter(Boolean);
    const chunks: string[] = [];
    let cur = '';
    for (const p of parts) {
      if (cur.length >= 50 && (cur + ' ' + p).length > 110) { chunks.push(cur); cur = p; } else cur = cur ? cur + ' ' + p : p;
    }
    if (cur) chunks.push(cur);
    if (chunks.length <= 1 || span <= 0) { out.push({ ...t }); return; }
    const total = chunks.reduce((n, c) => n + c.length, 0);
    let acc = 0;
    for (const c of chunks) {
      const s = t.start + span * (acc / total);
      acc += c.length;
      out.push({ speaker: t.speaker, start: s, end: t.start + span * (acc / total), text: c });
    }
  });
  return out;
}

const GENERIC = /^(speaker|spk|s|person|voice)?[\s_-]*(\d+|[a-z])$/i;

/** "SPEAKER_00" -> "Speaker 1"; real names pass through; user renames win. */
export function speakerName(raw: string, all: string[], names: Record<string, string> = {}): string {
  if (names[raw]) return names[raw];
  if (raw === '') return all.length > 1 ? 'Unknown' : 'Transcript';
  if (GENERIC.test(raw.trim())) return `Speaker ${Math.max(0, all.filter((s) => s !== '').indexOf(raw)) + 1}`;
  return raw;
}

export const clock = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return (h ? `${h}:${String(m).padStart(2, '0')}` : String(m)) + `:${String(r).padStart(2, '0')}`;
};

/** Plain text form used for full-text search and copy. */
export function toPlain(t: Transcript, names: Record<string, string> = {}): string {
  return t.turns.map((x) => `${speakerName(x.speaker, t.speakers, names)} [${clock(x.start)}]: ${x.text}`).join('\n');
}
