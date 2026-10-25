// Prototype behaviour only: sheets, tabs, search highlight, selection bar.
// There is no audio and no server; "play" moves a highlight and a clock.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const body = document.body;
  // scroll this window only (scrollIntoView would also scroll a parent page such as compare.html)
  const center = (el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 });

  const toast = (msg) => {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); body.append(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(t._h); t._h = setTimeout(() => (t.hidden = true), 2200);
  };

  // ---- one sheet pattern: open, trap focus, close on Esc / scrim / ✕ ----
  let opener = null;
  const focusables = (el) => $$('button, [href], input, select, summary, [tabindex]:not([tabindex="-1"])', el).filter((e) => !e.disabled && e.offsetParent);
  const openSheet = (id, from) => {
    const sheet = document.getElementById(id);
    if (!sheet) return;
    opener = from || document.activeElement;
    $('.scrim').hidden = false; sheet.hidden = false;
    if (from === null) { sheet.tabIndex = -1; sheet.focus(); } else (focusables(sheet)[0] || sheet).focus();
  };
  const closeSheet = () => {
    const open = $('.sheet:not([hidden])');
    if (!open) return false;
    open.hidden = true; $('.scrim').hidden = true;
    if (opener) opener.focus();
    return true;
  };
  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open]');
    if (o) { e.preventDefault(); closeSheet(); openSheet(o.dataset.open, o); }
    if (e.target.closest('[data-close]') || e.target.classList.contains('scrim')) closeSheet();
    const t = e.target.closest('[data-toast]');
    if (t) { closeSheet(); toast(t.dataset.toast); }
  });
  document.addEventListener('keydown', (e) => {
    const open = $('.sheet:not([hidden])');
    if (e.key === 'Escape') { if (closeSheet()) return; closeSearch(); }
    if (e.key === 'Tab' && open) {
      const f = focusables(open); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  // ---- tabs (arrow keys move between them) ----
  const tabs = $$('[role="tab"]');
  const selectTab = (tab) => {
    if (tab.getAttribute('aria-disabled') === 'true') return;
    tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; const p = document.getElementById(t.getAttribute('aria-controls')); if (p) p.hidden = !on; });
    tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(n);
    });
  });

  // ---- search: highlight, count, up/down ----
  const bar = $('.search'), input = bar && $('input', bar), count = bar && $('.count', bar);
  const texts = () => $$('.transcript p');
  let hits = [], cur = -1;
  const clearMarks = () => $$('.transcript mark').forEach((m) => m.replaceWith(...m.childNodes));
  const run = () => {
    clearMarks(); texts().forEach((p) => p.normalize());
    const q = input.value.trim().toLowerCase(); hits = []; cur = -1;
    if (q.length > 1) {
      texts().forEach((p) => {
        const walk = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
        const nodes = []; while (walk.nextNode()) nodes.push(walk.currentNode);
        nodes.forEach((n) => {
          let i; while ((i = n.data.toLowerCase().indexOf(q)) > -1) {
            const m = document.createElement('mark'); const rest = n.splitText(i); n = rest.splitText(q.length);
            m.append(rest.cloneNode()); rest.replaceWith(m); hits.push(m);
          }
        });
      });
    }
    go(hits.length ? 0 : -1);
  };
  const go = (i) => {
    hits.forEach((h) => h.classList.remove('now'));
    cur = i;
    if (i > -1) { hits[i].classList.add('now'); center(hits[i]); }
    if (count) count.textContent = input.value.trim().length > 1 ? (hits.length ? `${cur + 1} of ${hits.length}` : 'No matches') : '';
  };
  const closeSearch = () => { if (!bar || bar.hidden) return; bar.hidden = true; input.value = ''; run(); body.classList.remove('kbd-open'); const b = $('[data-search]'); if (b) b.focus(); };
  if (bar) {
    input.addEventListener('input', run);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && hits.length) go((cur + 1) % hits.length); });
    $('[data-next]', bar).addEventListener('click', () => hits.length && go((cur + 1) % hits.length));
    $('[data-prev]', bar).addEventListener('click', () => hits.length && go((cur - 1 + hits.length) % hits.length));
    $('[data-close-search]', bar).addEventListener('click', closeSearch);
    const btn = $('[data-search]');
    if (btn) btn.addEventListener('click', () => { bar.hidden = false; input.focus(); });
    if (body.dataset.search) { bar.hidden = false; input.value = body.dataset.search; run(); }
  }

  // ---- "play": move the highlight; there is no audio in the prototype ----
  const time = $('.time');
  const setNow = (s) => {
    $$('.s.now').forEach((x) => x.classList.remove('now'));
    s.classList.add('now');
    if (time) time.firstChild.textContent = s.dataset.t || s.closest('[data-t]')?.dataset.t || '0:00';
  };
  document.addEventListener('click', (e) => {
    const s = e.target.closest('.s'); if (s && getSelection().isCollapsed) setNow(s);
    const ts = e.target.closest('.ts'); if (ts) { const first = ts.closest('.para, .turn')?.querySelector('.s'); if (first) setNow(first); }
  });
  const play = $('.dock .play');
  if (play) play.addEventListener('click', () => {
    const on = play.getAttribute('aria-pressed') !== 'true';
    play.setAttribute('aria-pressed', on); play.setAttribute('aria-label', on ? 'Pause' : 'Play');
    $('use', play)?.setAttribute('href', on ? '#i-pause' : '#i-play');
  });

  // ---- selection: action bar replaces the dock while text is selected ----
  const tr = $('.transcript');
  const selInfo = () => {
    const sel = getSelection();
    if (!tr || sel.isCollapsed || !tr.contains(sel.anchorNode)) return null;
    const el = sel.anchorNode.parentElement;
    const turn = el.closest('.para, .turn');
    const who = turn?.querySelector('.who')?.textContent.trim();
    const t = turn?.dataset.t || '0:00';
    return { text: sel.toString().trim(), who, t };
  };
  document.addEventListener('selectionchange', () => body.classList.toggle('selecting', !!selInfo()));
  $$('.selbar [data-act]').forEach((b) => b.addEventListener('click', async () => {
    const info = selInfo() || body._pre; if (!info) return;
    const link = `${location.href.split('#')[0]}#t=${info.t}`;
    const quote = `“${info.text}” — ${info.who ? info.who + ', ' : ''}${info.t}`;
    try {
      if (b.dataset.act === 'copy') { await navigator.clipboard.writeText(quote); toast('Copied with the timestamp'); }
      if (b.dataset.act === 'share') { if (navigator.share) await navigator.share({ text: quote, url: link }); else { await navigator.clipboard.writeText(`${quote}\n${link}`); toast('Link to this moment copied'); } }
    } catch { toast('Could not reach the clipboard here'); }
    if (b.dataset.act === 'play') { const s = getSelection().anchorNode?.parentElement?.closest('.s'); if (s) setNow(s); toast(`Playing from ${info.t}`); }
  }));
  if (body.dataset.preselect) {
    const s = document.querySelector(body.dataset.preselect);
    if (s) { const r = document.createRange(); r.selectNodeContents(s); getSelection().removeAllRanges(); getSelection().addRange(r); }
  }

  // ---- preview: hide the dock's "Keep reading" once the inline end note is visible ----
  const end = $('.preview-end');
  if (end && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => body.classList.toggle('at-end', e.isIntersecting)).observe(end);
  if (body.dataset.scrollto) { const t = $(body.dataset.scrollto); if (t) center(t); }

  // ---- URL switches for the compare page and screenshots: ?open=<sheet id>, ?kbd ----
  const q = new URLSearchParams(location.search);
  const auto = q.get('open') || body.dataset.autoopen;
  if (auto) openSheet(auto, null);
  if (q.has('kbd') && bar) { body.classList.add('kbd-open'); bar.hidden = false; input.value = q.get('kbd') || ''; run(); }

  // ---- rename a speaker everywhere (four-speaker screen) ----
  const rn = $('#rename-form');
  if (rn) rn.addEventListener('submit', (e) => {
    e.preventDefault();
    const key = rn.dataset.key, name = $('input', rn).value.trim(); if (!name) return;
    $$(`.who[data-sp="${key}"] .name`).forEach((n) => (n.textContent = name));
    closeSheet(); toast(`Renamed to ${name} everywhere`);
  });
  document.addEventListener('click', (e) => {
    const w = e.target.closest('.who[data-sp]'); if (!w || !rn) return;
    rn.dataset.key = w.dataset.sp; $('input', rn).value = $('.name', w).textContent;
  }, true);
})();
