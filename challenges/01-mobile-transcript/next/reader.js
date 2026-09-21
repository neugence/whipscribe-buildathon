/* WhipScribe transcript reader, next pass — a working prototype.
   No build step and no dependencies, so it opens from a phone as it is.
   Every state is reachable by tapping through, or directly with ?state=
   (the list is in PRESETS below). Data comes from data.js in the shapes the
   API documents; nothing here assumes a field the docs do not show. */
(function () {
  'use strict';

  // ---------- helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }
  const SVG = 'http://www.w3.org/2000/svg';
  function icon(name, cls) {
    const s = document.createElementNS(SVG, 'svg');
    s.setAttribute('class', 'i' + (cls ? ' ' + cls : ''));
    s.setAttribute('aria-hidden', 'true');
    const u = document.createElementNS(SVG, 'use');
    u.setAttribute('href', '#i-' + name);
    s.append(u);
    return s;
  }
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  function fmtTime(sec) {
    const s = Math.max(0, Math.floor(sec)), m = Math.floor(s / 60), r = String(s % 60).padStart(2, '0');
    return m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${r}` : `${m}:${r}`;
  }
  function fmtShort(sec) {
    const s = Math.round(sec), hr = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    return hr ? `${hr}h ${m}m` : m ? `${m}m ${r}s` : `${r}s`;
  }
  function fmtLength(sec) {
    const s = Math.round(sec), hr = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    const nb = '\u00a0';
    if (hr) return `${hr}${nb}h${nb}${m}${nb}min`;
    if (m) return r ? `${m}${nb}min${nb}${r}${nb}s` : `${m}${nb}min`;
    return `${r}${nb}s`;
  }
  const LANGS = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', hi: 'Hindi', pt: 'Portuguese', ja: 'Japanese' };
  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const store = {
    get(k, d) { try { const v = localStorage.getItem('ws-next:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ws-next:' + k, JSON.stringify(v)); } catch (e) { /* private mode: settings just don't persist */ } },
  };

  // ---------- which state to open in ----------
  const PRESETS = {
    reader: {},
    scrolled: { scroll: 'para:1' },
    boundary: { scroll: 'paywall' },
    search: { search: 'onboarding' },
    'search-jump': { search: 'onboarding', jump: 0 },
    'search-none': { search: 'roadmap' },
    download: { sheet: 'download' },
    'download-signup': { sheet: 'signup', opts: { reason: 'download', format: 'docx' } },
    'download-owner': { viewer: 'owner', audio: true, sheet: 'download' },
    translate: { viewer: 'owner', audio: true, sheet: 'translate' },
    more: { viewer: 'owner', audio: true, sheet: 'more' },
    'more-guest': { sheet: 'more' },
    display: { sheet: 'display' },
    details: { viewer: 'owner', audio: true, sheet: 'details' },
    rename: { viewer: 'owner', audio: true, sheet: 'rename' },
    line: { pick: 2 },
    'line-audio': { viewer: 'owner', audio: true, pick: 2 },
    signup: { sheet: 'signup' },
    'signup-code': { sheet: 'signup-code', opts: { email: 'you@example.com' } },
    unlocked: { viewer: 'owner', scroll: 'para:3', toast: 'unlocked' },
    audio: { viewer: 'owner', audio: true, at: 22.6, playing: true },
    'follow-off': { viewer: 'owner', audio: true, at: 22.6, playing: true, followOff: true, scroll: 'para:6' },
    speakers: { viewer: 'owner', audio: true, file: 'meeting' },
    'speakers-guest': { file: 'meeting' },
    'rename-speaker': { viewer: 'owner', audio: true, file: 'meeting', sheet: 'rename-speaker', opts: { id: 'SPEAKER_01' } },
    summary: { viewer: 'owner', audio: true, tab: 'summary' },
    'summary-guest': { tab: 'summary' },
    chat: { viewer: 'owner', audio: true, tab: 'chat', chat: 'quiz' },
    trash: { viewer: 'owner', audio: true, toast: 'trash' },
    processing: { page: 'processing' },
    queued: { page: 'queued' },
    'no-speech': { page: 'no-speech' },
    failed: { page: 'failed' },
    error: { page: 'error' },
    offline: { page: 'offline' },
    'not-yours': { viewer: 'other', page: 'not-yours' },
    'signed-out': { page: 'signed-out' },
  };

  const FX = window.WS_FIXTURES;
  const qs = new URLSearchParams(location.search);
  const SHOT = qs.has('shot');
  const EMBED = window.self !== window.top; // inside the review page: never grab focus
  if (SHOT) document.documentElement.classList.add('shot');
  const P = PRESETS[qs.get('state')] || PRESETS.reader;
  const F = FX[qs.get('file') || P.file || 'long'];
  const duration = F.status.audio_duration_seconds;
  const SIZES = [15, 17, 19, 22];
  const RATES = [1, 1.25, 1.5, 2, 0.75];

  const app = {
    viewer: P.viewer || 'guest',            // guest (free preview) | owner | other
    page: P.page || null,                   // whole-page states: error, processing, …
    audio: !!P.audio,                       // do we have an audio URL?
    tab: P.tab || 'transcript',
    size: SHOT ? 1 : store.get('size', 1),
    times: SHOT ? true : store.get('times', true),
    speakers: SHOT ? true : store.get('speakers', true),
    stamps: false,                          // timestamps inside downloaded .docx/.txt
    follow: !P.followOff,
    playing: false, t: P.at || 0, rate: 1,
    names: {},
    filename: F.status.filename,
    pending: null,                          // what to finish after signing up
    search: null,                           // { q, hits, i }
    picked: null,
    chat: [],
  };
  const locked = () => app.viewer !== 'owner';
  const me = () => FX.me[app.viewer] || FX.me.guest;

  // ---------- reading model: segments -> sentences -> paragraphs ----------
  // The API splits segments on pauses, so a sentence can straddle two
  // segments ("…several people have a hard" / "stop at the top of the hour.").
  // Word timings let us re-cut on sentence ends and then group sentences into
  // paragraphs: a new one on a new speaker, a pause of ~1 s, or four sentences.
  let model;
  function buildModel() {
    const res = locked() ? F.preview : F.result;
    const sentences = [];
    let cur = null;
    for (const seg of res.segments) {
      for (const w of seg.words && seg.words.length ? seg.words : spreadWords(seg)) {
        if (!cur || cur.speaker !== seg.speaker) {
          if (cur) sentences.push(cur);
          cur = { speaker: seg.speaker, start: w.start, end: w.end, words: [] };
        }
        cur.words.push(w.text);
        cur.end = w.end;
        if (/[.?!]["”’)]?$/.test(w.text)) { sentences.push(cur); cur = null; }
      }
    }
    if (cur) sentences.push(cur);
    sentences.forEach((s, i) => { s.i = i; s.text = s.words.join(' '); });

    const paras = [];
    let p = null;
    for (const s of sentences) {
      const pause = p ? s.start - p.end : 0;
      if (!p || s.speaker !== p.speaker || pause >= 0.9 || p.sentences.length >= 4) {
        p = { speaker: s.speaker, start: s.start, end: s.end, sentences: [] };
        paras.push(p);
      }
      p.sentences.push(s);
      p.end = s.end;
    }
    const speakerIds = [...new Set(F.result.segments.map((s) => s.speaker))];
    const pv = F.preview.segments;
    model = { sentences, paras, previewEnd: Math.round(pv[pv.length - 1].end), multi: speakerIds.length > 1, speakerIds };
  }
  // A real API response for my own test recording came back with
  // "words": null and "speaker": null on every segment. Without word times,
  // spread a segment's words across its span by length, so sentences can
  // still be re-cut; without speakers, no names are shown.
  function spreadWords(seg) {
    const toks = seg.text.split(/\s+/).filter(Boolean);
    const total = toks.reduce((n, t) => n + t.length + 1, 0) || 1;
    let t = seg.start;
    return toks.map((tok) => {
      const d = ((seg.end - seg.start) * (tok.length + 1)) / total;
      const w = { start: t, end: t + d, text: tok };
      t += d;
      return w;
    });
  }
  const SPEAKER_COLORS = ['#2f6fdf', '#c2410c', '#7c3aed', '#0f766e', '#be185d', '#4d7c0f'];
  function speaker(id) {
    const n = parseInt(String(id).split('_')[1], 10) || 0;
    const name = app.names[id] || `Speaker ${n + 1}`;
    return { n: n + 1, name, initial: app.names[id] ? name.trim()[0].toUpperCase() : String(n + 1), color: SPEAKER_COLORS[n % SPEAKER_COLORS.length] };
  }

  // ---------- page shell ----------
  const root = $('#app');
  const layers = $('#layers');

  function render() {
    root.replaceChildren(header(), main());
    document.title = `${pageTitle()} · WhipScribe`;
    fitMeta();
    applyDisplay();
    renderDock();
  }

  function header() {
    const bar = h('div', { class: 'bar' },
      h('button', { class: 'icon-btn', 'aria-label': 'Back to your files', onclick: () => toast('That goes back to your files, which this prototype leaves out.') }, icon('back')),
      h('div', { class: 'title' }, h('h1', { id: 'file-title' }, pageTitle()), metaLine()));
    if (!app.page) {
      bar.append(
        h('button', { class: 'icon-btn', 'aria-label': app.tab === 'summary' ? 'Download the summary' : 'Download', onclick: () => openSheet(app.tab === 'summary' ? 'download-summary' : 'download') }, icon('download')),
        h('button', { class: 'icon-btn', 'aria-label': 'More options', onclick: () => openSheet('more') }, icon('more')));
    }
    const top = h('header', { class: 'top', id: 'top' }, bar);
    if (!app.page) top.append(tabs());
    return top;
  }

  function pageTitle() {
    if (app.page === 'not-yours' || app.page === 'signed-out') return 'Transcript';
    return base(); // the recording's name; the extension is in File details
  }

  // level 0: "1m 44s · English · No audio"; 1: "EN"; 2: no language.
  // fitMeta() steps down only when the line would not fit, so it never truncates.
  function metaLine(level = 0) {
    const bits = [];
    const add = (x) => { if (bits.length) bits.push(h('span', { class: 'dot', 'aria-hidden': 'true' }, '·')); bits.push(x); };
    if (app.page === 'not-yours' || app.page === 'signed-out' || app.page === 'error' || app.page === 'offline') return h('p', { class: 'meta', id: 'meta' });
    add(fmtShort(duration));
    if (app.page === 'processing') add('Transcribing');
    else if (app.page === 'queued') add('Waiting to start');
    else if (!app.page) {
      const code = F.status.language;
      if (level === 0) add(LANGS[code] || code.toUpperCase());
      else if (level === 1) add(h('abbr', { title: LANGS[code] || code }, code.toUpperCase()));
      if (!app.audio) add('No audio');
    }
    return h('p', { class: 'meta', id: 'meta' }, bits);
  }
  function fitMeta() {
    for (let level = 1; level <= 2; level++) {
      const meta = $('#meta');
      if (!meta || meta.scrollWidth <= meta.clientWidth + 1) return;
      meta.replaceWith(metaLine(level));
    }
  }

  function tabs() {
    const list = [['transcript', 'Transcript'], ['summary', 'Summary'], ['chat', 'AI Chat']];
    const nav = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Views of this recording' });
    list.forEach(([id, label], k) => {
      nav.append(h('button', {
        class: 'tab', role: 'tab', id: 'tab-' + id, 'aria-selected': String(app.tab === id), 'aria-controls': 'panel',
        tabindex: app.tab === id ? '0' : '-1',
        onclick: () => setTab(id),
        onkeydown: (e) => {
          const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          const next = list[(k + d + list.length) % list.length][0];
          setTab(next);
          $('#tab-' + next).focus();
        },
      }, h('span', null, label)));
    });
    return nav;
  }

  function setTab(id) {
    if (app.tab === id) return;
    closeLayers();
    clearSearch();
    app.tab = id;
    render();
    window.scrollTo(0, 0);
  }

  function main() {
    const m = h('main', { class: 'content', id: 'panel', role: app.page ? null : 'tabpanel', 'aria-labelledby': app.page ? null : 'tab-' + app.tab });
    if (app.page) m.append(statePage());
    else if (app.tab === 'transcript') m.append(...transcriptView());
    else if (app.tab === 'summary') m.append(summaryView());
    else m.append(...chatView());
    return m;
  }

  // ---------- the transcript ----------
  function transcriptView() {
    const out = [h('button', { class: 'search-field', type: 'button', onclick: () => openSearch('') }, icon('search', 'sm'), 'Search this transcript')];
    if (locked()) {
      out.push(h('div', { class: 'preview-row' },
        h('span', null, h('b', null, 'Free preview'), ` · the first ${fmtLength(model.previewEnd)} of ${fmtLength(duration)}`),
        h('button', { onclick: () => openSheet('signup') }, 'Read all free')));
    }
    const t = h('div', { class: 'transcript', id: 'transcript', onclick: onTranscriptTap });
    model.paras.forEach((p, pi) => t.append(paraEl(p, pi)));
    if (locked()) t.append(paywall(), ghost());
    out.push(t);
    return out;
  }

  function paraEl(p, pi) {
    const head = h('div', { class: 'para-head' });
    if (model.multi) {
      const sp = speaker(p.speaker);
      head.append(h('button', { class: 'who', type: 'button', 'data-speaker': p.speaker, 'aria-label': `${sp.name}. Rename this speaker`, onclick: () => openSheet('rename-speaker', { id: p.speaker }) },
        h('span', { class: 'avatar', style: `background:${sp.color}`, 'aria-hidden': 'true' }, sp.initial),
        h('span', { class: 'who-name' }, sp.name)));
    }
    head.append(h('button', { class: 'ts', type: 'button', 'data-s': p.sentences[0].i, 'aria-label': `${fmtTime(p.start)}, options for this line` }, fmtTime(p.start)));
    const text = h('p', { class: 'text' });
    p.sentences.forEach((s, k) => {
      if (k) text.append(' ');
      text.append(h('span', { class: 's', 'data-s': s.i }, s.text));
    });
    return h('div', { class: 'para', 'data-p': pi }, head, text);
  }

  function onTranscriptTap(e) {
    const el = e.target.closest('.s, .ts');
    if (!el || window.getSelection().toString()) return; // leave real text selection to the OS
    pick(+el.dataset.s);
  }
  const sEl = (i) => $(`.s[data-s="${i}"]`);

  // ---------- end of the free preview ----------
  function paywall() {
    const rest = duration - model.previewEnd;
    return h('section', { class: 'paywall', id: 'paywall', 'aria-labelledby': 'pw-title' },
      h('h2', { id: 'pw-title' }, 'Read the rest free'),
      h('p', null, `The next ${fmtLength(rest)}, from ${fmtTime(model.previewEnd)} to ${fmtTime(duration)}, is ready. A free account opens all of it, with downloads, and keeps it in your files.`),
      h('button', { class: 'btn btn-google', onclick: () => signIn('google') }, icon('google'), 'Continue with Google'),
      h('button', { class: 'btn btn-text', onclick: () => openSheet('signup', { focusEmail: true }) }, 'Use email instead'),
      h('p', { class: 'small' }, 'Your first transcript is free, up to 3 hours. No card.'));
  }
  function ghost() {
    const g = h('div', { class: 'ghost', 'aria-hidden': 'true' });
    [[92, 97, 84, 60], [95, 88, 71], [90, 96, 40]].forEach((ws) => {
      g.append(h('div', { class: 'gp' }, h('div', { class: 'gh' }), ws.map((w) => h('div', { class: 'gl', style: `width:${w}%` }))));
    });
    return g;
  }

  // ---------- display settings ----------
  function applyDisplay() {
    document.documentElement.style.setProperty('--text-size', SIZES[app.size] + 'px');
    const t = $('#transcript');
    if (t) {
      t.classList.toggle('hide-times', !app.times);
      t.classList.toggle('hide-speakers', !app.speakers);
    }
  }

  // ---------- line actions: tap a line, get what you can do with it ----------
  function pick(i) {
    const s = model.sentences[i];
    if (!s) return;
    closeLayers();
    app.picked = i;
    sEl(i)?.classList.add('picked');
    const sp = model.multi ? speaker(s.speaker).name + ' · ' : '';
    const bar = h('div', { class: 'actionbar', id: 'actionbar', role: 'dialog', 'aria-label': 'Options for this line' },
      h('div', { class: 'quote' }, h('q', null, s.text), h('span', null, sp + fmtTime(s.start))),
      h('div', { class: 'actions' },
        app.audio && h('button', { class: 'act', onclick: () => { seek(s.start); play(); unpick(); } }, icon('play'), 'Play'),
        h('button', { class: 'act', onclick: () => copyQuote(s) }, icon('copy'), 'Copy'),
        h('button', { class: 'act', onclick: () => shareQuote(s) }, icon('link'), 'Share'),
        h('button', { class: 'act', onclick: () => askAbout(s) }, icon('spark'), 'Ask AI'),
        h('button', { class: 'act', 'aria-label': 'Close', onclick: unpick }, icon('close'), 'Close')));
    layers.append(bar);
    if (keyboardMode) bar.querySelector('.act').focus({ preventScroll: true });
  }
  function unpick() {
    $('#actionbar')?.remove();
    $$('.s.picked').forEach((el) => el.classList.remove('picked'));
    app.picked = null;
  }
  function quoteText(s) {
    const who = model.multi ? speaker(s.speaker).name + ', ' : '';
    return `“${s.text}” (${who}${app.filename}, ${fmtTime(s.start)})`;
  }
  function copyQuote(s) {
    copy(quoteText(s));
    unpick();
    toast('Copied the line with its time');
  }
  function shareQuote(s) {
    const text = quoteText(s);
    unpick();
    if (navigator.share && !SHOT) navigator.share({ text }).catch(() => {});
    else { copy(text); toast('Copied, ready to paste anywhere'); }
  }
  function askAbout(s) {
    unpick();
    setTab('chat');
    const input = $('#composer-input');
    if (input) { input.value = `What did they mean by “${s.text}” at ${fmtTime(s.start)}?`; input.focus(); }
  }
  function copy(text) { try { navigator.clipboard.writeText(text); } catch (e) { /* prototype: best effort */ } }

  // ---------- search: a mode, not a panel ----------
  function findHits(q) {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return model.sentences.filter((s) => s.text.toLowerCase().includes(needle)).map((s) => s.i);
  }
  function highlight(text, q) {
    const safe = escapeHtml(text);
    if (!q.trim()) return safe;
    return safe.replace(new RegExp(escapeRe(escapeHtml(q.trim())), 'gi'), (m) => `<mark>${m}</mark>`);
  }

  function openSearch(q) {
    closeLayers();
    clearSearch();
    const input = h('input', { type: 'search', value: q, placeholder: 'Search this transcript', 'aria-label': 'Search this transcript', autocomplete: 'off', enterkeyhint: 'search', spellcheck: 'false' });
    const clear = h('button', { class: 'clear', type: 'button', 'aria-label': 'Clear search', onclick: () => { input.value = ''; update(); input.focus(); } }, icon('close', 'sm'));
    const results = h('div', { class: 'results', id: 'results' });
    const layer = h('div', { class: 'search-layer', id: 'search', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Search this transcript' },
      h('div', { class: 'search-top' }, h('div', { class: 'search-box' }, icon('search', 'sm'), input, clear), h('button', { class: 'cancel', onclick: closeLayers }, 'Cancel')),
      results);
    function update() {
      const hits = findHits(input.value);
      clear.hidden = !input.value;
      results.replaceChildren(...resultsList(input.value, hits));
    }
    input.addEventListener('input', update);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const hits = findHits(input.value); if (hits.length) jumpTo(input.value, hits, 0); } });
    layers.append(layer);
    lockScroll(true);
    update();
    if (!EMBED) input.focus();
  }

  function resultsList(q, hits) {
    const out = [];
    if (!q.trim()) {
      out.push(h('div', { class: 'results-empty' }, h('b', null, 'Find a word or a name'), 'Tap a result to jump to that moment in the transcript.'));
      return out;
    }
    if (!hits.length) {
      out.push(h('div', { class: 'results-empty', role: 'status' }, h('b', null, `No matches for “${q.trim()}”`),
        locked() ? 'It may be in the part after the free preview.' : 'Try a shorter word, or check the spelling.'));
    } else {
      out.push(h('p', { class: 'count', role: 'status' }, hits.length === 1 ? '1 match' : `${hits.length} matches`));
      hits.forEach((i, k) => {
        const s = model.sentences[i];
        const who = model.multi ? h('b', null, speaker(s.speaker).name) : null;
        const text = h('div', { class: 'r-text' });
        text.innerHTML = highlight(s.text, q);
        out.push(h('button', { class: 'result', onclick: () => jumpTo(q, hits, k) },
          h('div', { class: 'r-head' }, who, who && h('span', { 'aria-hidden': 'true' }, '·'), fmtTime(s.start)), text));
      });
    }
    if (locked()) {
      out.push(h('div', { class: 'results-note' }, `You’re searching the free preview, the first ${fmtLength(model.previewEnd)}. `,
        h('button', { class: 'link', onclick: () => { closeLayers(); openSheet('signup'); } }, 'Read the rest free'),
        ` to search all ${fmtLength(duration)}.`));
    }
    return out;
  }

  function jumpTo(q, hits, i) {
    closeLayers();
    app.search = { q: q.trim(), hits, i };
    // mark every match in the text, and the current one more strongly
    hits.forEach((si) => { const el = sEl(si); if (el) el.innerHTML = highlight(model.sentences[si].text, q); });
    showMatch();
  }
  function showMatch() {
    const { q, hits, i } = app.search;
    $$('.s.hit').forEach((el) => el.classList.remove('hit'));
    const el = sEl(hits[i]);
    el.classList.add('hit');
    scrollToEl(el, 0.35);
    $('#matchbar')?.remove();
    const bar = h('div', { class: 'matchbar', id: 'matchbar', role: 'group', 'aria-label': 'Search matches' },
      h('button', { 'aria-label': 'Previous match', disabled: i === 0 || null, onclick: () => { app.search.i--; showMatch(); } }, icon('up')),
      h('div', { class: 'ml', role: 'status' }, `${i + 1} of ${hits.length} `, h('span', null, `“${q}”`)),
      h('button', { 'aria-label': 'Next match', disabled: i === hits.length - 1 || null, onclick: () => { app.search.i++; showMatch(); } }, icon('down')),
      h('button', { 'aria-label': 'Search again', onclick: () => openSearch(q) }, icon('search', 'sm')),
      h('button', { 'aria-label': 'Close search', onclick: clearSearch }, icon('close', 'sm')));
    document.body.append(bar);
  }
  function clearSearch() {
    if (!app.search) return;
    app.search.hits.forEach((si) => { const el = sEl(si); if (el) { el.textContent = model.sentences[si].text; el.classList.remove('hit'); } });
    app.search = null;
    $('#matchbar')?.remove();
  }

  // ---------- sheets: one component for download, more, display, sign-up ----------
  let opener = null;
  function openSheet(kind, opts = {}) {
    const from = document.activeElement;
    closeLayers();
    opener = from;
    const scrim = h('div', { class: 'scrim' + (kind === 'display' ? ' light' : ''), onclick: closeLayers });
    const sheet = h('div', { class: 'sheet', id: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'sheet-title', tabindex: '-1' });
    layers.append(scrim, sheet);
    lockScroll(true);
    showView(kind, opts);
  }
  function showView(kind, opts = {}) {
    const sheet = $('#sheet');
    if (!sheet) return openSheet(kind, opts);
    sheet.replaceChildren(h('div', { class: 'grab', 'aria-hidden': 'true' }), ...VIEWS[kind](opts).filter(Boolean));
    sheet.scrollTop = 0;
    // Inputs get focus so the keyboard comes up; otherwise move focus to the
    // first control only for keyboard users, and to the sheet itself for touch.
    const input = (opts.focusEmail && $('#email', sheet)) || $('[autofocus]', sheet);
    const first = $('.row, .btn, .seg button, input', sheet);
    if (SHOT || EMBED) { /* leave focus alone */ }
    else if (input) input.focus({ preventScroll: true });
    else if (keyboardMode && first) first.focus({ preventScroll: true });
    else sheet.focus({ preventScroll: true });
  }
  function sheetHead(title, backTo) {
    return h('div', { class: 'sheet-head' },
      backTo && h('button', { class: 'icon-btn back', 'aria-label': 'Back', onclick: () => showView(backTo) }, icon('back')),
      h('h2', { id: 'sheet-title' }, title),
      h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: closeLayers }, icon('close')));
  }
  function row(ic, label, sub, tag, onclick, extra = {}) {
    return h('button', { class: 'row' + (extra.danger ? ' danger' : ''), onclick },
      icon(ic), h('span', { class: 'label' }, h('b', null, label), sub && h('small', null, sub)),
      tag && h('span', { class: 'tag' }, tag), extra.chevron && icon('right', 'sm'));
  }
  function switchRow(label, sub, checked, onchange, ic) {
    const id = 'sw-' + label.replace(/\W+/g, '-').toLowerCase();
    return h('label', { class: 'switch-row' + (ic ? ' with-icon' : ''), for: id },
      ic && icon(ic),
      h('span', null, label, sub && h('small', null, sub)),
      h('input', { type: 'checkbox', role: 'switch', class: 'switch', id, checked: checked || null, onchange: (e) => onchange(e.target.checked) }));
  }
  const base = () => app.filename.replace(/\.[^.]+$/, '');

  function download(format) {
    if (locked()) return showView('signup', { reason: 'download', format });
    closeLayers();
    const names = { drive: `Saved ${base()}.txt and ${base()}.srt to your Google Drive` };
    toast(names[format] || `Downloading ${base()}.${format}`);
  }

  const VIEWS = {
    download: () => [
      sheetHead('Download'),
      h('p', { class: 'sheet-sub' }, locked() ? `${app.filename} · Needs a free account` : app.filename),
      h('p', { class: 'group-label' }, 'Transcript'),
      h('div', { class: 'rows' },
        row('doc', 'Word document', 'Opens in Word, Pages or Google Docs', '.docx', () => download('docx')),
        row('text', 'Plain text', 'Just the words', '.txt', () => download('txt'))),
      switchRow('Include timestamps', 'In the Word and text files', app.stamps, (v) => { app.stamps = v; }, 'clock'),
      h('p', { class: 'group-label' }, 'Subtitles'),
      h('div', { class: 'rows' },
        row('cc', 'Subtitles', 'For video editors and YouTube', '.srt', () => download('srt')),
        row('cc', 'Subtitles for web players', null, '.vtt', () => download('vtt')),
        row('globe', 'Subtitles in another language', 'Translated, then saved as .srt', null, () => (locked() ? showView('signup', { reason: 'download', format: 'srt' }) : showView('translate')), { chevron: true })),
      h('p', { class: 'group-label' }, 'Also'),
      h('div', { class: 'rows' },
        row('copy', 'Copy all text', null, null, () => { if (locked()) return showView('signup', { reason: 'copy' }); copy(F.result.text); closeLayers(); toast('Copied the whole transcript'); }),
        row('folder', 'Save to Google Drive', 'Adds the .txt and .srt', null, () => download('drive'))),
    ],
    'download-summary': () => [
      sheetHead('Download the summary'),
      h('p', { class: 'sheet-sub' }, app.filename),
      h('div', { class: 'rows' },
        row('text', 'Plain text', null, '.txt', () => download('summary.txt')),
        row('doc', 'Markdown', 'For Notion, Obsidian and docs sites', '.md', () => download('summary.md')),
        row('copy', 'Copy the summary', null, null, () => { closeLayers(); toast('Copied the summary'); })),
    ],
    translate: () => {
      let lang = 'hi';
      const langs = [['hi', 'Hindi'], ['es', 'Spanish'], ['fr', 'French'], ['de', 'German'], ['pt', 'Portuguese'], ['ja', 'Japanese']];
      return [
        sheetHead('Subtitles in another language', 'download'),
        h('div', { class: 'langs', role: 'radiogroup', 'aria-label': 'Language' }, langs.map(([code, name]) =>
          h('label', { class: 'radio-row' }, h('input', { type: 'radio', name: 'lang', value: code, checked: code === lang || null, onchange: () => { lang = code; } }), name))),
        h('button', { class: 'btn btn-primary', style: 'margin-top:12px', onclick: () => { closeLayers(); toast(`Translating… ${base()}.${lang}.srt will download when it’s ready`); } }, 'Translate and download .srt'),
      ];
    },
    more: () => {
      const owner = app.viewer === 'owner';
      return [
        sheetHead(app.filename),
        h('div', { class: 'rows' },
          row('textsize', 'Text size and display', null, null, () => showView('display', { back: 'more' }), { chevron: true }),
          owner && row('pencil', 'Rename', null, null, () => showView('rename'), { chevron: true }),
          row('info', 'File details', null, null, () => showView('details'), { chevron: true })),
        owner && h('div', { class: 'sep' }),
        owner && h('div', { class: 'rows' }, row('trash', 'Move to trash', 'You can undo this', null, trash, { danger: true })),
      ];
    },
    display: (o) => {
      const labels = ['Small', 'Default', 'Large', 'Largest'];
      return [
        sheetHead('Text size and display', o.back),
        h('div', { class: 'seg', role: 'group', 'aria-label': 'Text size' }, SIZES.map((px, k) =>
          h('button', { 'aria-pressed': String(app.size === k), 'aria-label': labels[k], style: `font-size:${12 + k * 3}px`, onclick: (e) => {
            app.size = k; store.set('size', k); applyDisplay();
            $$('button', e.currentTarget.parentNode).forEach((b, j) => b.setAttribute('aria-pressed', String(j === k)));
          } }, 'A'))),
        switchRow('Timestamps', null, app.times, (v) => { app.times = v; store.set('times', v); applyDisplay(); }),
        model.multi && switchRow('Speaker names', null, app.speakers, (v) => { app.speakers = v; store.set('speakers', v); applyDisplay(); }),
        app.audio && switchRow('Follow the audio', 'Keep the line being played on screen', app.follow, (v) => { app.follow = v; syncDock(); }),
        h('p', { class: 'note' }, 'Only changes how it looks here. Downloads and copies aren’t affected.'),
      ];
    },
    details: () => {
      const created = new Date(F.status.created_at * 1000);
      const day = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const keptUntil = new Date(created.getTime() + me().retention_days * 864e5);
      const audio = app.audio ? `Kept until ${day(keptUntil)}` : `Removed. Free previews keep audio for ${FX.audioExpired.retention_days} days`;
      const dl = h('dl', { class: 'kv' });
      [['Name', app.filename], ['Length', fmtLength(duration)], ['Language', LANGS[F.status.language]],
        ['Speakers', String(model.speakerIds.length)], ['Added', created.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })],
        ['From', 'Uploaded file'], ['Audio', audio]].forEach(([k, v]) => dl.append(h('div', null, h('dt', null, k), h('dd', null, v))));
      dl.append(h('div', null, h('dt', null, 'File ID'), h('dd', { class: 'mono' }, F.status.job_id)));
      return [sheetHead('File details', 'more'), dl,
        h('button', { class: 'btn btn-plain', onclick: () => { copy(F.status.job_id); toast('Copied the file ID for support'); } }, icon('copy', 'sm'), 'Copy file ID for support')];
    },
    rename: () => {
      const input = h('input', { id: 'rename', value: app.filename, autocomplete: 'off', enterkeyhint: 'done', autofocus: true });
      const save = () => {
        const v = input.value.trim();
        if (!v) return input.focus();
        app.filename = v; closeLayers(); render(); toast('Renamed');
      };
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });
      if (!SHOT) setTimeout(() => input.setSelectionRange(0, base().length), 30);
      return [sheetHead('Rename', 'more'), h('label', { class: 'field' }, h('span', null, 'Name'), input), h('button', { class: 'btn btn-primary', onclick: save }, 'Save')];
    },
    'rename-speaker': (o) => {
      const sp = speaker(o.id);
      const input = h('input', { id: 'speaker-name', placeholder: 'Their name', value: app.names[o.id] || '', autocomplete: 'off', enterkeyhint: 'done', autofocus: true });
      const save = () => {
        const v = input.value.trim();
        if (v) app.names[o.id] = v; else delete app.names[o.id];
        closeLayers(); render(); toast(v ? `Every line from ${sp.name} now says ${v}` : 'Name removed');
      };
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });
      const first = model.sentences.find((s) => s.speaker === o.id);
      return [sheetHead(`Who is ${sp.name}?`),
        first && h('p', { class: 'sheet-sub' }, `First heard at ${fmtTime(first.start)}: “${first.text}”`),
        h('label', { class: 'field' }, h('span', null, 'Name'), input),
        h('button', { class: 'btn btn-primary', onclick: save }, 'Rename everywhere'),
        h('p', { class: 'note' }, 'Changes every line from this speaker, here and in downloads.')];
    },
    signup: (o = {}) => {
      const titles = {
        download: `Download ${base()}.${o.format || 'docx'}`,
        copy: 'Copy the whole transcript',
      };
      const why = o.reason ? 'Downloads come with a free account, and your first transcript is free, up to 3 hours. No card.'
        : 'A free account opens all of it, with downloads, and keeps it in your files. Your first transcript is free, up to 3 hours. No card.';
      app.pending = o.reason === 'download' ? { download: o.format || 'docx' } : null;
      const email = h('input', { id: 'email', type: 'email', inputmode: 'email', autocomplete: 'email', enterkeyhint: 'send', placeholder: 'you@example.com' });
      const send = () => { const v = email.value.trim(); if (!/.+@.+\..+/.test(v)) { email.focus(); email.setAttribute('aria-invalid', 'true'); return; } showView('signup-code', { email: v }); };
      email.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
      return [
        sheetHead(titles[o.reason] || `Keep reading ${app.filename}`),
        h('p', { class: 'sheet-sub' }, why),
        h('button', { class: 'btn btn-google', onclick: () => signIn('google') }, icon('google'), 'Continue with Google'),
        h('div', { class: 'or' }, 'or'),
        h('label', { class: 'field' }, h('span', null, 'Email'), email),
        h('button', { class: 'btn btn-primary', onclick: send }, 'Email me a sign-in code'),
        h('p', { class: 'legal' }, 'Works whether or not you already have an account.', h('br'), 'By continuing you agree to the Terms and the Privacy Policy.'),
      ];
    },
    'signup-code': (o) => {
      const code = h('input', { id: 'code', class: 'code', inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '6', pattern: '[0-9]*', 'aria-label': '6-digit code', autofocus: true, value: SHOT ? '4821' : '' });
      const go = h('button', { class: 'btn btn-primary', disabled: true, onclick: () => signIn('code') }, 'Verify and keep reading');
      code.addEventListener('input', () => {
        code.value = code.value.replace(/\D/g, '').slice(0, 6);
        go.disabled = code.value.length !== 6;
        if (code.value.length === 6) signIn('code');
      });
      return [
        sheetHead('Check your email', 'signup'),
        h('p', { class: 'sheet-sub' }, `We sent a 6-digit code to ${o.email}. It works for 10 minutes.`),
        h('label', { class: 'field' }, h('span', null, 'Code'), code),
        go,
        h('p', { class: 'legal' }, 'Nothing arrived? Check spam, or ', h('button', { class: 'link', onclick: () => toast('Sent a new code') }, 'send a new code'), '.'),
      ];
    },
    wait: () => [sheetHead('Signing you in'), h('div', { class: 'center-msg', role: 'status' }, h('div', { class: 'spinner' }), 'One moment…')],
  };

  function signIn() {
    showView('wait');
    setTimeout(unlock, SHOT ? 0 : 900);
  }

  function unlock() {
    // Keep the reader where it was: find the paragraph at the top of the
    // screen, re-render with the full transcript, and put it back.
    const firstVisible = $$('.para').find((p) => p.getBoundingClientRect().bottom > 90);
    const anchorIdx = firstVisible ? +firstVisible.dataset.p : 0;
    const anchorTop = firstVisible ? firstVisible.getBoundingClientRect().top : 0;
    const oldCount = model.paras.length;
    closeLayers();
    app.viewer = 'owner';
    buildModel();
    render();
    const el = $(`.para[data-p="${anchorIdx}"]`);
    if (el) window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - anchorTop);
    $$('.para').forEach((p) => { if (+p.dataset.p >= oldCount - 1) p.classList.add('fresh'); });
    const pending = app.pending;
    app.pending = null;
    if (pending && pending.download) toast(`You’re in. Downloading ${base()}.${pending.download}`);
    else toast('You’re in. The whole transcript is open and saved to your files.');
  }

  function trash() {
    closeLayers();
    toast(`${app.filename} moved to trash`, { label: 'Undo', fn: () => toast('Restored') });
  }

  // ---------- player: only when there is audio to play ----------
  let raf = 0, lastTs = 0, activeIdx = -1, autoUntil = 0;
  function renderDock() {
    $('#dock')?.remove();
    $('#return')?.remove();
    const show = app.audio && !app.page && app.tab === 'transcript';
    document.body.classList.toggle('has-dock', show);
    if (!show) return;
    const range = h('input', { class: 'scrub', id: 'scrub', type: 'range', min: '0', max: String(duration), step: '0.1', value: String(app.t), 'aria-label': 'Position in the recording' });
    range.addEventListener('input', () => seek(+range.value));
    const dock = h('div', { class: 'dock', id: 'dock', role: 'region', 'aria-label': 'Player' },
      range,
      h('div', { class: 'dock-row' },
        h('button', { class: 'icon-btn', 'aria-label': 'Back 5 seconds', onclick: () => seek(app.t - 5) }, icon('back5')),
        h('button', { class: 'play', id: 'play', 'aria-label': 'Play', onclick: () => (app.playing ? pause() : play()) }, icon('play')),
        h('div', { class: 'clock' }, h('span', { id: 'now' }, fmtTime(app.t)), h('span', { class: 'of' }, ' / ' + fmtTime(duration))),
        h('button', { class: 'speed', id: 'speed', 'aria-label': 'Playback speed', onclick: () => { app.rate = RATES[(RATES.indexOf(app.rate) + 1) % RATES.length]; syncDock(); } }, '1×'),
        h('button', { class: 'icon-btn follow', id: 'follow', 'aria-label': 'Follow the audio', onclick: () => { app.follow = !app.follow; syncDock(); if (app.follow) { $('#return')?.remove(); followNow(); } } }, icon('follow'))));
    document.body.append(dock);
    syncDock();
    syncPlayhead();
  }
  function syncDock() {
    const btn = $('#play');
    if (!btn) return;
    btn.replaceChildren(icon(app.playing ? 'pause' : 'play'));
    btn.setAttribute('aria-label', app.playing ? 'Pause' : 'Play');
    $('#speed').textContent = `${app.rate}×`;
    $('#follow').setAttribute('aria-pressed', String(app.follow));
  }
  function play() {
    if (!app.audio) return;
    if (app.t >= duration) app.t = 0;
    app.playing = true;
    lastTs = 0;
    syncDock();
    if (!SHOT) raf = requestAnimationFrame(tick);
    followNow();
  }
  function pause() { app.playing = false; cancelAnimationFrame(raf); syncDock(); }
  function tick(ts) {
    if (!app.playing) return;
    if (lastTs) app.t = Math.min(duration, app.t + ((ts - lastTs) / 1000) * app.rate);
    lastTs = ts;
    syncPlayhead();
    if (app.t >= duration) pause(); else raf = requestAnimationFrame(tick);
  }
  function seek(t) { app.t = clamp(t, 0, duration); syncPlayhead(); followNow(); }
  function syncPlayhead() {
    const now = $('#now'), range = $('#scrub');
    if (now) now.textContent = fmtTime(app.t);
    if (range) { range.value = String(app.t); range.style.setProperty('--p', (app.t / duration) * 100 + '%'); range.setAttribute('aria-valuetext', `${fmtTime(app.t)} of ${fmtTime(duration)}`); }
    let idx = -1;
    for (const s of model.sentences) { if (s.start <= app.t + 0.05) idx = s.i; else break; }
    if (idx !== activeIdx) {
      if (activeIdx >= 0) sEl(activeIdx)?.classList.remove('playing');
      activeIdx = idx;
      if (idx >= 0 && (app.playing || app.t > 0)) sEl(idx)?.classList.add('playing');
      if (app.playing && app.follow) followNow();
    }
  }
  function followNow() {
    if (!app.follow || activeIdx < 0) return;
    const el = sEl(activeIdx);
    if (el) { autoUntil = performance.now() + 800; scrollToEl(el, 0.3); }
  }
  function showReturnPill() {
    if ($('#return') || activeIdx < 0) return;
    document.body.append(h('button', { class: 'return-pill', id: 'return', onclick: () => { app.follow = true; syncDock(); $('#return')?.remove(); followNow(); } },
      icon('follow', 'sm'), `Back to ${fmtTime(model.sentences[activeIdx].start)}`));
  }

  // ---------- summary and AI chat: entry points only ----------
  function summaryView() {
    if (locked()) {
      return h('div', { class: 'panel' }, h('section', { class: 'paywall' },
        h('h2', null, 'The summary comes with a free account'),
        h('p', null, 'A summary, the topics and the key quotes, each linked to the moment it was said. Your first transcript is free, up to 3 hours.'),
        h('button', { class: 'btn btn-google', onclick: () => { openSheet('signup'); } }, icon('google'), 'Continue with Google'),
        h('button', { class: 'btn btn-text', onclick: () => openSheet('signup', { focusEmail: true }) }, 'Use email instead')));
    }
    const cite = (t) => h('button', { class: 'cite', onclick: () => jumpToTime(t), 'aria-label': `Go to ${fmtTime(t)}` }, fmtTime(t));
    return h('div', { class: 'panel' },
      h('h3', null, 'Summary'),
      h('p', null, 'A quarterly planning review. Revenue beat forecast by 11%, mostly from enterprise deals that closed early. Self-serve was flat and conversion slipped, probably because of the July onboarding change. The mobile launch moves to the first week of November so four blocking accessibility issues can be fixed first.'),
      h('h3', null, 'Key quotes'),
      h('ul', { class: 'decisions' },
        h('li', null, '“Revenue came in 11% above forecast.” ', cite(10.8)),
        h('li', null, '“We are moving it from October to the first week of November.” ', cite(29.8)),
        h('li', null, '“Annual plans went up by a third, and refunds did not move.” ', cite(61.7))));
  }
  function jumpToTime(t) {
    setTab('transcript');
    const s = [...model.sentences].reverse().find((x) => x.start <= t + 0.05) || model.sentences[0];
    if (app.audio) seek(s.start);
    requestAnimationFrame(() => { scrollToEl(sEl(s.i), 0.3); pick(s.i); });
  }

  const ANSWERS = {
    decided: { q: 'What was decided?', a: (c) => ['Three things. The mobile launch moves to the fourth of November ', c(71.8), ', the annual discount ships to everyone on Monday ', c(75.6), ', and the July onboarding change gets a proper review next week ', c(79.3), '.'] },
    actions: { q: 'What are the action items?', a: (c) => ['Fix the four blocking accessibility issues before launch ', c(39.3), ', fill two platform roles this quarter ', c(44.4), ', and roll out the annual discount on Monday ', c(65.4), '.'] },
    quiz: { q: 'Quiz me on this recording', a: (c) => ['Question 1 of 5. Why did conversion to paid slip? The answer was said at ', c(26.4), ' if you want to check.'] },
  };
  function chatView() {
    const cite = (t) => h('button', { class: 'cite', onclick: () => jumpToTime(t) }, fmtTime(t));
    const log = h('div', { id: 'chatlog' });
    const say = (key) => {
      const item = ANSWERS[key];
      log.append(h('p', { class: 'bubble me' }, item.q));
      if (locked() && key !== 'quiz') log.append(h('p', { class: 'bubble ai' }, 'That part comes after the free preview. ', h('button', { class: 'link', onclick: () => openSheet('signup') }, 'Read the rest free'), ' and ask again.'));
      else log.append(h('p', { class: 'bubble ai' }, item.a(cite)));
    };
    if (P.chat && app.chat.length === 0) { app.chat.push(P.chat); }
    app.chat.forEach(say);
    const input = h('input', { id: 'composer-input', placeholder: 'Ask about this recording', 'aria-label': 'Ask about this recording', enterkeyhint: 'send', autocomplete: 'off' });
    const send = () => { if (!input.value.trim()) return; log.append(h('p', { class: 'bubble me' }, input.value.trim()), h('p', { class: 'bubble ai' }, 'In this prototype only the suggested questions have answers.')); input.value = ''; };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
    return [h('div', { class: 'panel' },
      h('p', null, 'Ask anything about this recording. Every answer links to the second it was said, so you can check it.'),
      h('div', { class: 'suggest' }, Object.entries(ANSWERS).map(([k, v]) => h('button', { onclick: () => say(k) }, v.q))),
      log),
    h('div', { class: 'composer' }, input, h('button', { 'aria-label': 'Send', onclick: send }, icon('send')))];
  }

  // ---------- whole-page states ----------
  function statePage() {
    const page = (ic, title, text, ...rest) => h('section', { class: 'state', 'aria-labelledby': 'state-title' },
      h('div', { class: 'state-icon' }, icon(ic)), h('h2', { id: 'state-title' }, title), h('p', null, text), ...rest);
    switch (app.page) {
      case 'processing':
      case 'queued': return processingPage();
      case 'no-speech': return page('wave', 'We didn’t hear anyone speaking',
        'This file sounds like music or background noise, so there’s nothing to transcribe. You haven’t been charged for it.',
        h('button', { class: 'btn btn-primary', onclick: () => toast('That opens the upload page') }, 'Upload a different file'),
        h('p', { class: 'fine' }, `Speech was found in ${Math.round(FX.noSpeech.speech_ratio * 100)}% of the file.`));
      case 'failed': return page('alert', 'This one didn’t transcribe',
        'Something went wrong on our side. A failed transcription doesn’t use any of your minutes.',
        h('button', { class: 'btn btn-primary', onclick: () => { app.page = 'queued'; render(); runProcessing(); } }, 'Try again'),
        h('button', { class: 'btn btn-plain', onclick: () => toast('That opens chat support') }, 'Contact support'));
      case 'error': return errorPage();
      case 'offline': return page('wifioff', 'You’re offline',
        'This transcript will open as soon as you’re back online. Nothing is lost.',
        h('button', { class: 'btn btn-primary', onclick: () => (navigator.onLine ? loadReader() : toast('Still offline')) }, 'Try again'));
      case 'not-yours': return page('user', 'This transcript isn’t in your account',
        `You’re signed in as ${me().email}. It may belong to another account, or it may have been deleted.`,
        h('button', { class: 'btn btn-primary', onclick: () => toast('That signs you out and back in') }, 'Switch account'),
        h('button', { class: 'btn btn-plain', onclick: () => toast('That opens your files') }, 'Go to your files'));
      case 'signed-out': return page('lock', 'Sign in to open this transcript',
        'It’s saved to a WhipScribe account. Sign in with the email that made it.',
        h('button', { class: 'btn btn-google', onclick: () => { app.viewer = 'owner'; loadReader(); } }, icon('google'), 'Continue with Google'),
        h('button', { class: 'btn btn-plain', onclick: () => { app.page = null; app.viewer = 'guest'; render(); openSheet('signup', { focusEmail: true }); } }, icon('mail', 'sm'), 'Use email instead'));
      default: return h('div');
    }
  }

  function processingPage() {
    const queued = app.page === 'queued';
    const pct = Math.round((queued ? 0 : FX.processing.progress) * 100);
    const estimate = duration / 3600 * 120 < 60 ? 'Usually done in under a minute for a recording this long.' : `Usually about ${Math.round(duration / 3600 * 2)} minutes.`;
    const skeleton = h('div', { class: 'skeleton', 'aria-hidden': 'true' },
      [[94, 88, 60], [97, 91, 72, 40], [90, 95, 55]].map((ws) => h('div', { class: 'gp' }, h('div', { class: 'gh' }), ws.map((w) => h('div', { class: 'gl', style: `width:${w}%` })))));
    return h('div', null,
      h('section', { class: 'progress-card', 'aria-labelledby': 'pc-title' },
        h('h2', { id: 'pc-title' }, queued ? 'Waiting to start' : `Transcribing ${app.filename}`),
        h('p', { class: 'sub' }, queued ? 'Your file is next in the queue. It usually starts within a few seconds.' : estimate),
        h('div', { class: 'meter' + (queued ? ' indeterminate' : ''), role: 'progressbar', 'aria-label': 'Transcription progress', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': queued ? null : String(pct) },
          h('div', { class: 'fill', id: 'fill', style: queued ? '' : `width:${pct}%` })),
        h('div', { class: 'meter-row' }, h('span', { id: 'pct' }, queued ? 'Queued' : `${pct}%`), h('span', null, fmtLength(duration)))),
      h('p', { class: 'notice' }, icon('clock', 'xs'), h('span', null, app.viewer === 'owner'
        ? 'You can close this page. It will be in your files when it’s done.'
        : 'You can close this page. ', app.viewer !== 'owner' && h('button', { class: 'link', onclick: () => toast('We’ll email you when it’s ready') }, 'Email me when it’s ready'))),
      skeleton);
  }
  function runProcessing() {
    if (SHOT) return;
    let p = app.page === 'queued' ? 0 : FX.processing.progress;
    const step = () => {
      if (app.page === 'queued') { app.page = 'processing'; render(); p = 0.05; }
      p = Math.min(1, p + 0.09);
      const fill = $('#fill'), pct = $('#pct');
      if (fill) { fill.style.width = p * 100 + '%'; fill.parentNode.setAttribute('aria-valuenow', String(Math.round(p * 100))); }
      if (pct) pct.textContent = Math.round(p * 100) + '%';
      if (p >= 1) setTimeout(() => { loadReader(); toast('Your transcript is ready'); }, 500);
      else setTimeout(step, 550);
    };
    setTimeout(step, app.page === 'queued' ? 1800 : 700);
  }

  function errorPage() {
    let left = 8;
    const status = h('p', { class: 'fine', role: 'status' }, `Trying again by itself in ${left} s`);
    const tryNow = () => { clearInterval(timer); status.replaceChildren(h('span', { class: 'spinner', style: 'display:inline-block;vertical-align:middle;width:16px;height:16px;margin-right:8px' }), 'Trying again…'); setTimeout(loadReader, 900); };
    const timer = SHOT ? 0 : setInterval(() => { left--; if (left <= 0) tryNow(); else status.textContent = `Trying again by itself in ${left} s`; }, 1000);
    return h('section', { class: 'state', 'aria-labelledby': 'state-title' },
      h('div', { class: 'state-icon' }, icon('cloudoff')),
      h('h2', { id: 'state-title' }, 'We couldn’t load this transcript'),
      h('p', null, 'Your recording and transcript are safe. This is a problem on our side and it usually clears within a minute.'),
      h('button', { class: 'btn btn-primary', onclick: tryNow }, 'Try again'),
      status,
      h('button', { class: 'ref', onclick: () => { copy('503 ' + F.status.job_id); toast('Copied the details for support'); } }, icon('copy', 'xs'), `Error 503 · ${F.status.job_id.slice(0, 8)}`));
  }

  function loadReader() {
    app.page = null;
    if (app.viewer === 'other') app.viewer = 'owner';
    buildModel();
    render();
    window.scrollTo(0, 0);
  }

  // ---------- layers, focus, scrolling ----------
  let keyboardMode = false;
  document.addEventListener('keydown', () => { keyboardMode = true; }, true);
  document.addEventListener('pointerdown', () => { keyboardMode = false; }, true);
  function closeLayers() {
    const hadSheet = !!$('#sheet') || !!$('#search');
    layers.replaceChildren();
    unpick();
    lockScroll(false);
    if (hadSheet && opener && document.contains(opener)) opener.focus({ preventScroll: true });
    opener = null;
  }
  function lockScroll(on) { document.documentElement.style.overflow = on ? 'hidden' : ''; }
  function scrollToEl(el, at) {
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top - window.innerHeight * at;
    window.scrollTo({ top: Math.max(0, top), behavior: SHOT ? 'auto' : 'smooth' });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if ($('#sheet') || $('#search') || $('#actionbar')) closeLayers();
      else if (app.search) clearSearch();
    }
    if (e.key === 'Tab' && $('#sheet')) { // keep focus inside an open sheet
      const f = $$('#sheet button, #sheet input, #sheet [tabindex="0"]').filter((x) => !x.disabled && x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  document.addEventListener('pointerdown', (e) => {
    const bar = $('#actionbar');
    if (bar && !bar.contains(e.target) && !e.target.closest('.s, .ts')) unpick();
  });

  // the header tucks away while you read down and comes back when you scroll up
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const top = $('#top');
    if (top) {
      if (y > lastY + 4 && y > 120) top.classList.add('tucked');
      else if (y < lastY - 4 || y < 120) top.classList.remove('tucked');
      top.classList.toggle('lifted', y > 4);
    }
    if (app.playing && app.follow && performance.now() > autoUntil && Math.abs(y - lastY) > 2) {
      app.follow = false; syncDock(); showReturnPill();
    }
    lastY = y;
  }, { passive: true });
  window.addEventListener('online', () => { if (app.page === 'offline') loadReader(); });

  // ---------- toasts ----------
  function toast(msg, action) {
    const host = $('#toasts');
    const t = h('div', { class: 'toast' }, icon('check', 'sm'), h('span', null, msg),
      action && h('button', { onclick: () => { t.remove(); action.fn(); } }, action.label));
    host.replaceChildren(t);
    if (!SHOT) setTimeout(() => t.remove(), action ? 6000 : 3500);
  }

  // ---------- boot ----------
  buildModel();
  render();
  if (app.page === 'processing' || app.page === 'queued') runProcessing();
  if (P.sheet) openSheet(P.sheet, P.opts || {});
  if (P.search) {
    if (P.jump != null) jumpTo(P.search, findHits(P.search), P.jump);
    else openSearch(P.search);
  }
  if (P.pick != null) pick(P.pick);
  if (P.playing) { app.playing = true; syncDock(); syncPlayhead(); if (!P.followOff) followNow(); if (!SHOT) { lastTs = 0; raf = requestAnimationFrame(tick); } }
  if (P.scroll) {
    const [kind, n] = P.scroll.split(':');
    const el = kind === 'paywall' ? $('#paywall') : $(`.para[data-p="${n}"]`);
    if (el) window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - (kind === 'paywall' ? window.innerHeight * 0.3 : 12));
    if (kind === 'para') $('#top')?.classList.add('tucked');
  }
  if (P.followOff) { app.follow = false; syncDock(); showReturnPill(); }
  if (P.toast === 'unlocked') toast('You’re in. The whole transcript is open and saved to your files.');
  if (P.toast === 'trash') trash();
})();
