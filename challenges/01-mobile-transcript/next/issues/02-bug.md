---
title: "[mobile] Reading settings — Text size control is obscured by the persistent audio player and cannot be activated at the affected mobile sizes"
labels: ui-bug, mobile, accessibility
---

**Device and browser**
Emulated iPhone-class phone in Chromium (Playwright), iPhone Safari 17 UA, touch enabled, deviceScaleFactor 2. Viewports tested: 320×568, 320×720, 360×640, 375×667, 390×844, 414×896 — broken at every one. Signed out, on the public demo recording. (Emulation, not a physical device.)

**Page**
https://whipscribe.com/view?id=e0394eda-e7cd-43ce-a253-48c3f207d3b2

**Steps**
1. Open the demo recording at a phone viewport.
2. Tap **…** → **Reading settings**.
3. Try to tap **Text size**.

**Expected**
Both rows of the sheet (Show timestamps, Text size) are visible and tappable, or the sheet scrolls until they are.

**What happened**
The sheet `#wt-view-pop` is anchored to the bottom of the viewport and is **not scrollable** (`scrollHeight == clientHeight == 195`), while `#audio-bar` is fixed over the last 103 px of it.

At 320×568: sheet = y 371, height 197, bottom 568. Player = y 465–568. The **Text size** label sits at y 477 and its control `#wt-opt-size` at y 475–503 — entirely underneath the player.

Hit-testing every sampled point on the control returns `audio-bar`, `seek-fwd-15` or `playback-rate`, never the control itself. A real touch at (270, 489) dismisses the sheet instead of focusing the control, and the size value does not change.

The geometry is the same at every width tested — the sheet always ends at the viewport bottom and the player always covers the last 103 px, so the second row is always under it:

| Viewport | Sheet bottom | Player top | Text size control | Result |
|---|---|---|---|---|
| 320×568 | 568 | 465 | 475–503 | covered, hit → `audio-bar` |
| 320×720 | 720 | 617 | 627–655 | covered, hit → `audio-bar` |
| 360×640 | 640 | 537 | 547–575 | covered, hit → `audio-bar` |
| 375×667 | 667 | 564 | 574–602 | covered, hit → `audio-bar` |
| 390×844 | 844 | 741 | 751–779 | covered, hit → `audio-bar` |
| 414×896 | 896 | 793 | 820–848 | covered, hit → `playback-rate` |

The first row (Show timestamps) stays visible, so the sheet looks functional — only the row underneath is dead.

**Screenshot or recording**
Attach `challenges/01-mobile-transcript/next/screenshots/02-reading-settings-under-player-320x568.png` (annotated: sheet y/height, control y, player top, hit-test result). Measurements: `challenges/01-mobile-transcript/next/evidence/02-reading-settings-text-size-under-player/metrics.json`.

**How much it matters** (a small annoyance / stops me from finishing / blocks the whole flow)
Stops me from finishing — on a phone there is no way to change the text size at all, and the control is invisible rather than merely awkward.

**Related**
Closest existing reports are #149 (More-menu items hidden behind the player) and #92 (landscape menu clipping). This is a different component: the Reading settings sheet itself.
