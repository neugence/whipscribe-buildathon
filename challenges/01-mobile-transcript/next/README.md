# Transcript reader audit — mobile viewports (Gate A)

Track 1 work: an audit of the public transcript reader at
https://whipscribe.com/view?id=e0394eda-e7cd-43ce-a253-48c3f207d3b2 on phone
viewports, deduplicated against the existing open issues.

**Status: filed.** Four issues were created on `neugence/whipscribe-buildathon`
(on purpose, not in the fork — the fork has issues disabled):

| Filed | Issue |
|---|---|
| 02 bug | [#201](https://github.com/neugence/whipscribe-buildathon/issues/201) |
| 02 proposal | [#202](https://github.com/neugence/whipscribe-buildathon/issues/202) |
| 03 bug | [#203](https://github.com/neugence/whipscribe-buildathon/issues/203) |
| 04 bug | [#204](https://github.com/neugence/whipscribe-buildathon/issues/204) |

The bodies under `issues/` are what was posted (03 as revised at review: impact
stated from the rendered accessibility tree, with no screen-reader session
claimed). Nothing was pushed; no PR was opened.

## Review outcome

| Draft | Decision |
|---|---|
| 01 — header meta dangling `·` | **Dropped at review:** minor cosmetic, not worth one of the limited slots. Evidence folder and screenshot removed. |
| 02 — Text size behind the player | **Filed as #201**, plus a **Proposal as #202** (strongest before/after candidate) |
| 03 — dialogs missing dialog semantics | **Filed as #203**, framed on the accessibility tree, not on observed VoiceOver/TalkBack behaviour |
| 04 — Download sheet overflows at 320px | **Filed as #204**, measured evidence + the user-facing sideways-scroll problem |

## How it was tested

- Playwright + Chromium, mobile emulation: iPhone Safari 17 UA,
  `isMobile: true`, `hasTouch: true`, `deviceScaleFactor: 2`.
- Viewports: 320×568, 320×720, 360×640, 375×667, 390×844, 414×896
  (plus 1280×900 as a desktop sanity check for finding 03 only).
- Signed out, public demo recording; no other account was used.
- Every claim was measured in the page (`getBoundingClientRect`,
  `getComputedStyle`, `document.elementFromPoint`, real `touchscreen.tap`),
  not inferred from markup.
- Screenshots carry a green measurement overlay (the numbers in the shot are
  the numbers in `evidence/*/metrics.json`). Each shot was OCR-checked so the
  file name matches its content.

## The four bodies

### `issues/02-bug.md` — `[mobile] Reading settings — Text size control is obscured by the persistent audio player and cannot be activated at the affected mobile sizes`

Sheet `#wt-view-pop` is anchored to the viewport bottom and is not scrollable
(`scrollHeight == clientHeight == 195`); `#audio-bar` covers the last 103 px.
At 320×568 the *Text size* label is at y 477 and `#wt-opt-size` at y 475–503,
under a player that starts at y 465. `elementFromPoint` over every sampled
point returns `audio-bar` / `seek-fwd-15` / `playback-rate`, never the control;
a real tap dismisses the sheet. Same geometry at 320/360/375/390/414 wide.
Impact: stops me from finishing — no way to change text size on a phone.
Dedupe: #149 and #92 are different components.

### `issues/02-proposal.md` — `Proposal: Reading settings sheet that clears the audio player (before/after)`

Anchors the sheet to the player instead of the viewport
(`bottom: <player height>`, capped `max-height`), adds `overflow-y: auto`, keeps
the grab handle as an explicit dismissal, and gives the sheet dialog semantics.
Before/after ASCII drawings with the same measured coordinates; front-end only,
roughly half a day including the viewport pass.

### `issues/03-bug.md` — `[mobile] Download and File details dialogs are missing proper dialog semantics for assistive technologies`

Both sheets are `<div class="wt-dialog-bd">` with `role=null`, `aria-modal=null`
and no accessible name; `#wt-details-h` is an `<h2>` nothing points at. Framed
on what the rendered accessibility tree shows: no dialog role, no accessible
name, no `aria-modal`, background content still in the tree — with the impact
section explicitly stating that **no screen-reader session was run**. Keyboard
handling already works (focus enters, Tab stays inside, Escape restores focus)
and is called out so it is not regressed. Reproduced at 320×568 and 1280×900.

### `issues/04-bug.md` — `[mobile] Download sheet content overflows horizontally at 320px`

`.dl-grid` computes `grid-template-columns: 314px` in a 280 px box; 19 elements
end at x = 332–334 against a 320 px viewport; the sheet is `overflow-x: auto`
with 320 → 334, so it hides 14 px of content behind a sideways swipe nobody
tries. Broken at 320×568 and 320×720; measured clean at 360, 375, 390, 414.

## What was checked and deliberately not filed

| Candidate | Why it is not an issue |
|---|---|
| Header meta dangling `·` | Dropped at review — minor cosmetic, not worth a slot. (Measured: `#meta-line` innerText ends in `·`; `span.dot[data-sep=language]` keeps `hidden` but computes `display: block`.) |
| Search `×` leaves an empty toolbar | Input stays open with its placeholder — correct "cleared" state |
| "Quiz me" does nothing when signed out | False alarm: the tap at 320×568 was landing on the player (already #149); at 375×667 the free point opens the Quiz sign-in sheet |
| Timestamp deep link `#M:SS` does not jump | The feature does not exist — no `hashchange` handling and no matching element ids; `?t=` is only the emailed-link token |
| Share transcript button | `display: none` at every width including desktop — auth-gated, not a phone bug |
| Red "File not found" in the player | Already filed (broken/empty audio player on public demos, and #64) |
| Touch targets under 44px | Already filed (timestamps/play icons ~14px) |
| Text selection → AI | Taken by #91 / #185 |
| Chat composer below the fold | Page scrolls; composer becomes reachable and hittable |
| End of transcript behind the player | Clears the player by 161 px at max scroll |
| Export dialog content below the fold | Inner scroller works, background scroll is locked |
| Search result states, timestamps toggle, text size value, Copy feedback, settings sheet dismissal | All behave correctly |
| Rename / Delete / Edit lines screens | Hidden while signed out — could not be tested honestly |
| Desktop 1280×900 | Clean; no overlap of the first segment, no horizontal scroll |

## What was not done

- Four issues filed (#201–#204); no PR opened, nothing pushed, nothing
  committed yet.
- No physical device or real browser: everything is Chromium mobile emulation.
- No screen reader session — finding 03 is based on missing ARIA attributes.
- No signed-in flows (filename-as-title in the header, Rename/Delete,
  share links, paid recordings).
- The Playwright harness lives outside the repo and is not committed here.

## Prototype — the reader, rebuilt (`prototype/index.html`)

The challenge asks for a mockup we can open on a phone.
`prototype/index.html` is that file: one self-contained HTML page — no
build step, no dependencies, no network requests, no storage — written
against the `after/` screenshots and the measurements in `evidence/`.

### What changed

| State | Change | Why |
|---|---|---|
| 1–3 Reader, scrolled, preview boundary | Rebuilt to the `after/01–05` measurements at 320/375/390/1280 | Same product, verified geometry |
| 4 Search | In-flow bar under the tabs: count, prev, next, clear, empty and no-match states, query in the URL | `after/06`; closes the gaps found in the live audit |
| 5 Download | Bottom sheet with a fluid grid — no sideways scroll at 320 | **Demonstrates the #204 fix** (source computes 314px columns inside a 280px box) |
| 6 More menu | Nine items, full-viewport backdrop, focus handling | `after/08` |
| 7 File details | Sheet carries dialog semantics: `role`, accessible name, `aria-modal`, focus trap, Escape restore | **Demonstrates the #203 fix** (source sheets render `role=null`) |
| 8 Text selection | 254×44 action bar centred on the selection, clamped 24px inside the shell, flips above the keep-reading bar, Escape collapses | `after/10` + the challenge question on selection |
| 9 Processing | **New state:** static "still processing" screen; Summary / AI Chat / Search / Download / Copy disabled while it shows | Mandated: *"There is no screen for that above. Design it."* |
| 10 Four-speaker meeting | **New state:** 4-voice transcript at 320px; speaker label on its own line above the turn, only when the speaker changes; settings row *Show speaker labels* | Mandated: *"Show a meeting with four speakers at 320 px."* |
| 11 Keyboard-open | **New state:** with the search input focused and the viewport occluded, the keep-reading bar and player yield and the shell shrinks to the visible area | Mandated: *"what happens when the keyboard is up?"* |
| #201 Reading settings | Sheet scrolls and **Text size stays reachable above the player** at every tested width | **Demonstrates the #201 fix** (source: control sits behind `#audio-bar`) |

### Entry URLs

Direct links; the three are orthogonal and combine (`?proc=1&spk=4`):

- `prototype/index.html?proc=1` → Processing (state 9)
- `prototype/index.html?spk=4` → Four-speaker meeting (state 10)
- `prototype/index.html?kb=1` → Keyboard-open (state 11): opens Search
  focused; pair with a viewport shrunk by the keyboard height to inspect it

### Responsive targets

**320×568 (required), 375×667, 390×844, 1280×900** — every state is
verified at all four; keyboard-open additionally at its occluded sizes
320×352 / 375×451 / 390×628.

### What was deliberately kept unchanged

Header and tab layout, the 103px player, the keep-reading copy and its
position, the 46/50/52px timestamp gutter and mono timestamps, all
`after/`-derived copy (including the header's trailing `·`), sheet
placement, the single-active-panel URL machinery, and every focus/
Escape flow already correct in the source. Where the current screen was
right, it was copied, not redesigned.

### Known deliberate deviations

- Search count reads `0 matches` instead of the source's `none`.
- Processing is **static**: no timers, percent, ETA, polling or
  simulated completion, and it never claims the transcript is ready.
- Four-speaker metadata (`standup.m4a`, `12m 40s`, 28 turns, Priya /
  Marcus / Elena / Tom) is prototype-only; File details keeps the real
  demo recording's UUID.
- Speaker names are not searchable — search matches transcript text only.

### Prototype-only behavior and disclaimers

- **Keyboard-open is simulated.** There is no OS keyboard in the test
  browser: occlusion is modeled by resizing the viewport (216px keyboard
  → 352px effective at 320×568) and, on a real device, would be detected
  through the documented visual-viewport APIs. No fake keyboard or key
  grid is drawn, and **no real iOS/Android keyboard was tested**.
- **No VoiceOver, TalkBack or any screen-reader session was run** — the
  accessibility claims come from the rendered accessibility tree and
  computed styles, exactly as stated for #203.
- **No backend, audio or export is real**: the player is visual only,
  downloads do not produce a file, Summary/AI Chat have no content, and
  the prototype makes **no API calls of any kind**.
- All testing is Chromium mobile emulation — no physical device.

### Evidence

`sbs-*.png` = current-vs-prototype side-by-side for states that have an
authoritative source screenshot. `proto-*.png` = standalone prototype
evidence; **Processing, Four-speaker and Keyboard-open have no source
screen**, so no comparison image exists for them — they are designed
from the challenge mandate in the product's visual language.

## Files

```
next/
├── README.md                     ← this file
├── issues/                       ← paste-ready bodies (3 bugs + 1 proposal)
│   ├── 02-bug.md
│   ├── 02-proposal.md
│   ├── 03-bug.md
│   └── 04-bug.md
├── prototype/
│   └── index.html                ← the mockup: 11 reader states in one file
├── screenshots/                  ← 25 captures: 4 audit + 13 proto-* + 8 sbs-*
├── evidence/<slug>/metrics.json  ← the numbers behind each draft (3)
```

`screenshots/proto-*.png` are standalone prototype evidence (including
Processing, Four-speaker and Keyboard-open, which have no source screen);
`screenshots/sbs-*.png` are labelled current-vs-prototype composites.
