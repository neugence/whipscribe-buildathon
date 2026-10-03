---
title: "Proposal: Reading settings sheet that clears the audio player (before/after)"
labels: proposal
---

**The problem** (link the issue if there is one)

Issue #201: *[mobile] Reading settings — Text size control is obscured by the persistent audio player and cannot be activated at the affected mobile sizes.*

On every phone width I measured (320, 360, 375, 390, 414), the Reading settings sheet is anchored to the bottom of the viewport while the audio player is fixed over the last 103 px of it. The sheet is not scrollable, so its second row — **Text size** — sits underneath the player and cannot be tapped. At 320×568: sheet y 371–568, player y 465–568, control y 475–503, and `elementFromPoint` over the control returns `audio-bar`.

The sheet therefore looks like it works (first row is visible and toggles fine) while half of it is dead. It is also the only place in the reader where text size can be changed, so on a phone the setting is simply gone.

**What I would change**

Make the sheet a bottom sheet that sits **above** the persistent player instead of behind it, and let it scroll.

1. **Anchor it to the player, not the viewport.** `bottom: <player height>` (the player already reports a fixed 103 px, so one shared CSS variable covers it) with `max-height: calc(100dvh - <header> - <player>)`.
2. **Let it scroll.** `overflow-y: auto` on the sheet body, so today's two rows and any future rows are all reachable without changing the sheet's visual style.
3. **Keep the grab handle, make it do something.** Tap or swipe the handle to close, so the sheet has an obvious dismissal that does not depend on finding empty space behind it.
4. **Give it dialog semantics while it is open** — `role="dialog"`, `aria-modal="true"`, labelled by its "Reading view" title — so it is consistent with the Download and File details sheets once those are fixed too.

Nothing else moves: the transcript, the header, the player and the sheet's own typography stay as they are.

**Why this and not something bigger**

- It is a positioning and overflow change in one component, not a new screen, and there is no backend work.
- The player is genuinely persistent and useful — hiding it behind a sheet would trade one bug for another, so the sheet should yield to it.
- It fixes all six widths I measured in one rule, including landscape, instead of special-casing 320 px.
- It matches the pattern the reader already uses elsewhere (the More menu is already a bottom sheet), so nothing new has to be learned.

Alternatives I rejected: raising the sheet above the player (covers the transport controls while someone is listening) and moving Reading settings to a full-screen page (a heavier navigation step for two toggles and a size picker).

**Mockup, sketch, or before/after**

Before — 320×568, sheet behind the player (the dotted row is unreachable):

```
┌──────────────────────────────┐
│ ☰   LINUX Unplugged #661 …  ⋯│  header
│      64m 18s · ≈ $0.51 · EN  │
│ ┌──────────────────────────┐ │
│ │      Copy transcript     │ │
│ └──────────────────────────┘ │
│ Intelligence Transcript Chat │
│──────────────────────────────│
│ 0:11  friends, and welcome   │
│       back to your weekly    │
│ 0:32  Linux talk show…       │
│       ┌────────────────────┐ │
│       │ READING VIEW       │ │  y=371
│       │ Show timestamps ☑  │ │  visible
│ ══════╪════════════════════╪═╪═  y=465 player top
│ ░░░░░ │ Text size  Small ▾ │░░│  y=475 UNDER the player
│ ░░░░░ └────────────────────┘░░│
│ ▬▬▬▬▬▬▬▬▬▬▬ 00:00 / 00:00 ░░░░│
│      ⏮   ▶   ⏭    1×       ░░│
└──────────────────────────────┘
     ↑ tap here hits audio-bar,
       the sheet closes, nothing changes
```

After — sheet stacked above the player, both rows reachable:

```
┌──────────────────────────────┐
│ ☰   LINUX Unplugged #661 …  ⋯│
│      64m 18s · ≈ $0.51 · EN  │
│ ┌──────────────────────────┐ │
│ │      Copy transcript     │ │
│ └──────────────────────────┘ │
│ Intelligence Transcript Chat │
│──────────────────────────────│
│ 0:11  friends, and welcome   │
│       back to your weekly    │
│       ┌────────────────────┐ │
│       │ ▬ grab handle      │ │  sheet ends at
│       │ READING VIEW       │ │  player top
│       │ Show timestamps ☑  │ │  y=465
│       │ Text size  Small ▾ │ │  y≈505, tappable
│       └────────────────────┘ │
│══════════════════════════════│  y=465 player top
│ ▬▬▬▬▬▬▬▬▬▬▬ 00:00 / 00:00   │
│      ⏮   ▶   ⏭    1×        │
└──────────────────────────────┘
   rows scroll if a third one is added
```

Same numbers as the measurements: player top 465 at 320×568, so the sheet body runs 371 → 465 (94 px) and scrolls; today it runs 371 → 568 with everything below 465 unusable.

**What it would take to build** (rough, honest)

Front-end only, one component:

- move the sheet's `bottom` from `0` to the player height and cap `max-height` accordingly (a CSS variable already shared with the player is enough);
- add `overflow-y: auto` plus a little bottom padding so the last row clears the handle;
- wire the handle to the existing dismissal path (click-outside and Escape already work);
- add the ARIA attributes listed above;
- re-test at 320 / 360 / 375 / 390 / 414 and in landscape, where the sheet's height budget is tightest.

Roughly half a day including the viewport pass. No API, no new screens, no design system changes — the sheet keeps the styling it has today, it just stops hiding behind the player.
