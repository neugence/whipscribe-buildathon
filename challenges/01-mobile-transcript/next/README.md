# Challenge 01 — next pass (Deep Shingala)

Open `index.html` on a phone or desktop. Each section puts the current screen next to the redesigned one, built in HTML at real phone width (375 and 320 px).

## What changed
1. **Reading:** left-aligned text instead of justified, so no rivers or hyphen splits. Lines are grouped into whole sentences and paragraphs. The timestamp sits above each paragraph as a play button, which gives the text the full width at 320 px.
2. **Header:** one row instead of two. Search stays visible. Download moved into ⋯.
3. **Bottom:** one dock instead of two stacked bars. When a file has no audio, the play button isn't shown at all, instead of a working-looking button next to "Audio unavailable".
4. **Four speakers at 320 px:** each paragraph starts with a coloured initial and a name. Tapping a name filters the transcript to that speaker.
5. **Search:** the list scrolls to the match instead of pinning a second copy of it. The dock hides while the keyboard is up.
6. **Selection:** Copy (with the timestamp), Share at the moment, Ask AI, Play.
7. **One ⋯ sheet** replaces the 9-item menu and the download and settings sheets.
   - Removed: Home (duplicates the back button), Sign in (an account action, not a file action), and the separate Timestamps row (it's now under Reading).
8. **Preview boundary:** the last line fades out into a sign-up card that says what's left ("52%, about 54 seconds"), instead of leaving half a screen empty.
9. **New states:** a processing screen (time left, partial text, "you can close this") and a plain-words load error.

## Kept
The three tabs (with "AI Chat" renamed to "Ask"), the player at the bottom, the header scrolling away while the controls stay, the "not on this account" screen, and the desktop layout.

## Not done
This is a static mock. Nothing is wired to the real API, and only the states shown above exist.
