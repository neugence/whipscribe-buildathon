# Challenge 01: the mobile transcript reader, next pass

This is the reasoning behind the prototype in `next/index.html`. The short
version: the reader's problems were mostly subtraction problems, and the
current design had no answer for anything that goes wrong.

## What is wrong with the current reader

**The preview box and the player fight over the bottom of the screen.** On a
320 px phone the "Keep reading" box plus the playback controls take roughly a
third of the viewport. You get five or six lines of transcript at a time on the
screen whose whole job is reading. My version folds both into one dock that
takes about 15%, and puts the preview limit on a single line inside it.

**The More menu is a nine-item grab bag.** It has — Home, Copy, Settings,
Timestamps, Quiz, Sign in, Rename, Details, Delete — with no grouping. Half of
them don't belong in a menu at all: Home is what the back button does, Copy
belongs where you select text, Quiz belongs in AI chat, Sign in belongs at the
preview boundary. Timestamps is a display toggle, so I put it in the header as
a switch. What's left is four actual decisions.

**Three different panel patterns for the same kind of thing.** Search drops
inline under the tab bar, export is a bottom sheet, settings is a modal dialog.
I used one sheet pattern for all of them, so learning one teaches the rest.

**The reader only knows the happy path.** There is no state for a job that
failed, a recording that was deleted, a share that went to the wrong account,
or a recording with no speech in it. I designed all of those, plus processing
and offline.

**Four speakers break the layout.** The current reader assumes one speaker. I
added compact initials badges with roles, and checked the whole thing at a true
320 px content width.

## What I changed

1. **One audio dock** (~15% of the screen): scrubber, a one-line preview
   notice, transport controls, speed, search and export triggers. All targets
   are at least 44 px.
2. **A four-item More menu**: settings, timestamps switch, details and rename,
   delete at the bottom in red.
3. **One sheet pattern** for search, selection, ask, export, settings and
   details — grab handle, scrim, Escape to close, focus moves in and returns.
4. **A timestamps switch in the header**, because it's a display toggle.
5. **Speaker badges** so a four-speaker meeting stays readable at 320 px.
6. **Tapping a passage** offers Copy, Quote, Share — and Ask, which opens a
   question box with the quote, its speaker and its timestamp already
   attached.
7. **States that were missing**: processing skeleton with a job estimate, load
   failure with retry, wrong-account recovery, deleted with an undo window,
   empty transcript (no speech) with the audio still playable, and an offline
   banner that says what still works.

## What I measured

| | before | after |
|---|---|---|
| visible transcript at 320 px | 5–6 lines | 9–11 lines |
| More menu items | 9 | 4 |
| panel patterns | 3 | 1 |
| failure/edge states | none | 6 |
| smallest touch target | ~32 px | 44 px |
| text contrast on the reading surface | ~4.5:1 | 7:1 or better |

## What I kept

The three tabs (Transcript / Summary / AI Chat), the left gutter with
timestamps, the emerald brand color, and the desktop layout untouched — the
desktop reader already uses its space well and this challenge is about the
phone.

## What I did not do

No real API calls, no server, no real audio — playback moves a progress bar.
Rename doesn't survive a reload. No dark mode. Not tested on Android hardware
or with a screen reader. The full list is in `next/README.md`.

## How to look at it

Open `next/index.html` in a browser. Every state is a toolbar button or a URL,
for example `index.html?state=error&width=320`. `index.html?view=sbs&width=320`
shows before and after side by side. Screenshots are in `next/shots/`.
