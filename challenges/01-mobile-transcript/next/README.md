# Challenge 01, next pass

A proposal for the transcript reader on a phone. Open `index.html` in a browser,
or serve the folder and open it on a phone:

```
cd challenges/01-mobile-transcript
python3 -m http.server 8000
# then http://<your-machine-ip>:8000/next/ on the phone
```

The page puts the current design (the PNGs in `../after/`) beside a working
320 px prototype, with a tab per state. The full write-up of what changed and
why is on the page itself, under the panels.

## How I worked

I measured the live product before drawing anything, using Playwright against
whipscribe.com at 320 and 375 px and reading computed styles rather than
guessing from the screenshots. Everything claimed below is a number I took off
the running site or the reference PNGs.

## What the measurements said

At 320x640 on the transcript page:

| | |
|---|---|
| Title row | 56 px |
| Meta row (duration, language, cost) | 40 px |
| Tab row | 48 px |
| "Keep reading" preview bar | 45 px |
| Player | 103 px |
| **Chrome total** | **292 px of 640, about 46%** |

The timestamp gutter takes a further 45 px of the 320 px width, about 14%,
permanently.

Other things the live site showed:

- `.seg-text` is set `text-align: justify` with `hyphens: auto` at 15 px in a
  243 px column. That is what produces "be-cause" in `01-reader-320.png` and
  "chal-lenging" on the live demo.
- The public demo linked from the home page
  (`/view?id=e0394eda-e7cd-43ce-a253-48c3f207d3b2`) is a three-host podcast and
  renders with no speaker labels at all, while its Summary tab knows about
  "Speaker 0" and "Speaker 1". Its player is fully disabled with the note
  "File not found".
- `05-preview-boundary.png` carries the end-of-preview message twice: once
  inline where the words stop, and once in the bar pinned above the player.

## The changes

1. Speech-recognition segments are grouped into speaker turns. One header line
   per turn carries the name and the start time, which replaces the permanent
   gutter and supplies the speaker attribution that is missing today. Sentences
   stop breaking across rows.
2. The player becomes one 52 px row, and is not rendered at all when there is no
   audio. A quiet line takes its place.
3. The pinned preview bar is deleted. The inline note at the boundary grows into
   the card with the action on it.
4. The nine-item menu becomes six items in three groups, with reading settings
   inline instead of behind a second panel. Download joins it.
5. Search becomes a mode that owns the screen, rather than a strip that fights
   the keyboard.
6. Body text goes left-aligned, 17 px, 1.62 leading, no hyphenation.
7. A "still processing" screen, which does not exist today.

Chrome goes from about 46% of the screen to about 22%.

## What I kept

WhipScribe's palette and type, read off the site (`--wt-green #54801e`,
`--wt-text #202a25`, `--wt-tint #eef5df`, Inter). The three tabs. Click a line
to play. Timestamps on by default. The text-selection bar, which I think is
already right. The desktop layout, with two exceptions argued on the page.

## What this is not

- A build against the API. The content is sample data.
- Playable. The player shows the shape and the height, which is the argument.
- A design for Summary or Ask. This pass is the transcript reader.
- Tested signed in. Rename, delete and folders need an account, so the actions
  sheet shows them without a live flow behind them.
