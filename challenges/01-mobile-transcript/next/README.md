# Challenge 01 — the transcript reader on a phone, next pass

By Achi Vyshnavi ([@achi-vyshnavi28](https://github.com/achi-vyshnavi28))

**Open `index.html`.** Each case shows the current screen (from `../after/`)
next to a live phone you can tap. Every case also opens full-screen
(`index.html?screen=reader`, `?screen=meeting`, …) so it can be tried on a
real phone. One HTML file, no build step, no dependencies.

## How I started

Before designing, I used whipscribe.com as a new user on a phone-sized
screen: I signed up, transcribed a short clip and read it. I filed what I
found as #171, #172, #173 and #174. Two of those (#171, #173) are about this
reader, so their fixes are shown here as before/after rather than described.

## The one thing a person came to do

Read, and sometimes listen. Every change below either gives that back more
room or removes a decision the reader didn't need to make.

## What I changed, and why

| # | Screen | Change | Why |
|---|---|---|---|
| 1 | Reader | Whole sentences grouped into **speaker turns**, one timestamp per turn, left-aligned | Lines were split at every timestamp ("…have a hard" / "stop at the top of the hour"); the monospace gutter took about a quarter of the width; justified text made gaps and "seg-ment" breaks at 375 px |
| 2 | Bottom | **One 64 px bar**: player + "Keep reading" share it; the progress line shows how far into the preview you are | The preview bar, player and "Audio unavailable" line stacked to about 190 px, a quarter of the screen, and the sign-up sentence was truncated |
| 3 | Meeting at 320 px | **Names and colour dots**, tap a name to rename that speaker everywhere | The brief asked for four speakers at 320 px; the live Overview credits quotes to "— 0" today |
| 3b | No audio | Say it once at the top; **no player**, timestamps as plain text | A 00:00 / 00:00 player with a live-looking ▶ and red monospace error is worse than no player |
| 4 | Panels | **One ⋯ sheet**: Copy / Download / Share link on top, reading options inline, recording actions below. **More: 9 → 4** | Search, download and settings each opened a different panel; More mixed navigation, account, view settings and file actions |
| 5 | Search | The field replaces the header; the transcript **scrolls to the match** and highlights it in place | Today the match is copied into a pinned card while the transcript still starts at 0:00 |
| 6 | Selection | Copy · Play · **Share quote** (link to that second) · **Ask about this** (opens Chat with the quote) | The next two things people do with a quote on a phone are send it and ask about it |
| 7 | Processing (new) | Steps in plain words, an honest estimate, **transcript appears as it's written**, "you can close this page" | There is no screen for this today, and it is the first thing every new user sees |
| 8 | Load failure | "We couldn't open this transcript. Your recording is safe." Try again / Back to library; the code stays, small | "Couldn't load transcript (HTTP 503)" is the server talking, and the tabs stayed active above an empty page |

### Removed from More, and where each went

- **Home**: the back arrow already does it.
- **Sign in**: the bottom bar does it for signed-out readers.
- **Timestamps: shown**: it was a duplicate of the toggle inside Reading settings.
- **Reading settings**: now inline in the same sheet, with no second panel.
- **Copy transcript**: now a one-tap tile at the top of the sheet.

Left in More: Rename, Quiz me on this, Details, Delete.

### Download

Text and Word come first, each with one line saying what it is for.
Subtitles, translated subtitles and Google Drive are one tap deeper. Summary
exports move to the Summary tab, next to the summary they export.
"Include timestamps" is no longer a checkbox to remember, because the .txt
includes speaker names and times.

## What I kept, and why

- **The three tabs** (Transcript, Summary, Chat). They match the three jobs: read it, get the gist, ask it something.
- **The bottom sheet** as the one panel pattern. It was already there for Download and More; now everything uses it.
- **The search counter and arrows**, **Copy / Play** on selection, and the brand greens.
- **The desktop page** is unchanged in this pass. The same turn layout would work there, with speakers in a left column, but the phone was the brief.

## Answers to the brief's questions

- **How many taps to read?** Zero. The transcript is the first screen. To listen from a line: one tap on its time.
- **Keep reading + player at the bottom: is that the right trade, and what about the keyboard?** Merge them into one 64 px bar. When the keyboard is up (search, rename), the bar is hidden.
- **More has nine items: which belong there?** Four. See above.
- **Search, download, settings: should they feel like one?** Download and settings, yes: one sheet. Search, no: it is used *while* reading, so it takes the header instead of covering the text.
- **What does it look like while processing?** Case 7.
- **Four speakers at 320 px?** Case 3.
- **After selecting a line?** Case 6.
- **Should desktop change?** Not in this pass; the turn layout carries over when it does.

## Accessibility notes

- Every control is at least 44 × 44 px, including the per-turn time (it is the play button).
- Speaker colour is never the only cue; the name is always written.
- Sheets are `role="dialog"` with `aria-modal`, and close on Escape or a tap outside. The search count is announced with `aria-live="polite"`, which is scoped to the count only (compare my note about the Library in the issues).
- The spinner respects `prefers-reduced-motion`.

## What this prototype is not

- Audio is simulated: ▶ advances a clock and highlights the current turn. No real playback.
- Summary and Chat tabs are not built; they are out of scope for the reader.
- The meeting text is written for the mockup, continuing the lines in the current screenshots.
- Tested in Chrome at 320, 375 and 1100 px wide, with no horizontal scroll at phone width. I have not tested it with VoiceOver or TalkBack yet.
