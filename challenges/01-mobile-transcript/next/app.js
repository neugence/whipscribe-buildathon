const transcriptLines = [
  ["0:00", "Asha", "Thanks everyone for joining the quarterly planning review."],
  ["0:03", "Asha", "I want to move quickly today because we have a lot to cover."],
  ["0:07", "Ben", "We have a hard stop at the top of the hour."],
  ["0:10", "Maya", "Revenue came in 11 percent above forecast."],
  ["0:13", "Maya", "Most of that came from enterprise, where three of the five deals closed early."],
  ["0:18", "Dev", "The self-serve business was flat."],
  ["0:22", "Asha", "Trials were up, but conversion to paid slipped by about a point and a half."],
  ["0:26", "Ben", "We think that is mostly the onboarding change we shipped in July."],
  ["0:31", "Dev", "Resume the mobile launch discussion with support and release notes next."]
];

const cases = [
  {
    title: "Reader at 390 px",
    impact: "High",
    current: "../after/03-reader-390.png",
    summary: "Keep the current readable typography, but shrink the bottom stack into one dock so text stays primary.",
    state: "default"
  },
  {
    title: "Scrolled transcript",
    impact: "High",
    current: "../after/04-scrolled.png",
    summary: "When the header scrolls away, the reader keeps only the controls needed for orientation and playback.",
    state: "scrolled"
  },
  {
    title: "Preview boundary",
    impact: "High",
    current: "../after/05-preview-boundary.png",
    summary: "The paywall prompt becomes a compact strip inside the same bottom dock instead of competing with the player.",
    state: "preview"
  },
  {
    title: "Search",
    impact: "Medium",
    current: "../after/06-search.png",
    summary: "Search becomes a mode with a clear field, result count, next/previous controls, and one highlighted line.",
    state: "search"
  },
  {
    title: "Export sheet",
    impact: "Medium",
    current: "../after/07-export-sheet.png",
    summary: "Export choices are grouped by user intent: transcript, captions, destinations, and AI outputs.",
    state: "export"
  },
  {
    title: "Export option: Text",
    impact: "Medium",
    current: null,
    summary: "Tapping Text opens a focused confirmation sheet with filename, preview, and timestamp toggle.",
    state: "export-text"
  },
  {
    title: "Export option: Text with times",
    impact: "Medium",
    current: null,
    summary: "Tapping Text with times shows the time-coded format before download, reducing format guesswork.",
    state: "export-times"
  },
  {
    title: "Export option: JSON",
    impact: "Medium",
    current: null,
    summary: "JSON has developer-specific copy and explains that speakers, timestamps, and segments are included.",
    state: "export-json"
  },
  {
    title: "Export option: SRT subtitles",
    impact: "Medium",
    current: null,
    summary: "SRT gives a caption preview and a clear download action.",
    state: "export-srt"
  },
  {
    title: "Export option: VTT captions",
    impact: "Medium",
    current: null,
    summary: "VTT is separated from SRT so the user knows it is best for web captions.",
    state: "export-vtt"
  },
  {
    title: "Export option: Translated subtitles",
    impact: "Medium",
    current: null,
    summary: "Translated subtitles uses a language picker and explains the generated caption output.",
    state: "export-translate"
  },
  {
    title: "Export option: Google Drive",
    impact: "Medium",
    current: null,
    summary: "Drive export shows destination, included files, and account state before saving.",
    state: "export-drive"
  },
  {
    title: "Export option: Copy share link",
    impact: "Medium",
    current: null,
    summary: "Share link explains what recipients can see and keeps privacy visible.",
    state: "export-share"
  },
  {
    title: "More menu",
    impact: "Medium",
    current: "../after/08-more-menu.png",
    summary: "The long menu is grouped so the destructive action is separated and scanning cost is lower.",
    state: "more"
  },
  {
    title: "More option: Home",
    impact: "Low",
    current: null,
    summary: "Home confirms navigation and reassures that playback position is saved.",
    state: "more-home"
  },
  {
    title: "More option: File details",
    impact: "Medium",
    current: null,
    summary: "File details becomes a readable information sheet, not a dense modal.",
    state: "more-details"
  },
  {
    title: "More option: Quiz me",
    impact: "Medium",
    current: null,
    summary: "Quiz setup gives lightweight controls before generating questions.",
    state: "more-quiz"
  },
  {
    title: "More option: Rename",
    impact: "Medium",
    current: null,
    summary: "Rename uses an in-app sheet with validation instead of a native browser prompt.",
    state: "more-rename"
  },
  {
    title: "More option: Sign in",
    impact: "Medium",
    current: null,
    summary: "Sign in explains why account creation matters in this context.",
    state: "more-signin"
  },
  {
    title: "More option: Delete recording",
    impact: "High",
    current: null,
    summary: "Delete uses a clear destructive confirmation with cancel as the safer action.",
    state: "more-delete"
  },
  {
    title: "Reading settings",
    impact: "Medium",
    current: "../after/09-reading-settings.png",
    summary: "Settings stay small and direct: timestamps, speakers, text size, and dock behavior.",
    state: "settings"
  },
  {
    title: "Text selection",
    impact: "High",
    current: "../after/10-text-selection.png",
    summary: "Selection gets phone-native contextual actions: copy, play, ask AI, and make clip.",
    state: "selection"
  },
  {
    title: "Keep reading sign-up",
    impact: "High",
    current: "../after/11-keep-reading-signup.png",
    summary: "The sign-up moment explains what the user gets and keeps cancel/back available.",
    state: "signup"
  },
  {
    title: "Auth sheet: create account",
    impact: "High",
    current: null,
    summary: "Tapping Keep reading opens a focused sign-up sheet with Google, email, password, and clear no-card-needed copy.",
    state: "auth-signup"
  },
  {
    title: "Auth sheet: sign in",
    impact: "Medium",
    current: null,
    summary: "Returning users can switch to sign in without leaving the transcript or losing their reading position.",
    state: "auth-signin"
  },
  {
    title: "Processing state",
    impact: "High",
    current: null,
    summary: "The original set has no processing screen. This state tells users what is happening and what remains available.",
    state: "processing"
  },
  {
    title: "Four-speaker meeting at 320 px",
    impact: "High",
    current: null,
    summary: "Speaker labels become compact chips above each turn so a small phone can still read a meeting transcript.",
    state: "speakers"
  },
  {
    title: "Load failure",
    impact: "Medium",
    current: "../after/12-load-failure.png",
    summary: "The error state gives a recovery path instead of leaving the user at a dead end.",
    state: "failure"
  },
  {
    title: "Not on this account",
    impact: "Medium",
    current: "../after/13-not-on-this-account.png",
    summary: "The account error shows who is signed in, why the transcript is blocked, and the safest next actions.",
    state: "account-error"
  }
];

