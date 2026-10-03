---
title: "[mobile] Download and File details dialogs are missing proper dialog semantics for assistive technologies"
labels: ui-bug, mobile, accessibility
---

**Device and browser**
Emulated iPhone-class phone in Chromium (Playwright), iPhone Safari 17 UA, DSF 2, at 320×568. Same markup confirmed at 1280×900. Signed out, public demo recording.

**Page**
https://whipscribe.com/view?id=e0394eda-e7cd-43ce-a253-48c3f207d3b2

**Steps**
1. Open the demo recording.
2. Open the download icon (or **… → File details**) so the sheet is on screen.
3. Inspect the rendered accessibility tree of the open sheet (Chrome DevTools → Elements → Accessibility, or `element.getAttribute(...)` in the console).

**Expected**
A sheet that takes over the screen announces itself as a modal dialog: `role="dialog"`, `aria-modal="true"`, an accessible name from its heading, and the page behind it removed from the accessibility tree while the sheet is open. The heading is associated with the dialog so the screen reader reads it as the dialog's title when focus lands.

**What happened**
Neither sheet exposes any of that in the rendered accessibility tree. Both containers are bare `<div class="wt-dialog-bd">`:

| | Download sheet | File details sheet |
|---|---|---|
| Container | `#wt-dl-dialog` | `#wt-details-dialog` |
| `role` | `null` | `null` |
| `aria-modal` | `null` | `null` |
| `aria-label` / `aria-labelledby` | `null` / `null` | `null` / `null` |
| Heading | `Download` | `<h2 id="wt-details-h">File details</h2>` (not referenced by anything) |

**Impact** (what follows from the tree above, not from a screen-reader session)

Reading the rendered accessibility tree for the open sheet:

- the sheet contributes no `dialog` role and no accessible name, so a consumer of the tree (VoiceOver, TalkBack, or DevTools' own accessibility view) has nothing identifying it as a modal dialog;
- with no `aria-modal`, nothing tells an assistive-technology consumer that the content behind the sheet is inert;
- the transcript, header and player remain in the accessibility tree while the sheet is open, so background content and sheet content appear as one flat stream;
- the `<h2 id="wt-details-h">File details</h2>` heading is not referenced by any `aria-labelledby`/`aria-describedby`, so it is not surfaced as the sheet's title.

Keyboard behaviour is already correct and should not be regressed: focus moves into the sheet on open (`INPUT#wt-dl-ts`), eight consecutive Tab presses stay inside it, and Escape closes it and returns focus to `#wt-m-export`.

**Screenshot or recording**
Attach `challenges/01-mobile-transcript/next/screenshots/03-download-sheet-320x568.png` and `challenges/01-mobile-transcript/next/screenshots/05-file-details-320x568.png`. Measurements: `challenges/01-mobile-transcript/next/evidence/03-dialogs-missing-dialog-semantics/metrics.json`.

**How much it matters** (a small annoyance / stops me from finishing / blocks the whole flow)
Accessibility — it does not block a sighted user. Whether it actually degrades VoiceOver/TalkBack use needs a screen-reader session to confirm; the defect found here is that the dialog semantics are absent from the rendered tree.

**Note**
**No screen-reader session was run.** This report is based on the rendered accessibility tree and the missing dialog semantics (`role`, `aria-modal`, accessible name, heading association), measured in Chromium at 320×568 and 1280×900 — not on a VoiceOver or TalkBack recording. Related but different: #18 (contrast and heading order), #62 (invisible tab stops), #102 (Resources menu tab order).
