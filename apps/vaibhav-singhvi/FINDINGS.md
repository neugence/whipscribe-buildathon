# Track 1 findings

Seven problems on whipscribe.com, found on 21 September 2026 by driving the
live site with Playwright at 320 and 375 px and reading computed styles and
element rectangles rather than eyeballing screenshots. Every number here came
off the running site and can be re-measured.

Tested signed out, on Chromium at 320x640 and 375x812. I did not test the
signed-in flows, so nothing here is about the library, credits or folders.

---

## 1. The cookie banner and the chat bubble cover the Upload button

**Label:** `mobile` · **Page:** https://whipscribe.com · **Matters:** stops me finishing

At 320x640 the primary call to action is covered by two fixed overlays at once.
Measured rectangles on first load:

| Element | Rect | z-index |
|---|---|---|
| "Upload a file" button | top 532, bottom 588, left 41, right 279 | |
| `#whip-cookie-strip` | top 563, bottom 628, left 12, right 308 | 9998 |
| `button.ws-support-fab` | top 506, bottom 562, left 246, right 302 | 9000 |

The cookie strip covers the bottom 25 px of the button. The support bubble
covers its top right corner. The line underneath it ("up to 5 GB") is hidden
entirely.

**Expected:** the first thing a new visitor is asked to do is fully visible and
tappable.

**Fix:** while the cookie strip is up, add its height as bottom padding on the
hero, and hold the support bubble until the strip is dismissed. They are two
separate overlays that have never been considered together.

---

## 2. Integration cards are cut off at 320 px

**Label:** `mobile` · **Page:** https://whipscribe.com · **Matters:** small annoyance

`.d-integrations-grid` is `display: grid` with `grid-template-columns: 320px`, a
fixed track, inside a container that is 280 px wide at a 320 px viewport. It is
`overflow-x: visible`, so there is no scroll affordance either. Six cards
overflow their container by 40 px and the text is clipped: "Transcribe whole
folders fr…" on the storage card.

**Expected:** cards fit, or scroll on purpose.

**Fix:** `grid-template-columns: minmax(0, 1fr)` at narrow widths. If the
horizontal row is intended, it needs `overflow-x: auto` and scroll padding so it
reads as a carousel.

---

## 3. Two API calls 404 on every home page load

**Label:** `desktop` `mobile` · **Page:** https://whipscribe.com · **Matters:** small annoyance

Both return `404` with `{"detail":"Not Found"}`, confirmed with curl outside the
browser so it is not a session problem:

```
GET https://whipscribe.com/api/v1/public-clips?limit=12   404
GET https://whipscribe.com/api/podcasts/home-feed.json    404
```

Two console errors on the landing page for every visitor. Either the sections
they feed are dead, or they are failing silently into an empty state nobody
notices.

---

## 4. The first three tab stops on the transcript page are invisible

**Label:** `mobile` · **Page:** `/view?id=…` · **Matters:** blocks the whole flow for keyboard users

`aside.left`, the "Recent transcripts" rail, is pushed off canvas with
`transform: translateX(-280.7px)` so its right edge sits at -6 px. But it is
still `visibility: visible`, it is not `inert`, it has no `aria-hidden`, and it
contains eight focusable controls.

Walking the tab order from the top of the document at 320 px:

| Order | Control | x | On screen |
|---|---|---|---|
| 1 | "New transcript" link | -266 | no |
| 2 | "Search recent transcripts" input | -266 | no |
| 3 | "Sign in" link | -256 | no |
| 4 | "Show recent transcripts" button | 4 | yes |

A keyboard or switch user tabs through three controls they cannot see, and a
screen reader reads out a drawer that is not open, before reaching anything on
the page.

**Fix:** add `inert` to the rail while it is closed and remove it when the
drawer opens. One attribute.

---

## 5. The public demo linked from the home page has no working audio

**Label:** `mobile` `desktop` · **Page:** `/view?id=e0394eda-e7cd-43ce-a253-48c3f207d3b2` · **Matters:** stops me finishing

This is the "LINUX Unplugged #661" demo, linked from the home page. Every
transport control is `disabled`, the clock reads `00:00 / 00:00`, and
`#track-note` carries the class `is-error` with the text "File not found".

Click-to-hear-the-exact-second is the headline feature. The first demo a visitor
opens cannot do it. The same failure appears in the challenge's own reference
screenshots as "Audio unavailable", so this is not a one-off.

Worth noting alongside it: the dead player still occupies 103 px of a 640 px
screen, about a sixth, while doing nothing.

---

## 6. A three-host podcast renders with no speaker labels

**Label:** `mobile` `desktop` · **Page:** `/view?id=e0394eda-…` · **Matters:** stops me finishing

Transcript segments render as bare `.seg-text` spans with no speaker markup, so
the recording reads as one unbroken wall. The text literally says "My name is
Chris. My name is Wes. And my name is Brent." in a single block.

The data is not entirely missing: the Summary tab contains `.ins-speaker`
elements reading "Speaker 0" and "Speaker 1". So one tab knows who spoke and the
other does not show it.

Speaker labels are on the front page as a feature. On a meeting or an interview,
a transcript without them is much harder to use.

---

## 7. Justified text with hyphenation in a 243 px column

**Label:** `mobile` · **Page:** `/view?id=…` · **Matters:** small annoyance

`.seg-text` computes to `text-align: justify`, `hyphens: auto`, `font-size: 15px`
in a column measured at 243 px.

Justification needs slack to distribute, and a 243 px column has none, so it
opens rivers of white space between words and breaks words mid-syllable. The
live demo shows "chal-lenging"; the reference screenshot
`challenges/01-mobile-transcript/after/01-reader-320.png` shows "be-cause".

**Fix:** `text-align: left; hyphens: none` under the mobile breakpoint. Ragged
right reads better at this measure and costs nothing.

---

## Proposal

The reader problems (4, 5, 6, 7) are all in scope for challenge 01, so rather
than filing four separate proposals I built the next pass:
[`challenges/01-mobile-transcript/next/`](../../challenges/01-mobile-transcript/next/).
