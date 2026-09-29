# Track 1 — UI bug issues drafted from the Challenge 01 analysis

File these on GitHub (Issues → New → UI bug) before or together with the next-pass PR.
Each follows the repo's `ui-bug` template verbatim.

---

## Issue 1 — [mobile] "Keep reading" box + player stack eat a third of a 320 px screen

**Device and browser:** iPhone SE-class (320 px), Safari; verified in Chrome device emulation at 320 px

**Page:** whipscribe.com transcript reader, phone layout

**Steps**
1. Open any transcript on a 320 px-wide phone.
2. Try to read the transcript without scrolling.

**Expected:** the reading surface is the majority of the screen.

**What happened:** the "Keep reading" preview box stacked on top of the playback controls consumes ~35–40% of the viewport; only 5–6 lines of transcript are visible at a time.

**Screenshot or recording:** `challenges/01-mobile-transcript/next/shots/03-before-320.png` vs `01-reader-320.png` in the next-pass PR.

**How much it matters:** stops me from finishing — reading is the whole point of this screen.

---

## Issue 2 — [mobile] More menu has 9 items; actions live far from their context

**Device and browser:** any phone

**Page:** transcript reader → ⋮ More

**Steps**
1. Open the More menu on the transcript page.
2. Look for Copy while reading a passage.

**Expected:** the menu holds this screen's decisions; Copy appears where text is selected.

**What happened:** nine items (Home, Copy, Settings, Timestamps, Quiz, Sign in, Rename, Details, Delete) with no grouping. Copy — a selection action — is buried in the menu rather than offered on selection; Home duplicates system back; Sign in belongs at the preview boundary.

**Screenshot or recording:** `06-menu-4items.png` in the next-pass PR shows the proposed 4-item menu.

**How much it matters:** a small annoyance, but every secondary action costs extra taps and scanning.

---

## Issue 3 — [mobile] three different panel styles for search, export and settings

**Device and browser:** any phone

**Page:** transcript reader

**Steps**
1. Open search (drops inline under the tab bar).
2. Open export (bottom sheet).
3. Open settings (separate modal dialog).

**Expected:** one consistent pattern for secondary panels.

**What happened:** three conflicting presentation styles for the same class of interaction; each has different dismissal behavior and visual weight.

**Screenshot or recording:** the unified sheet family in the next-pass PR (`05`, `06`, `14`).

**How much it matters:** a small annoyance, but it makes the app feel unfinished.

---

## Issue 4 — [mobile] no designed state for a failed, deleted, wrong-account or silent recording

**Device and browser:** any phone

**Page:** transcript reader

**Steps**
1. Open a transcript link for a recording that failed to process / was deleted / was shared with another account / contains no speech.

**Expected:** each failure has a designed state with a next action.

**What happened:** there are no such states in the current design; the reader only handles the happy path.

**Screenshot or recording:** proposed states in `09-load-failure.png`, `10-wrong-account.png`, `11-deleted.png`, `12-empty-transcript.png`.

**How much it matters:** blocks the whole flow when it happens — the user has no way forward.

---

## Proposal — Ask AI about selected text (one tap from any passage)

Companion proposal to the issues above (per the `proposal` template): selecting any transcript passage should offer **Ask**, which opens a composer with the quote, its speaker and its timestamp pre-attached, so the question is grounded in evidence at the exact second. Implemented in the next-pass prototype as the Ask composer (`07-selection-ask.png`).
