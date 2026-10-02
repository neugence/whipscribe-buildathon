# UI Challenge 01 — Mobile Transcript Reader: Next Pass

## Design thesis

On mobile, the transcript is the primary surface. The reader should give content as much vertical space as possible while keeping important actions discoverable when needed.

## v16 changes

- Search count is real: "X of Y" is computed from the transcript as you type, matches are highlighted, and the up/down buttons step through them (Enter / Shift+Enter too). No match shows "0 of 0".
- The "More" sheet is renamed **Recording options** (the recording name sits above the title). Every item works: Reading settings, Copy transcript (copies to clipboard), Quiz me (3-question quiz from the transcript), Rename (updates the header), File details, Delete recording (confirm step; demo only).
- Duration fixed: the header said 18m 12s but the transcript and player are 1m 44s. Header, transcript count, player and File details now all use one duration value.

## v15 changes

- Create account dialog rebuilt to match the reference: Sign in / Sign up switch, Google button with logo, "OR WITH EMAIL" divider, EMAIL / PASSWORD labels, Forgot password link, lime Create account button, terms line.
- Player: play button is exactly centred with curved 5s back (↺) and forward (↻) arrows either side; time on the left, speed on the right. Time now shows 00:31 / 01:44 with the progress bar in sync instead of 00:00.
- Download sheet content now follows the reference: Include timestamps, Transcript (.txt .docx .srt .vtt), Translated subtitles, Google Drive, Summary (.txt .md), in the existing visual style.
- Tab row: Transcript, Summary and AI Chat are all curved capsules that share the row width; Search and Download sit at the right edge.

## Changes in this pass

- Audio available: the "Audio unavailable" warning is hidden and the player shrinks (84px → 67px); reader bottom padding follows the player height. Audio-unavailable state remains available for fallback testing. Triggered by a loaded `<audio>` element, or preview with `index.html?audio=1`.

- Player: back/forward 5s buttons use clear arrow icons with a "5"; tapping 1× opens a compact speed menu (1×, 1.5×, 2×, 2.5×, 3×) that closes on selection, outside tap or Esc.

- Spacing/responsive polish: one `--px` gutter variable, tighter transcript rhythm, compact search and processing status, and player height tied to `--ph`. Verified at 320px, 375px and 390px with no horizontal overflow.

- The Transcript / Summary / AI Chat row with Search and Download stays pinned. Only the filename header collapses on downward scroll.

- Search stays directly below the sticky tab row and follows it when the header reappears.

- The three-dot control opens a temporary **Recording options menu** bottom sheet. It is not a persistent control while reading.

- The Recording options menu groups secondary actions without adding extra destinations to the reader.

- Download remains a single top-right action with an export-format sheet.

- Removed the prototype's fake "Remaining states" navigation and kept fallback states conditional.

- The free-preview boundary remains inline with the transcript and opens Sign up only when reached.

- Added a compact four-speaker 320px example to verify speaker labels and readability.

- Added a persistent transcript-processing status for long lectures. It stays visible while processing is below 100%, while the available transcript remains readable, and disappears when processing reaches 100%.

- Text selection is intentionally not a separate mockup state; it remains a native transcript interaction.

## Deliberately kept

The three primary tabs, direct Download action, Reading Settings, Copy/Play-from-here selection actions, free-preview boundary, fixed bottom player, and desktop layout.

## Prototype

Open `index.html` directly in a browser. No build step or dependencies are required.

Test at 320px, 375px and 390px. Scroll to see the filename header collapse/reappear. Open Search, Download, and the Recording options menu. Open Reading settings from More. Use `index.html?audio=1` to preview the audio-available player state.

## Submission note

For the PR/Proposal, pair each changed state with the original `after/` screenshot supplied by the challenge and explain:

**Current → Problem → Next pass → Why**
