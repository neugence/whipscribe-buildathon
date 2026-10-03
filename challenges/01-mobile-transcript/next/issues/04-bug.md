---
title: "[mobile] Download sheet content overflows horizontally at 320px"
labels: ui-bug, mobile
---

**Device and browser**
Emulated phone at 320×568 and 320×720, Chromium (Playwright), iPhone Safari 17 UA, touch enabled. Signed out, public demo recording. For contrast: 360×640, 375×667, 390×844 and 414×896 are clean.

**Page**
https://whipscribe.com/view?id=e0394eda-e7cd-43ce-a253-48c3f207d3b2

**Steps**
1. Open the demo recording on a 320 px-wide viewport.
2. Tap the download icon to open the Download sheet.
3. Look at the right edge of the sheet.
4. Swipe the sheet sideways.

**Expected**
The sheet fits the viewport. Format buttons and section rules end inside the screen, and nothing scrolls sideways.

**What happened**
The content is wider than the screen, so the right-hand side of the sheet is cut off and the sheet silently scrolls sideways by 14 px.

Measured at 320 px:

- `.dl-grid` computes `grid-template-columns: 314px` inside a **280 px** content box (`clientWidth 280`, `scrollWidth 314`) — a 34 px overhang.
- **19 elements** extend past the right edge: the `.txt` / `.docx` / `.srt` / `.vtt` buttons, `#wt-go` (*Translate → .srt*), `#wd-save` (*Save to Drive (.txt + .srt)*), and the section rules under TRANSLATED SUBTITLES, GOOGLE DRIVE and SUMMARY.
- Their right edges land at **x = 332–334 against a 320 px viewport**, so the last 12–14 px of every one of them is off screen — button borders missing, "Translate → .srt" touching the edge.
- The sheet is `overflow-x: auto` with `clientWidth 320 / scrollWidth 334`, so discovering the missing edge requires a horizontal swipe *inside* a modal — not a gesture anyone tries.

The page itself does not scroll horizontally (`documentElement.scrollWidth == innerWidth == 320`); the overflow is entirely inside the sheet.

| Viewport | Grid cols | Grid box | Elements past right | Right edge | Sideways scroll |
|---|---|---|---|---|---|
| **320×568** | `314px` | 280 → 314 | 19 | 334 | **14 px** |
| **320×720** | `314px` | 280 → 314 | 19 | 334 | **14 px** |
| 360×640 | `320px` | 320 → 320 | 0 | 340 | 0 |
| 375×667 | `335px` | 335 → 335 | 0 | 355 | 0 |
| 390×844 | `350px` | 350 → 350 | 0 | 370 | 0 |
| 414×896 | `374px` | 374 → 374 | 0 | 394 | 0 |

So the sheet is fine from 360 px up and broken only on 320 px phones (iPhone SE 1st gen and other 320 px devices).

**Screenshot or recording**
Attach `challenges/01-mobile-transcript/next/screenshots/03-download-sheet-320x568.png` (clipped buttons and rules) and `challenges/01-mobile-transcript/next/screenshots/04-download-sheet-scrolled-320x568.png` (scrolled, rules still ending past the edge). Measurements: `challenges/01-mobile-transcript/next/evidence/04-download-sheet-overflow-320/metrics.json`.

**How much it matters** (a small annoyance / stops me from finishing / blocks the whole flow)
Stops me from finishing on a 320 px phone — the buttons I need are half off the screen until I work out that the sheet itself can be dragged sideways.

**Related**
No existing report matched (searched download dialog, format buttons, .docx, .vtt, horizontal, clipped, 320). An existing 280 px overflow issue is about cards on another page, not this sheet. #181 covers vertical chrome on a 320 px screen, not horizontal overflow here.