const grid = document.querySelector("#comparison-grid");

function icon(name) {
  const paths = {
    back: '<path d="M15 18l-6-6 6-6"/><path d="M9 12h12"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4.5-4.5"/>',
    download: '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    more: '<circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/>',
    close: '<path d="M18 6L6 18"/><path d="M6 6l12 12"/>',
    play: '<path d="M9 6.5v11l9-5.5-9-5.5z" fill="currentColor" stroke="none"/>',
    rewind5: '<path d="M10 7H5v5"/><path d="M5.4 12A7 7 0 1 0 8 6.1"/><text x="10.2" y="15" font-size="7" font-weight="900" stroke="none" fill="currentColor">5</text>',
    forward5: '<path d="M14 7h5v5"/><path d="M18.6 12A7 7 0 1 1 16 6.1"/><text x="8.8" y="15" font-size="7" font-weight="900" stroke="none" fill="currentColor">5</text>',
    speed: '<path d="M5 15a7 7 0 0 1 14 0"/><path d="M12 15l4-5"/><path d="M8 19h8"/><circle cx="12" cy="15" r="1"/>',
    warning: '<path d="M12 3l10 18H2L12 3z"/><path d="M12 9v5"/><path d="M12 17h.01"/>',
    resume: '<path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 5v7h7"/><path d="M10 8.5v7l5.5-3.5L10 8.5z" fill="currentColor" stroke="none"/>',
    copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 16H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    ai: '<path d="M12 3l1.7 5.2L19 10l-5.3 1.8L12 17l-1.7-5.2L5 10l5.3-1.8L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>',
    clip: '<path d="M4 8h8a4 4 0 0 1 0 8H7"/><path d="M20 16h-8a4 4 0 0 1 0-8h5"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.6l6.8-4.2"/><path d="M8.6 13.4l6.8 4.2"/>',
    up: '<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>',
    down: '<path d="M12 5v14"/><path d="M18 13l-6 6-6-6"/>',
    file: '<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
    code: '<path d="M8 9l-4 3 4 3"/><path d="M16 9l4 3-4 3"/><path d="M14 5l-4 14"/>',
    captions: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 11h4"/><path d="M13 11h4"/><path d="M7 15h7"/>',
    language: '<path d="M4 5h9"/><path d="M9 3v2"/><path d="M6 9c1.2 2.4 3.4 4.2 6 5"/><path d="M12 5c-.7 3.5-2.7 6.2-6 8"/><path d="M14 21l4-9 4 9"/><path d="M16 17h4"/>',
    drive: '<path d="M9 3h6l7 12-3 6H5l-3-6 7-12z"/><path d="M9 3l3 6"/><path d="M15 3l-3 6"/><path d="M5 21l7-12 7 12"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7h.01"/>',
    quiz: '<path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-1.1.8-1.9 1.4-1.9 2.9"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    chevron: '<path d="M9 18l6-6-6-6"/>',
    google: '<path d="M21.6 12.23c0-.74-.07-1.45-.19-2.14H12v4.05h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.32 2.98-7.44z" fill="#4285F4" stroke="none"/><path d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.51c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.6-4.12H3.05v2.59A10 10 0 0 0 12 22z" fill="#34A853" stroke="none"/><path d="M6.4 13.89A6 6 0 0 1 6.08 12c0-.66.11-1.29.32-1.89V7.52H3.05A10 10 0 0 0 2 12c0 1.61.38 3.13 1.05 4.48l3.35-2.59z" fill="#FBBC05" stroke="none"/><path d="M12 5.99c1.47 0 2.79.51 3.82 1.5l2.87-2.87C16.96 3.01 14.69 2 12 2a10 10 0 0 0-8.95 5.52l3.35 2.59C7.2 7.75 9.4 5.99 12 5.99z" fill="#EA4335" stroke="none"/>'
  };
  return `<svg class="icon icon-${name}" aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
}

function lineHtml(line, index, options = {}) {
  const [time, speaker, text] = line;
  const showSpeakers = options.speakers;
  const active = options.activeIndex === index ? " active-line" : "";
  const initials = speaker ? speaker.slice(0, 1) : "";
  let copy = text;
  if (options.search && index === 8) {
    copy = text.replace("Resume", '<span class="highlight">Resume</span>');
  }
  if (options.selection && index === 2) {
    copy = 'We have a <span class="selection-mark">hard stop at the top of the hour</span>.';
  }
  if (showSpeakers) {
    return `
      <article class="speaker-turn speaker-${speaker.toLowerCase()}${active}">
        <div class="speaker-head">
          <span class="speaker-avatar">${initials}</span>
          <strong>${speaker}</strong>
          <span>${time}</span>
        </div>
        <p>${copy}</p>
      </article>
    `;
  }
  return `
    <p class="line${active}">
      <span class="time">${time}</span>
      <span>${copy}</span>
    </p>
  `;
}

function renderTranscript(options = {}) {
  const lines = options.speakers ? transcriptLines : transcriptLines.map(([time, , text]) => [time, "", text]);
  const visible = options.short ? lines.slice(0, 5) : lines;
  return visible.map((line, index) => lineHtml(line, index, options)).join("");
}

function dockHtml(options = {}) {
  const strip = options.hidePreview ? "" : `
    <div class="preview-strip">
      <div class="preview-copy">
        <strong>Free preview: 48 percent read</strong>
        <span>Create a free account to keep reading on any device.</span>
      </div>
      <button class="primary">Keep reading</button>
    </div>
  `;
  const note = options.error ? `<div class="audio-note">${icon("warning")}<span>${options.error}</span></div>` : "";
  return `
    <div class="bottom-dock">
      ${strip}
      <div class="player">
        <div class="progress"><span></span></div>
        <div class="player-row">
          <span class="player-time">0:26 / 1:44</span>
          <button class="play" aria-label="Play recording">${icon("play")}</button>
          <span class="player-actions" aria-label="Playback controls">
            <button class="player-action-btn" aria-label="Back 5 seconds">${icon("rewind5")}</button>
            <button class="speed-chip" aria-label="Playback speed 1x">${icon("speed")}<span>1x</span></button>
            <button class="player-action-btn" aria-label="Forward 5 seconds">${icon("forward5")}</button>
          </span>
        </div>
        ${note}
      </div>
    </div>
  `;
}

function headerHtml(options = {}) {
  return `
    <div class="status-bar"><span>10:28 PM</span><span>LTE 100%</span></div>
    <div class="top-row">
      <button class="icon-btn" aria-label="Back">${icon("back")}</button>
      <div class="title-stack">
        <div class="title">${options.title || "Quarterly planning review"}</div>
        <div class="meta">1m 44s · EN · ${options.saved || "Saved"}</div>
      </div>
      <button class="icon-btn soft" aria-label="More actions">${icon("more")}</button>
    </div>
    <div class="tabs-row">
      <div class="tabs" role="tablist">
        <button class="tab active" role="tab" aria-selected="true">Transcript</button>
        <button class="tab" role="tab" aria-selected="false">Summary</button>
        <button class="tab" role="tab" aria-selected="false">AI Chat</button>
      </div>
      <button class="icon-btn ${options.searchActive ? "soft" : ""}" aria-label="Search transcript">${icon("search")}</button>
      <button class="icon-btn" aria-label="Download transcript">${icon("download")}</button>
    </div>
  `;
}

function sheet(type) {
  const groups = {
    export: [
      ["Transcript", [["Text", "Readable transcript"], ["Text with times", "Best for notes"], ["JSON", "For developers"]]],
      ["Captions", [["SRT", "Subtitles"], ["VTT", "Web captions"], ["Translated subtitles", "Pick language"]]],
      ["Destinations", [["Google Drive", "Save to folder"], ["Copy share link", "Public preview"]]]
    ],
    more: [
      ["Navigate", [["Home", "Back to files"], ["File details", "Duration, language, cost"]]],
      ["Create", [["Quiz me", "Practice from this recording"], ["Rename", "Change file name"]]],
      ["Account", [["Sign in", "Save across devices"]]],
      ["Danger", [["Delete recording", "Removes transcript and audio", "danger"]]]
    ]
  };
  const data = groups[type];
  return `
    <div class="sheet-scrim">
      <div class="sheet">
        <div class="handle"></div>
        <div class="sheet-head">
          <div>
            <h4>${type === "export" ? "Export" : "More actions"}</h4>
            <small>${type === "export" ? "Choose the format you need." : "Grouped for quick scanning."}</small>
          </div>
          <button class="icon-btn soft" aria-label="Close">${icon("close")}</button>
        </div>
        ${data.map(([label, items]) => `
          <div class="sheet-group">
            <p class="sheet-label">${label}</p>
            <div class="sheet-list">
              ${items.map(([name, help, danger]) => `
                <div class="sheet-item ${danger || ""}">
                  <span>${name}<small>${help}</small></span>
                  <span>${icon("chevron")}</span>
                </div>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function settingsSheet() {
  return `
    <div class="sheet-scrim">
      <div class="sheet">
        <div class="handle"></div>
        <div class="sheet-head">
          <div>
            <h4>Reading settings</h4>
            <small>Only controls that change the reader.</small>
          </div>
          <button class="icon-btn soft" aria-label="Close">${icon("close")}</button>
        </div>
        <div class="setting-row"><span>Show timestamps</span><span class="toggle"></span></div>
        <div class="setting-row"><span>Show speakers</span><span class="toggle"></span></div>
        <div class="setting-row"><span>Compact player dock</span><span class="toggle"></span></div>
        <div class="setting-row">
          <span>Text size</span>
          <span class="size-choice"><span>A</span><span class="active">A</span><span>A</span></span>
        </div>
      </div>
    </div>
  `;
}

function processingScreen() {
  return `
    <div class="processing-card">
      <div class="process-top">
        <span class="process-badge">62%</span>
        <div>
          <h4>Transcript is processing</h4>
          <p>You can leave this page. WhipScribe keeps working in the background.</p>
        </div>
      </div>
      <div class="mini-progress" aria-label="Processing progress"><span></span></div>
      <div class="steps" aria-label="Processing steps">
        <div class="step done">
          <span class="step-num">${icon("check")}</span>
          <span class="step-copy"><strong>Audio uploaded</strong><small>1m 44s recording received.</small></span>
        </div>
        <div class="step active">
          <span class="step-num">2</span>
          <span class="step-copy"><strong>Finding language & speakers</strong><small>Usually under a minute for this file.</small></span>
        </div>
        <div class="step">
          <span class="step-num">3</span>
          <span class="step-copy"><strong>Preparing reader</strong><small>Transcript, summary, and AI chat unlock together.</small></span>
        </div>
      </div>
    </div>
  `;
}

function failureScreen() {
  return `
    <div class="empty-card">
      <h4>We could not load this transcript</h4>
      <p>The link may be private, deleted, or temporarily unavailable. Try again or go back to your files.</p>
      <div class="reader-toolbar" style="margin-top: 14px;">
        <span class="tool-chip">Try again</span>
        <span class="tool-chip">Open files</span>
      </div>
    </div>
  `;
}

const detailFlows = {
  "export-text": {
    title: "Download text",
    subtitle: "Readable transcript",
    icon: "file",
    primary: "Download .txt",
    rows: [
      ["Filename", "quarterly-planning-review.txt"],
      ["Includes", "Clean transcript, no timestamps"],
      ["Best for", "Reading, sharing notes, pasting into docs"]
    ],
    preview: "Thanks everyone for joining the quarterly planning review. I want to move quickly today..."
  },
  "export-times": {
    title: "Download with times",
    subtitle: "Best for notes",
    icon: "clock",
    primary: "Download timed text",
    rows: [
      ["Filename", "quarterly-planning-review-timed.txt"],
      ["Timing", "Every transcript segment keeps its timestamp"],
      ["Best for", "Review notes and jumping back to audio"]
    ],
    preview: "0:00 Thanks everyone for joining...\n0:03 I want to move quickly today..."
  },
  "export-json": {
    title: "Download JSON",
    subtitle: "For developers",
    icon: "code",
    primary: "Download .json",
    rows: [
      ["Includes", "Segments, speakers, timestamps, language"],
      ["Schema", "Stable keys for automation"],
      ["Privacy", "Local download only"]
    ],
    preview: '{ "language": "en", "segments": [{ "start": 0, "speaker": "Asha" }] }'
  },
  "export-srt": {
    title: "Download SRT",
    subtitle: "Subtitles",
    icon: "captions",
    primary: "Download .srt",
    rows: [
      ["Format", "Numbered subtitle blocks"],
      ["Timing", "Start and end times included"],
      ["Best for", "Video editors and subtitle upload"]
    ],
    preview: "1\n00:00:00,000 --> 00:00:03,000\nThanks everyone for joining..."
  },
  "export-vtt": {
    title: "Download VTT",
    subtitle: "Web captions",
    icon: "captions",
    primary: "Download .vtt",
    rows: [
      ["Format", "WEBVTT captions"],
      ["Best for", "Web players and HTML video"],
      ["Timing", "Captions keep original timing"]
    ],
    preview: "WEBVTT\n\n00:00.000 --> 00:03.000\nThanks everyone for joining..."
  },
  "export-translate": {
    title: "Translate subtitles",
    subtitle: "Pick language",
    icon: "language",
    primary: "Generate subtitles",
    rows: [
      ["Language", "Hindi"],
      ["Output", ".srt and .vtt"],
      ["Note", "Original captions stay available"]
    ],
    preview: "Choose language -> Hindi\nOutput -> translated captions"
  },
  "export-drive": {
    title: "Save to Drive",
    subtitle: "Transcript and captions",
    icon: "drive",
    primary: "Save to Drive",
    rows: [
      ["Folder", "WhipScribe / Exports"],
      ["Files", ".txt + .srt"],
      ["Account", "mohit...@gmail.com"]
    ],
    preview: "quarterly-planning-review.txt\nquarterly-planning-review.srt"
  },
  "export-share": {
    title: "Copy share link",
    subtitle: "Public preview",
    icon: "share",
    primary: "Copy link",
    rows: [
      ["Access", "Anyone with link can preview"],
      ["Audio", "Not downloadable from preview"],
      ["Privacy", "You can revoke later"]
    ],
    preview: "whipscribe.com/view?id=quarterly-planning-review"
  },
  "more-home": {
    title: "Go to files",
    subtitle: "Your place is saved",
    icon: "home",
    primary: "Open files",
    rows: [
      ["Resume point", "0:26 saved"],
      ["Current file", "Quarterly planning review"],
      ["Return path", "Recent transcripts"]
    ],
    preview: "You can come back to this exact line later."
  },
  "more-details": {
    title: "File details",
    subtitle: "Recording metadata",
    icon: "info",
    primary: "Done",
    rows: [
      ["Duration", "1m 44s"],
      ["Language", "English"],
      ["Cost", "~ $0.01 estimated"],
      ["Created", "Today, 10:28 PM"]
    ],
    preview: "Saved transcript, summary, AI chat, and original audio."
  },
  "more-quiz": {
    title: "Quiz me",
    subtitle: "Practice from this recording",
    icon: "quiz",
    primary: "Create quiz",
    rows: [
      ["Questions", "5"],
      ["Difficulty", "Medium"],
      ["Source", "Transcript with evidence"]
    ],
    preview: "Example: What caused conversion to paid to slip?"
  },
  "more-rename": {
    title: "Rename file",
    subtitle: "In-app edit",
    icon: "edit",
    primary: "Save name",
    rows: [
      ["Current name", "Quarterly planning review"],
      ["New name", "Q3 planning review - mobile launch"],
      ["Validation", "Name must be unique in your library"]
    ],
    preview: "Q3 planning review - mobile launch"
  },
  "more-signin": {
    title: "Sign in",
    subtitle: "Save across devices",
    icon: "user",
    primary: "Continue with Google",
    rows: [
      ["Saves", "Library, position, AI chat"],
      ["Required for", "Full transcript and exports"],
      ["No card", "Needed for this preview"]
    ],
    preview: "Keep reading where you left off on desktop or mobile."
  },
  "more-delete": {
    title: "Delete recording",
    subtitle: "Permanent action",
    icon: "trash",
    primary: "Delete recording",
    danger: true,
    rows: [
      ["Deletes", "Transcript, summary, AI chat, and audio"],
      ["Recovery", "This cannot be undone"],
      ["Safer option", "Cancel and keep file"]
    ],
    preview: "Type-free confirmation. Destructive action is visually separated."
  }
};

function detailSheet(state) {
  const flow = detailFlows[state];
  if (!flow) return "";
  return `
    <div class="sheet-scrim">
      <div class="sheet detail-sheet ${flow.danger ? "danger-flow" : ""}">
        <div class="handle"></div>
        <div class="sheet-head">
          <div class="detail-title-row">
            <span class="detail-icon">${icon(flow.icon)}</span>
            <div>
              <h4>${flow.title}</h4>
              <small>${flow.subtitle}</small>
            </div>
          </div>
          <button class="icon-btn soft" aria-label="Close">${icon("close")}</button>
        </div>
        <div class="detail-preview"><pre>${flow.preview}</pre></div>
        <div class="detail-list">
          ${flow.rows.map(([label, value]) => `
            <div class="detail-row">
              <span>${label}</span>
              <strong>${value}</strong>
            </div>
          `).join("")}
        </div>
        <button class="detail-primary ${flow.danger ? "danger-primary" : ""}">${flow.primary}</button>
      </div>
    </div>
  `;
}

function authSheet(mode = "signup") {
  const isSignIn = mode === "signin";
  return `
    <div class="sheet-scrim auth-scrim">
      <div class="sheet auth-sheet">
        <button class="auth-close" aria-label="Close">${icon("close")}</button>
        <div class="auth-tabs" role="tablist" aria-label="Account mode">
          <button class="${isSignIn ? "active" : ""}" role="tab" aria-selected="${isSignIn}">Sign in</button>
          <button class="${isSignIn ? "" : "active"}" role="tab" aria-selected="${!isSignIn}">Sign up</button>
        </div>
        <div class="auth-copy">
          <h4>${isSignIn ? "Welcome back" : "Create your free account"}</h4>
          <p>${isSignIn ? "Continue reading where you left off." : "Your first transcript is free. No credit card."}</p>
        </div>
        <button class="google-btn">${icon("google")}<span>Continue with Google</span></button>
        <div class="divider"><span>Or with email</span></div>
        <label class="auth-field">
          <span>Email</span>
          <input type="email" name="email" autocomplete="email" spellcheck="false" placeholder="you@example.com" aria-label="Email">
        </label>
        <label class="auth-field">
          <span>Password</span>
          <input type="password" name="password" autocomplete="${isSignIn ? "current-password" : "new-password"}" placeholder="${isSignIn ? "Your password" : "At least 8 characters"}" aria-label="Password">
        </label>
        ${isSignIn ? `<a class="forgot-link" href="#">Forgot password?</a>` : ""}
        <button class="auth-primary">${isSignIn ? "Sign in" : "Create account"}</button>
        <p class="auth-legal">
          By continuing you agree to our <a href="#">terms</a> and <a href="#">privacy policy</a>.
        </p>
      </div>
    </div>
  `;
}

function accountErrorScreen() {
  return `
    <div class="empty-card account-card">
      <span class="empty-icon">${icon("user")}</span>
      <h4>This transcript is not in this account</h4>
      <p>You are signed in as <strong>mohit...@gmail.com</strong>. Ask the owner for access, switch accounts, or open your own files.</p>
      <div class="account-actions">
        <button class="primary">Switch account</button>
        <button class="secondary-action">Open my files</button>
      </div>
      <button class="text-action">Copy link to request access</button>
    </div>
  `;
}

function phone(state) {
  const isSearch = state === "search";
  const isSpeakers = state === "speakers";
  const isProcessing = state === "processing";
  const isFailure = state === "failure";
  const isAccountError = state === "account-error";
  const isAuth = state === "signup" || state === "auth-signup" || state === "auth-signin" || state === "more-signin";
  const hasDetailSheet = Boolean(detailFlows[state]);
  const hidePreview = ["export", "more", "settings", "processing", "failure", "account-error"].includes(state) || hasDetailSheet || isAuth;
  const readerClass = hidePreview ? "reader compact-bottom" : "reader";
  let reader = renderTranscript({
    speakers: isSpeakers,
    activeIndex: isSearch ? 8 : state === "preview" ? 8 : null,
    search: isSearch,
    selection: state === "selection",
    short: ["export", "more", "settings", "failure"].includes(state) || hasDetailSheet
  });

  if (isProcessing) reader = processingScreen();
  if (isFailure) reader = failureScreen();
  if (isAccountError) reader = accountErrorScreen();

  const toolbar = state === "scrolled" ? `
    <div class="reader-toolbar">
      <button class="tool-chip primary-chip" aria-label="Resume playback at 0:26">${icon("resume")}<span>Resume at 0:26</span></button>
      <button class="tool-chip" aria-label="Find in transcript">${icon("search")}<span>Find</span></button>
      <button class="tool-chip" aria-label="Share transcript">${icon("share")}<span>Share</span></button>
    </div>
  ` : "";

  const search = isSearch ? `
    <div class="search-panel">
      <div class="search-field"><span>${icon("search")}</span><strong>Resume</strong></div>
      <div class="search-controls" aria-label="Search result controls">
        <span class="count-pill">1 of 1</span>
        <button class="search-control" aria-label="Previous result">${icon("up")}</button>
        <button class="search-control" aria-label="Next result">${icon("down")}</button>
        <button class="search-control" aria-label="Close search">${icon("close")}</button>
      </div>
    </div>
  ` : "";

  const overlay =
    state === "export" ? sheet("export") :
    state === "more" ? sheet("more") :
    state === "more-signin" ? authSheet("signin") :
    hasDetailSheet ? detailSheet(state) :
    state === "settings" ? settingsSheet() :
    state === "selection" ? `
      <div class="selected-actions" role="toolbar" aria-label="Selected text actions">
        <button aria-label="Copy selection">${icon("copy")}<span>Copy</span></button>
        <button aria-label="Play from selected text">${icon("play")}<span>Play</span></button>
        <button aria-label="Ask AI about selection">${icon("ai")}<span>Ask</span></button>
        <button aria-label="Make clip from selection">${icon("clip")}<span>Clip</span></button>
      </div>
    ` :
    state === "signup" ? authSheet("signup") :
    state === "auth-signup" ? authSheet("signup") :
    state === "auth-signin" ? authSheet("signin") :
    "";

  return `
    <div class="phone">
      <div class="phone-screen">
        ${headerHtml({ searchActive: isSearch, title: isProcessing ? "team-sync.m4a" : "Quarterly planning review", saved: isProcessing ? "Processing" : "Saved" })}
        <div class="${readerClass}">
          ${toolbar}
          ${search}
          ${reader}
        </div>
        ${dockHtml({ hidePreview, error: state === "default" ? "Audio unavailable. Transcript stays readable." : "" })}
        ${overlay}
      </div>
    </div>
  `;
}

function render() {
  const params = new URLSearchParams(window.location.search);
  const requestedState = params.get("state");
  const visibleCases = requestedState ? cases.filter((item) => item.state === requestedState) : cases;

  grid.innerHTML = visibleCases.map((item) => `
    <article class="case">
      <div class="case-header">
        <div>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
        </div>
        <span class="impact">${item.impact} impact</span>
      </div>
      <div class="pair">
        <div class="panel">
          <p class="panel-label">Current</p>
          ${item.current ? `<img class="current-shot" src="${item.current}" width="390" height="844" alt="Current WhipScribe ${item.title} screenshot" loading="lazy" decoding="async">` : `<div class="missing-current"><p><strong>No current screen in the prompt.</strong><br>This is a missing state the challenge asks us to design.</p></div>`}
        </div>
        <div class="panel">
          <p class="panel-label">Proposed next pass</p>
          ${phone(item.state)}
        </div>
      </div>
    </article>
  `).join("");
}

render();
