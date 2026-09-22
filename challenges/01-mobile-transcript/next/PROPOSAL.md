# Challenge 01 — Next pass: transcript reader on a phone

**By Princy Chauhan**
Open the prototype: `challenges/01-mobile-transcript/next/index.html`

---

## What I was trying to solve

One question drove every decision: **what did this person come here to do?**

They came to read — or re-find — something that was said. That's it. Every
pixel that isn't transcript text, player controls, or a path back to the
library is overhead. The current design carries a lot of overhead.

---

## What I changed, and why

### 1. Replace the tall "Keep reading" bar with a 40 px slim banner

**Before:** A large green bar with bold text and a full-width button sits
permanently above the player. On a 375 px screen it takes roughly 64 px —
about 8% of the screen — just to tell a free user they're on a free plan.
It also competes visually with the transcript text.

**After:** A single 40 px banner with a small pill-shaped "Sign up free →"
link on the right. Same information, one-sixth the space, less visual noise.

The full sign-up CTA (headline, two buttons) appears **once**, inline, at the
exact moment the user hits the preview boundary. That's the right place for
it — not floating at the bottom of every screen.

**What I kept:** The accent colour (green) so the free-tier signal is still
unmistakable. The player stays below the banner at all times.

---

### 2. Trim the More menu from 9 items to 4, grouped

**Before:** One flat list — Home, Copy transcript, Reading settings,
Timestamps: shown, Quiz me, Sign in, Rename, File details, Delete recording.
Nine items with no hierarchy. A user has to read every line to find what they
want.

**After:** Three groups, four visible actions:

| Group | Items |
|---|---|
| Reading | Reading settings, Copy full transcript |
| File | Rename, File details |
| Danger | Delete recording |

**What I removed and where it went:**
- **Timestamps toggle** → moved into Reading settings where it belongs alongside text size and speakers
- **Quiz me** → belongs on the Summary tab, not buried in a utility menu
- **Sign in** → removed from the menu entirely; it appears on the preview boundary where it's contextually correct
- **Home** → the back button in the header already goes home; this was a duplicate

The grouped layout also means Delete is visually separated — it can never be
accidentally tapped while scanning the Reading options.

---

### 3. Text alignment: justified → left

**Before:** Transcript text is `text-align: justify`. At narrow widths
(320–375 px) justified text creates uneven word gaps that break the reading
flow, especially in short lines.

**After:** `text-align: left`. Left-aligned text reads faster on screens.
Justified text is a print convention; it actively hurts readability on mobile.

This is a one-line CSS change with the most direct impact on the core job
of the page.

---

### 4. Search: inline highlight, no separate result card

**Before:** Searching opens a field under the tabs, plus a floating result
card at the top of the transcript that restates the match. The user sees the
same content twice and the page feels cluttered.

**After:** The search bar lives under the tabs (good, kept). The match is
highlighted **in-place** in the transcript and the view auto-scrolls to it.
The floating result card is gone. A "1 / 3" counter and ↑↓ arrows in the
search bar let the user navigate between matches without leaving the
transcript context.

---

### 5. Download sheet: pre-select last used format, one-tap download

**Before:** The sheet lists all formats at equal weight. The user has to
choose every time, even if they always want `.txt`.

**After:**
- The last-used format is pre-selected (shown as chips, `.txt` selected by default)
- A single "Download .txt" button at the bottom completes the action in one tap
- Toggles for timestamps and speaker names are shown only when relevant (not a global checkbox above the format list)
- Drive and translated subtitles are grouped under "Also export" so they don't clutter the primary path

---

### 6. Reading settings: add "Show speakers" toggle

**Before:** Two controls — Show timestamps, Text size.

**After:** Three controls — Text size, Show timestamps, Show speakers,
Highlight current line.

Speaker labels are core data in a multi-person meeting. There should be a
way to hide them if the user finds them noisy. "Highlight current line" is
off by default — a power-user feature that doesn't need to be on for everyone.

---

### 7. Processing state: skeleton + status card (new — was missing)

**Before:** No screen exists for when a transcript is still processing. A
user who opens a file mid-transcription sees nothing designed.

**After:** A status card at the top of the content area:
- Icon + "Transcribing…" label
- Sub-line: "Usually under 2 minutes · 6:34 recording" — sets expectation
- A subtle animated progress bar (indeterminate, honest — not a fake percentage)

Below the card: animated skeleton lines in the shape of transcript blocks.
This tells the user the page is working and gives a sense of the content
shape that's coming.

Player controls are visible but disabled (greyed out, no pointer events).
Search and download icons are also disabled — nothing to act on yet.

---

### 8. Error state: human copy, clear recovery path

**Before:** Load failure state exists but uses system-level language.

**After:**
- "Couldn't load transcript" — user's words, not the system's
- "Your recording is safe — nothing was lost" — addresses the first fear
- Two recovery actions: "Try again" (primary) and "Go back to library" (secondary)
- Search and download icons greyed out

---

## What I deliberately kept

- **Three tabs: Transcript, Summary, Chat.** The hierarchy is correct.
  Transcript comes first because that's what most users open the page for.
- **The player at the bottom.** Fixed position is the right call — scrubbing
  while reading is the core interaction. The only change is it sits directly
  below the slim banner instead of below the large one.
- **Back button in the header.** Correct placement, correct behaviour.
- **Bottom sheets for overlays.** The swipe-up pattern is native to mobile.
  Using it for Download, More, and Settings keeps the interactions consistent
  with each other and with platform conventions.
- **Speaker names as coloured labels.** The colour-coding by speaker makes
  multi-speaker meetings scannable at a glance. Kept and extended to 4
  speaker colours in the prototype.

---

## Screens in the prototype

Open `index.html` in any browser — each section shows current vs. proposed side by side.

| Section | What it shows | Before / After |
|---|---|---|
| A | Default reader — bottom area, banner, text alignment | Both |
| B | More menu — 9 flat items vs 4 grouped | Both |
| C | Search — result card vs inline highlight | Both |
| D | Download sheet — pre-selected format, one-tap CTA | After only |
| E | Reading settings — 2 controls vs 3 with speakers toggle | Both |
| F | Preview boundary — inline sign-up CTA | After only |
| G | Text selection — new state (not in original) | After only |
| H | 4 speakers at 320 px — collapsed header, compact layout | After only |
| I | Processing skeleton — new state (not in original) | After only |
| J | Load failure + Not on this account | After only |

---

## One thing I would do next

**The 320 px case.** At the narrowest width the three icon buttons in the
header (search, download, more) get tight. The prototype already collapses
them into a single ··· overflow button at 320 px — but the overflow sheet
needs a slightly different layout there, surfacing Search as a full-width bar
rather than a tappable icon, since searching is the most common action at
that width.

## What the README asked — addressed

| Question | Answer |
|---|---|
| One thing a person came here to do? | Read. Every change increases reading area. |
| Keep-reading bar + player — right trade? | No. Replaced with 40 px slim banner. |
| More menu 9 items — which belong? | 4 stay, 5 moved to where they're contextually correct. |
| Search, download, settings — should they feel like one? | Yes — all three now use identical bottom sheet style (handle, title, grouped rows). |
| Processing state? | Designed (Section I). |
| 4 speakers at 320 px? | Designed (Section H). |
| Text selection? | Designed (Section G). |
| Desktop unchanged? | Kept out of scope — the challenge says the phone design must not break it, not that it should change. |
