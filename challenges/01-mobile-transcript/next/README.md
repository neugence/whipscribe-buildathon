# Challenge 01 — the next pass on the phone reader

Sayan Khutia · [@i-sayankh](https://github.com/i-sayankh)

I studied the 14 screens in `../after/` and used the live reader on my own
account (one 1 min 36 s recording, phone and laptop, emulated with
Playwright plus my iPhone 16). The Track 1 issues I filed on the way
(#155–#162) are linked where they come from the same screens.

**Open it:** [`index.html`](index.html) lists every screen; [`compare.html`](compare.html)
shows the current PNG next to the new screen, live, at the same width. It is
plain HTML, CSS and a little JavaScript with no build step, so it opens from the file
system or from any static server (`python -m http.server` in
`challenges/01-mobile-transcript/`, then `/next/` on a phone on the same
Wi-Fi). Screenshots of every screen at 320, 375 and 390 px (1280 for desktop)
are in [`shots/`](shots/).

## What is wrong now

Measured on the 320 × 568 screen in `01-reader-320.png` (CSS px):
header rows 118, "Keep reading" bar 55, player 95, "Audio unavailable" line
20. **About 290 of 568 px (51 %) is chrome; the transcript gets the rest.**

| Screen | What is wrong |
|---|---|
| 01–03 Reader | Two header rows for a file name and "1m 44s · EN ·" (the trailing "·" is an empty third field). Text is justified with hyphenation in a narrow column ("be- cause", wide gaps). Lines break in the middle of sentences, each with its own timestamp ("…several people have a hard" / 0:07 "stop at the top of the hour"), so a sentence is split across two rows and two timestamps. The player is fully drawn with a seek bar, three buttons, "00:00 / 00:00" and a red "Audio unavailable" line, although it cannot play. |
| 04 Scrolled | Right that the header scrolls away. But the bar and the dead player stay, still ~170 px. |
| 05 Preview boundary | The end note is good. Under it, half a screen of empty space, then the same "Keep reading" bar repeats what the note just said. |
| 06 Search | Works (count, ↑ ↓, pinned match). But it adds two rows at the top while the bottom stack stays, so at 320 the transcript shrinks to about three lines. |
| 07 Download | A full-height sheet with its own look (monospace buttons, grey section rules). "Copy" is not in it; copy lives in the More menu. |
| 08 More menu | Nine items, four of them duplicates of something on screen: Home (= back arrow), Copy transcript, Timestamps: shown (= reading settings), Sign in (= Keep reading). Delete sits in the same list as Home with no gap. Signed in it grows to 11 and the last two sit under the player (#149). |
| 09 Reading settings | A third panel style: no title, no close button, two settings. |
| 10 Selection | A dark popover that covers the next line, with Copy and Play. No way to share the quote with its timestamp, which is what people select a line for. |
| 11 Sign-up | A fourth panel style: a centred modal. |
| 12 Load failure | "Couldn't load transcript (HTTP 503)." is the system talking. Tabs, search and download stay active and lead nowhere. |
| 13 Not on this account | Title stuck on "Loading…", a default-blue "Sign in" link, active tabs. The same pattern on the live site tells people a missing recording is "still ready" (#156). |
| 14 Desktop | Works, but a finished file shows "QUEUED" in the sidebar, the 🎓 player button has no label, and the preview banner pushes the first line down 330 px. |

Missing entirely:
- **Processing.** No screen for "still transcribing". On the live site, the only sign of an upload on a short phone is under the tab bar (#159), and a stopped upload shows "Queued" for 24 minutes (#158).
- **Speakers.** Every screen is one speaker. My own recording shows the same: nothing tells you who is talking.

## What is already right, and kept

- **Three tabs (Transcript · Summary · AI Chat).** They are the three jobs people come for. (The live site now calls the second one "Overview"; I keep one name per job.)
- **Timestamps in a gutter.** They are good for scanning and a tap target to play. Kept, one per paragraph instead of one per fragment.
- **Search behaviour.** The field under the tabs, the count, ↑ ↓ and close. Kept. One part is dropped: the pinned copy of the current match above the transcript. The line itself is now marked and scrolled to the middle, so the copy only repeated it and pushed the transcript down.
- **The download sheet's content.** Formats, translated subtitles, Drive, summary. The contents are right; only the look and the missing Copy change.
- **The header scrolls away while reading.** Kept.
- **The inline "End of free preview — 48 % read" note.** It is the honest version of the upsell, so it stays and the repeating bar goes.
- **The brand.** Ink, green accent, Inter, and mono timestamps. Tokens are taken from the live reader.

## Proposed direction

The rule for this pass: **remove or merge first; add only what is missing.**

Removed or merged (9):

1. **One sheet pattern for everything.** Search results, Export, Reading options, More and Sign-up all use the same bottom sheet: handle, title, ✕, Esc and scrim to close, focus trapped, 85 % max height. Four panel styles become one.
2. **Copy + Download → one "Export" sheet.** Copy text sits first, then the four file formats. Subtitles, Drive and summary go under "More formats", closed by default.
3. **More menu: 9 → 4.** Rename, File details, Quiz me, then a gap, then Delete. Home, Copy, Timestamps and Sign in go, because each already exists on screen.
4. **Reading settings stop being a panel.** Text size, timestamps and speakers become a "View" row at the top of the More sheet.
5. **"Keep reading" bar + player → one dock of ≤ 64 px.** Mini player (play, time, speed) with a thin preview line and a "Keep reading" button in the same row. Tap to expand the full player.
6. **No audio, no player.** When audio is unavailable the dock shows one quiet line, "Audio isn't available for this file", with no dead controls.
7. **Paragraphs, not fragments.** Consecutive segments from the same speaker join into one paragraph with one timestamp. Tapping any sentence still plays from it.
8. **Left-aligned text, no hyphenation.**
9. **Error and no-access screens drop the controls that can't work.** One message in the user's words, one action.

Added (4):

1. **Processing screen.** "Still transcribing — about 2 minutes left", with a progress line. Summary and chat say they are coming. A note that you can close the page, and whether that is safe right now ("Keep this page open until the upload finishes").
2. **Speakers.** A name chip at each turn with a colour dot and a tap to rename. Shown as a four-person meeting at 320 px.
3. **After selecting a line:** a bottom action bar (not a popover over the text) with Copy with timestamp · Share quote · Play from here.
4. **Keyboard-up behaviour.** With the search keyboard open, the dock hides and the search field and results stay at the top.

Screens I will build: reader (320/375/390), processing, four speakers at 320, search, the one sheet pattern (Export shown), More (reduced), selection, preview boundary + keyboard, load failure, not on this account, desktop 1280, and a compare page with the current PNG next to each new screen.

## Answers to the eight questions

**1. What is the one thing a person on a phone came here to do, and how many taps away is it now?**
To read the transcript and find the part they need. Reading is 0 taps today, but only in half the screen. Finding a moment takes 1 tap (search). Getting the text out takes 2 taps and a scroll (Download), or 2 taps in a different place (More → Copy). In the next pass, reading gets about 90 px more, and copying or exporting is 1 tap into one sheet.

**2. The "Keep reading" bar and the player take the bottom of the screen. Is that the right trade, and what happens when the keyboard is up?**
Not as two bars. A dead player is never worth 95 px, and the bar repeats the inline preview note. The next pass uses one dock of 64 px or less, and none at all when there is nothing to play or buy. With the keyboard up the dock hides, and search stays at the top where the eye already is.

**3. The More menu has nine items. Which belong there, which on the screen, and which should not exist on a phone?**
In More: Rename, File details, Quiz me, then Delete after a gap (four items). On the screen: search and Export (with copy). Not on a phone, because they duplicate something visible: Home, Copy transcript, Timestamps, Sign in. Reading settings become a View row in the same sheet.

**4. Search, download, settings: three ways to open a panel. Should they feel like one?**
Yes: one bottom-sheet component with the same handle, title, close, focus and height rules. Sign-up and the top-up dialog should use it too; the top-up dialog is broken today (#155) partly because it is its own separate component.

**5. What does the reader look like while the transcript is still processing?**
The same reader with an honest placeholder: file name, a progress line with "about N minutes left", greyed tabs that say what will appear ("Summary is written when the transcript is ready"), and whether it is safe to close the page. See `screens/02-processing.html`.

**6. Show a meeting with four speakers at 320 px.**
Paragraphs by speaker turn. A short name chip (colour dot and name) starts each turn, with no repeated name on the lines that follow. The timestamp moves beside the chip, so the text keeps the full width at 320. Tapping a chip renames the speaker everywhere. See `screens/03-four-speakers-320.html`.

**7. Text selection on a phone: what should happen after you select a line?**
A bottom action bar replaces the dock while the selection lasts, with Copy with timestamp · Share quote (a link that opens at that second) · Play from here. It doesn't cover the text the way the popover does, and it disappears when the selection ends.

**8. The desktop page is unchanged. Should it be?**
Mostly yes. The desktop layout works, and a phone pass should not rewrite it. The shared fixes carry over: paragraphs by speaker, one Export surface (a popover on desktop), no "QUEUED" on finished files, and a label on the 🎓 button. See `screens/11-desktop-1280.html`.

## What I changed and why

| Screen | Change | Why | Removed / merged / added |
|---|---|---|---|
| Reader ([01](screens/01-reader.html)) | One header row; Export next to More | The meta line fits under the title; the tab row needs its width for three tabs and search at 320 | merged |
| Reader | Paragraphs by speaker turn, one timestamp each, left-aligned | Fragments split sentences across timestamps; justified text left gaps in a narrow column | merged, removed |
| Reader | One 64 px dock: play, time, speed, Keep reading | Two bars plus a dead player were about 170 px, a third of a small screen | merged |
| Reader | No audio: one quiet line, no controls | A player that can't play shouldn't look like one | removed |
| Processing ([02](screens/02-processing.html)) | New screen: steps, time left, what comes next, whether it's safe to close | There was none, and on the live site progress hides under the tabs (#159) | added |
| Four speakers ([03](screens/03-four-speakers-320.html)) | Name chip + colour dot per turn, text full width; tap to rename everywhere | Every current screen is one speaker; a meeting needs "who said it" at a glance | added |
| Search ([04](screens/04-search.html)) | Same control; pinned copy of the match dropped | The match is marked in place and centred | kept, removed |
| One sheet pattern ([05](screens/05-panel.html)) | Copy or download, More, sign-up and rename share one sheet: handle, title, ✕, Esc, scrim, focus trap; a centred dialog on desktop | Four panel styles for one idea; the broken top-up dialog (#155) is what a separate style costs | merged |
| Copy or download | Copy first, four formats shown, the rest under More formats | Copy was in a different menu from Download | merged |
| More ([06](screens/06-more-menu.html)) | 9 items → 4, Delete after a gap; reading settings as a View row | Four items repeated something on screen | removed, merged |
| Selection ([07](screens/07-selection.html)) | Bottom bar: Copy (with timestamp), Share quote, Play from here | The popover covered the next line and had no way to share the moment | changed |
| Preview + keyboard ([08](screens/08-keep-reading-keyboard.html), `?kbd`) | Keep reading shown once (inline note hides the dock button); dock hides with the keyboard | The offer was made twice; the keyboard and two bars left three lines of text | removed |
| Load failure ([09](screens/09-load-failure.html)) | Plain words, one action, no dead tabs | "HTTP 503" is the system's words | changed, removed |
| Not on this account ([10](screens/10-not-on-this-account.html)) | Says who can open it and what to do; deleted-recording wording | Title stuck on "Loading…"; the live site says a missing file is "still ready" (#156) | changed, removed |
| Desktop ([11](screens/11-desktop-1280.html)) | Layout kept; paragraphs, one Copy or download button, full title, labelled Study mode | A phone pass shouldn't rewrite the laptop page | kept |

Count: 9 removals or merges, 4 additions.

## What does not work yet

- **No audio and no server.** "Play" moves a highlight and a clock; the time does not advance. Downloads, sign-in, rename and delete show a short message instead of doing the thing.
- **Search is real but local**: it highlights matches in the text on the page, not across the library.
- **The keyboard is a grey block.** Real iOS keyboards change the visual viewport; I have only checked the layout in emulation and on my phone, not with `visualViewport` handling.
- **Speaker rename** changes the names on the page only; it is lost on reload.
- **The Summary and AI Chat tabs** are placeholders: this pass is about the transcript.
- **The four-speaker and processing screens** use sample text I wrote, not real diarisation output.
- **The expanded player** (tap the dock to open the full controls) is described, not built.
- **Dark mode** is not designed.
- Checked in Playwright WebKit and Chromium at 320, 375, 390 and 1280 px, and on axe (0 violations on all 15 states). Not checked on Android hardware or with VoiceOver.

## Tested on my phone

I reviewed the screens and didn't ask for a change, so there is no "changed after testing" commit. A proper pass on real devices (iPhone and Android, with VoiceOver) is still to do and is the first thing I would do next.

## How I used AI

I worked with Claude Code (Opus) for the whole of Track 1 and this pass. It drove Playwright for every observation, measured things I would have eyeballed, and wrote most of the code. I reviewed each screenshot and made the calls. Concrete examples of what I kept, changed or threw away:

- **Kept:** the token values come from `getComputedStyle` on the live reader, not from guessing. The tool also computed contrast: the live muted grey `#737c73` is 4.32:1, so the prototype uses `#5f675f` (5.85:1).
- **Rewrote:** the first build put search and Export in the tab row. In the 320 px screenshot the search icon sat on top of "AI Chat". I moved Export into the header next to More.
- **Rewrote:** the critique said search "keeps the pinned current match", but the built screen didn't have it. Rather than add it back, I dropped it on purpose and said so, because the marked line already does the job.
- **Caught:** search used `scrollIntoView`, which also scrolled the compare page around the frame. It was replaced with a scroll of the frame's own window.
- **Threw away:** a "green scrollbar" on the live reader that looked like a bug turned out to be Playwright WebKit on Windows drawing scrollbars an iPhone doesn't. Not filed.
- **Threw away:** a sentence in a Proposal claiming the top-up dialog "looks right on the marketing pages". Nobody had checked, so it came out.
- **What the tool missed and I found:** the broken top-up dialog (#155). It only appears once your credits run out, and I hit it on my own iPhone. The tool then reproduced it and found the CSS cause.
- The screens were written by a small throwaway script so the header, dock and sheets stay identical across pages. The script is not in the repo; what is committed is plain HTML.

## What was new to me

- **Mobile Chromium and WebKit handle a too-wide page differently.** Chromium widens the layout viewport, so the page quietly zooms out; WebKit keeps 320 px and lets the page slide sideways. The same `/docs` bug looks different in each.
- **`display: flex` on a list item turns a bold phrase and the text after it into two columns.** That is the whole pricing bug (#160). I also learned that `getClientRects()` on the `<strong>` returns one box inside a flex item, while a Range over its text returns one box per line; my first test missed the bug because of it.
- **Axe flags `<main role="tabpanel">`**, because the role replaces the landmark. The fix is a real `<main>` with the tab panel inside it.
