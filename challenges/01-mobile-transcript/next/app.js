const phone = document.querySelector('#phone');
const scroller = document.querySelector('#content-scroller');
const scenario = document.querySelector('#scenario');
const searchPanel = document.querySelector('.search-panel');
const searchInput = document.querySelector('#search-input');
const matchCount = document.querySelector('#match-count');
const transcript = document.querySelector('.transcript');
const previewBoundary = document.querySelector('.preview-boundary');
const selectionToolbar = document.querySelector('.selection-toolbar');
const statusScreens = [...document.querySelectorAll('.status-screen')];
const sheets = [...document.querySelectorAll('.sheet')];
const scrim = document.querySelector('.scrim');
const playButton = document.querySelector('[data-action="play"]');
const playIcon = playButton.querySelector('use');

const knownStates = new Set([...scenario.options].map(option => option.value));
let currentState = 'reader';
let playing = false;

function closeSheets() {
  sheets.forEach(sheet => { sheet.hidden = true; });
  scrim.hidden = true;
}

function openSheet(name) {
  closeSheets();
  const sheet = document.querySelector(`.${name}-sheet`);
  if (!sheet) return;
  sheet.hidden = false;
  scrim.hidden = false;
  window.requestAnimationFrame(() => sheet.querySelector('button, select, input')?.focus({ preventScroll: true }));
}

function setSearchMatches(query) {
  const normalized = query.trim().toLowerCase();
  let count = 0;
  document.querySelectorAll('.utterance').forEach(row => {
    const match = normalized && row.dataset.search.includes(normalized);
    row.classList.toggle('search-match', Boolean(match));
    if (match) count += 1;
  });
  matchCount.textContent = String(count);
}

function setState(next, { updateUrl = true } = {}) {
  currentState = knownStates.has(next) ? next : 'reader';
  phone.dataset.state = currentState;
  scenario.value = currentState;
  closeSheets();
  searchPanel.hidden = currentState !== 'search';
  previewBoundary.hidden = currentState !== 'preview';
  selectionToolbar.hidden = currentState !== 'selection';
  statusScreens.forEach(screen => { screen.hidden = true; });
  const activeStatus = document.querySelector(`.${currentState}-screen`);
  if (activeStatus) activeStatus.hidden = false;
  transcript.hidden = false;
  scroller.scrollTop = 0;

  if (currentState === 'search') {
    setSearchMatches(searchInput.value || 'onboarding');
    window.requestAnimationFrame(() => searchInput.focus({ preventScroll: true }));
  } else {
    document.querySelectorAll('.utterance').forEach(row => row.classList.remove('search-match'));
  }

  if (currentState === 'scrolled') {
    window.requestAnimationFrame(() => { scroller.scrollTop = 230; });
  }

  if (currentState === 'preview') {
    window.requestAnimationFrame(() => { scroller.scrollTop = Math.max(0, previewBoundary.offsetTop - 12); });
  }

  if (currentState === 'selection') {
    window.requestAnimationFrame(() => { scroller.scrollTop = 105; });
  }

  if (['tools', 'export', 'display', 'signup', 'ask'].includes(currentState)) openSheet(currentState);

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('state', currentState);
    window.history.replaceState({}, '', url);
  }
}

function handleAction(action) {
  if (action === 'tools') { openSheet('tools'); return; }
  if (action === 'export') { openSheet('export'); return; }
  if (action === 'display') { openSheet('display'); return; }
  if (action === 'ask') { openSheet('ask'); return; }
  if (action === 'signup') { openSheet('signup'); return; }
  if (action === 'close-sheet') { closeSheets(); return; }
  if (action === 'search') { setState('search'); return; }
  if (action === 'close-search') { setState('reader'); return; }
  if (action === 'clear-search') { searchInput.value = ''; setSearchMatches(''); searchInput.focus(); return; }
  if (action === 'play') {
    playing = !playing;
    playButton.setAttribute('aria-label', playing ? 'Pause recording' : 'Play recording');
    playIcon.setAttribute('href', playing ? '#icon-pause' : '#icon-play');
  }
}

document.addEventListener('click', event => {
  const actionButton = event.target.closest('[data-action]');
  if (actionButton) handleAction(actionButton.dataset.action);

  const time = event.target.closest('.time');
  if (time) {
    document.querySelector('#elapsed').textContent = time.textContent;
    playing = true;
    playButton.setAttribute('aria-label', 'Pause recording');
    playIcon.setAttribute('href', '#icon-pause');
  }
});

searchInput.addEventListener('input', () => setSearchMatches(searchInput.value));
document.querySelectorAll('[data-prompt]').forEach(button => {
  button.addEventListener('click', () => {
    const input = document.querySelector('#ask-input');
    input.value = button.dataset.prompt;
    input.focus();
  });
});
document.querySelector('.ask-composer').addEventListener('submit', event => event.preventDefault());
scenario.addEventListener('change', () => setState(scenario.value));
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (!scrim.hidden) closeSheets();
  else if (currentState === 'search') setState('reader');
});

const pageParams = new URL(window.location.href).searchParams;
const requestedWidth = Number(pageParams.get('width'));
if (requestedWidth >= 300 && requestedWidth <= 430 && window.innerWidth > 800) {
  // The desktop mockup adds a 10 px device frame on each side. Keep the
  // requested value as the actual page width inside that frame.
  phone.style.width = `${requestedWidth + 20}px`;
}
const initialState = pageParams.get('state') || 'reader';
setState(initialState, { updateUrl: false });
