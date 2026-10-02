# Challenge 01 — Mobile Transcript Reader, Next Pass

An interactive, dependency-free prototype of the phone reader redesign. Open `index.html` in any modern browser — no build step, no npm install, no fonts required to function (web fonts degrade to system fallbacks).

## What changed and why

The reader's mobile problems are mostly subtraction problems. Three findings drove the design:

1. **The preview box + player stack ate ~35% of the screen.** On a 320 px phone you could read 5–6 lines before scrolling. The unified dock takes ~15% and puts the preview limit on one line inside it, which frees roughly 60% more visible transcript.
2. **The More menu was a nine-item grab bag.** It had where four belonged: Home → back navigation, Copy → text selection, Quiz → AI chat, Sign in → the preview boundary. Timestamps became a header switch because it is a display toggle, not an action.
3. **Three different panel styles made every feature feel like a different app.** Search dropped inline, export was a sheet, settings was a modal. Everything is one bottom-sheet pattern now, so learning one panel teaches all of them.

## All 15 states

The toolbar pills drive every state, and each is deep-linkable:

| State | `?state=` | What it demonstrates |
|---|---|---|
| Reader | `reader` | Default: dock, speaker chips, gutter timestamps |
| Search | `search` | Pinned input, live count, results jump to timecodes |
| Search + keyboard | `keyboard` | The sheet keeps the input pinned above a simulated keyboard |
| More menu | `menu` | The 4-item menu with destructive item at the bottom |
| Text selection | `selection` | Tap any transcript line → Copy / Quote / Share |
| Ask AI composer | `ask` | Quote + speaker + timestamp chips pre-attached to a question |
| Processing | `loading` | Skeleton with job estimate |
| Load failure | `error` | Honest 504 message, retry, nothing-is-lost reassurance |
| Wrong account | `wrongaccount` | Recovery path for a share sent to the wrong login |
| Deleted | `deleted` | Trash state with undo and restore window |
| Empty transcript | `empty` | No speech detected; audio still playable |
| Offline | `offline` | Banner: cached reading works, export waits |
| Sign up | `signup` | The preview boundary CTA |
| Export / Settings / Details | `download` / `settings` / `menu` | Unified sheet family |

Plus: `?width=320|375|390|1280` and `?view=before|after|sbs`, and `?shot=1` hides the workbench chrome for clean screenshots.

The states are exercised directly in the browser at 320 px with no horizontal overflow.

## What works, what does not yet

**Works:** all 14 states above, search with live filtering, simulated playback with honest `aria-valuenow`/`aria-valuetext` on the scrubber, keyboard arrows on the scrubber, Escape closes any sheet, focus moves into opened sheets and returns on close, rename updates the header, Ask composer is pre-filled from the tapped passage.

**Does not work (deliberate limits):**
- No server: search is local to the page, "Ask" does not send anything, export/download/sign-in/delete/rename persistence are all simulated with toasts.
- No real audio; playback moves a progress bar.
- The Summary and AI Chat tabs hold sample content only.
- The simulated keyboard is a grey mock; real mobile keyboard behavior (viewport resizing) is designed for but not hardware-tested.
- Rename is lost on reload (no storage).
- Dark mode and the expanded player are not built.
- Not verified on Android hardware or with VoiceOver/TalkBack.

No API behavior is invented: nothing here calls the WhipScribe API; every server interaction is a labelled demo toast.

## What I learned (bugs found and fixed while testing)

1. **The 10 s buttons skipped 8 s.** The original handlers rewound/advanced by 8 percentage points of a 104-second track while labelling it "10 seconds". Fixed by computing from the track duration — the label now matches the behavior.
2. **`role="slider"` without `aria-valuenow` is announced as nothing.** The scrubber had no value attributes and no keyboard access. It now carries `aria-valuemin/max/now`, a live `aria-valuetext` ("0:48 of 1:44"), and Arrow key support.
3. **Sheets never returned focus.** Opening a sheet left keyboard users stranded on a hidden trigger. Sheets now capture focus on open and restore it on close; Escape dismisses from anywhere.
4. **Toast layer was silent to screen readers.** Both toast layers are now `aria-live="polite"` regions.
5. **A CSS merge left a stray `display:none` override** on the offline banner (banner could never show) — caught on the state sweep and removed.

## Accessibility notes

- All interactive targets ≥ 44×44 px (checked on every new control).
- Text contrast ≥ 7:1 on the reading surface (AAA); muted labels ≥ 4.5:1.
- Sheets and dialogs use real buttons with accessible names; the menu, selection, ask and export sheets are labelled sections.
- Keyboard: Tab reaches every control, Arrow keys scrub, Escape closes sheets, focus is trapped-in and restored-out.
- Status changes (toasts, offline, processing) are announced via `role="status"` / `aria-live`.

## How to run

Open `challenges/01-mobile-transcript/next/index.html`, or serve the folder (`python -m http.server`) and open on a phone on the same Wi-Fi. Every state is reachable from the toolbar or by URL, e.g. `index.html?state=error&width=320&shot=1`.
