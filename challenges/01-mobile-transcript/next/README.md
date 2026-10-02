# UI challenge 01, next pass (07Shivam08)

Open `index.html` on a phone or a laptop. Each "current" screen is the screenshot from `../after/`; each "next" screen is live HTML at the same width.

## What I changed, and why

Measured on the current screens (2x screenshots, pixels divided by 2):

| | Current | Next |
|---|---|---|
| Transcript text on a 390 x 844 screen | 568pt (67%) | 678pt (80%) |
| Transcript text on a 320 x 550 screen | 282pt (51%) | 388pt (71%) |
| More menu items for the owner | 9 | 5, with reading settings in the same sheet |
| Taps from the end of the preview to "Continue with Google" | 2 | 1 |

1. **One bottom bar, not two.** When audio is unavailable there is no player at all. The current player shows a large Play button, "00:00 / 00:00" and a third row saying "Audio unavailable".
2. **Left-aligned text, and no line ends mid-sentence.** The current phone text is justified and hyphenated ("seg-ment"), and lines break like "...have a hard" / "stop at the top of the hour".
3. **Tabs and search stay pinned when scrolling.** Today they scroll away while the preview bar and a player that cannot play stay.
4. **The end of the preview is the sign-up moment.** A card with the desktop's full message and "Continue with Google", in place of a note with no button above 230pt of empty space.
5. **Search takes over the tab row, and the bottom bar hides with the keyboard.** About 147pt of text with a keyboard today, 507pt next.
6. **Download formats have plain names** (Word, Text, Subtitles, Web subtitles) and fit on one screen. No format removed.
7. **More menu: 9 to 5.** Home (same as back), Timestamps (same as the settings switch) and the separate Reading settings sheet go. A signed-out visitor no longer sees Rename and Delete.
8. **Selection actions replace the bottom bar** instead of covering the next line, and "Play from here" only shows when there is audio.
9. **New:** four speakers at 320, the processing state, and rewritten load-failure and not-on-this-account states.

## Kept on purpose

The three tabs, inline search with a count, bottom sheets, the timestamp gutter, tap a line to play, "Keep reading", Google first on sign-up, and the desktop page (two transcript-level fixes carry over).

## Not done

- This is a static prototype: the screens are drawn, not wired to the API.
- The live reader on 30 September 2026 has an Intelligence tab and a Share/Copy row that the challenge screens do not. I drew against the challenge screens so each pair compares like with like.
- The processing steps use job states only; I did not assume the API returns a percentage.
