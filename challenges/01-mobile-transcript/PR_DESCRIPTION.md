Track: 1: UI fix — Challenge 01 (the transcript page on a phone)

## What this does

The next pass on the phone reader, as a dependency-free interactive prototype in
`challenges/01-mobile-transcript/next/`. It carries **15 deep-linkable states**
(`?state=…&width=…&view=…`), adds the states the current design lacks entirely,
and fixes two real accessibility bugs found while testing it.

Core changes (rationale in `next/README.md`):

- **Audio dock: ~35% → ~15% of the screen.** The "Keep reading" box and the
  player no longer compete for the same space; the preview limit becomes one
  line inside the dock. That frees roughly 60% more visible transcript at 320 px.
- **More menu: 9 items → 4.** Home → back, Copy → text selection, Quiz → AI
  chat, Sign in → the preview boundary. Timestamps became a header switch.
- **One bottom-sheet pattern** for search, selection, ask, export, settings and
  details — the old design used three conflicting panel styles.
- **New states the current design does not have:** processing skeleton,
  load failure (504 with retry), wrong-account recovery, deleted (with undo
  window), empty transcript (no speech, audio still playable), and offline.
- **Ask AI composer:** tapping a passage offers Ask, which opens a question
  box with the quote, its speaker and its timestamp pre-attached.
- **A11y fixes found while testing:** the "10 s" skip buttons actually skipped
  8 s (now computed from track duration); the scrubber had `role="slider"` with
  no `aria-valuenow`, no `aria-valuetext` and no keyboard support (all added);
  sheets now capture focus on open and restore it on close; Escape dismisses;
  toasts are `aria-live` regions.

Companion Track 1 issues filed from the same analysis: #ISSUE1 #ISSUE2 #ISSUE3 #ISSUE4
and proposal #PROPOSAL. *(paste the real issue numbers before opening)*

## How to try it

Open `challenges/01-mobile-transcript/next/index.html` in any browser — no
build step, no install. Every state is a toolbar pill or a URL, e.g.:

- `index.html?state=reader&width=320` — the 320 px reader
- `index.html?state=error&width=320` — load failure
- `index.html?state=ask&width=390` — the Ask composer
- `index.html?view=sbs&width=320` — side-by-side before/after
- `index.html?shot=1` — hides the workbench chrome (used for the screenshots)

Before/after evidence: `next/shots/01…15-*.png` (before: `03`, side-by-side: `04`).

## What works, what does not yet

**Verified with an automated Playwright sweep** (`scripts/sweep.py`, in this
directory): all 15 states × 320 px and 390 px — **0 console errors, 0
horizontal overflow**; Escape closes sheets; focus returns to the trigger
after close.

Works: search with live count and jump-to-timecode, simulated playback with
honest slider values, selection → Copy/Quote/Share/Ask, rename → header,
all six failure/edge states, offline banner, signup boundary.

Does not work yet (deliberate limits, full list in `next/README.md`):
- No server: search is local to the page; Ask, export, sign-in, delete and
  rename persistence are simulated with labelled demo toasts. No real audio.
- Summary and AI Chat tabs hold sample content; the simulated keyboard is a mock.
- Rename is lost on reload; no dark mode; the expanded player is not built.
- Not verified on Android hardware or with VoiceOver/TalkBack.

No invented API behaviour: nothing here calls the WhipScribe API.

## What I learned or had to look up

- The 10-second buttons skipped 8 seconds — the handlers moved the bar by 8
  *percent* of a 104-second track while labelling itself "10 seconds". I only
  caught it by computing what the label promised from the track duration.
- A `role="slider"` without `aria-valuenow` is announced as nothing by screen
  readers; `aria-valuetext` ("0:48 of 1:44") is what makes it meaningful.
- Sheets that never restore focus strand keyboard users on a hidden trigger;
  capturing focus on open and restoring on close fixed both directions.
- A stray CSS merge left `display:none` overriding the offline banner so it
  could never appear — caught on the state sweep, removed.
- Playwright's `scrollWidth - clientWidth` check per state is a cheap way to
  prove "no horizontal overflow at 320 px" instead of eyeballing screenshots.

## About me

Name: <your name> · GitHub: @<your-login> · LinkedIn: <your-link>

## Track record

Keep the labels; the leaderboard reads these lines into your profile and
checks them: your commits in each repo, whether store pages are live, and
whether the same LinkedIn is on your GitHub profile (GitHub → Settings →
Profile → Social accounts).

- LinkedIn: <your profile link>
- Shipped apps: <store links, comma-separated — or "none yet">
- Hackathon wins: <event, result, link — or "none yet">
- Team lead: <what you led, team size, outcome — or "none yet">
- Team projects: <link, and your part in it>
- Proudest work: <one link>
- Contributions elsewhere: <merged PRs / answered issues in others' repos>

## Checklist

Tick what is true of this PR:

### UI and UX

- [x] Every screen has designed empty, loading, error and done states —
  empty (`?state=empty`), loading (`loading`), error (`error`, `wrongaccount`,
  `deleted`, `offline`) and done (reader) are all designed; evidence in shots/
- [x] Works on a phone-sized screen — swept at 320/375/390 px, zero horizontal
  overflow, 44 px+ targets
- [x] Keyboard reachable, readable contrast, labelled controls — Tab reaches
  everything, Arrow keys scrub, Escape closes; ≥7:1 on reading surface;
  automated sweep checks Escape + focus restore
- [x] Copy is in the user's words, not the system's — e.g. "This transcript
  didn't load… your audio and this recording are safe", not "Error 504" alone
- [ ] The first run is designed: what a new user sees before any data — out of
  scope for the reader; the signed-out preview and signup boundary are covered
- [x] Before/after screenshots or a short recording attached — `next/shots/`
  (before: 03, after: 01/02, side-by-side: 04, every state: 05–15)

### Shipped apps

*(tick only what is true of you; leave blank if none — see Track 0 PR)*

- [ ] At least one app of mine is live in the App Store or Play Store today
- [ ] It has real users and reviews, and I have answered some
- [ ] I shipped an update that fixed a crash or a review complaint
- [ ] I handled store review, signing and release myself
- [ ] I can say what I would do differently next time

Store links: <none yet, or your links>

### Building with AI

- [x] The README explains the decisions, not just the features —
  `next/README.md` ("What changed and why")
- [x] Commits are small and named for the change — two commits: the analysis,
  then this pass
- [x] I removed or rewrote something the tool produced, and say what and why —
  e.g. rewrote the tool-generated 8-percentage-point skip handlers to true
  10-second steps; removed a stray `display:none` that disabled the offline
  banner (both in `next/README.md` → "What I learned")
- [x] No invented API behaviour: every call matches the docs or a real
  response — the prototype makes no API calls; all server interactions are
  labelled demo toasts

### Finishing

- [x] One full flow works end to end from a clean install — open the HTML:
  read → search → select → copy/ask works with zero dependencies
- [ ] Someone other than me used it and I changed something because of it —
  not yet; <say if you had someone try it>
- [x] The README says exactly what does not work yet — `next/README.md`
- [ ] Install and run instructions work on a machine that is not mine —
  static HTML, but not yet tested on a second machine

### Ownership and teamwork

*(link these to your Track 0 PR)*

- [ ] I linked repos where the commit history is mine, not a fork's
- [ ] One of them is a complex project I owned from start to finish
- [ ] I have reviewed others' pull requests or answered their issues, and can
  point to it
- [ ] I have shipped work alongside a team, and can say what I did and what
  they did
- [ ] I have won a hackathon (link the entry and the result)
- [ ] I have led a team, and can say what I decided and what I delegated

### Self-drive

- [x] I opened a pull request with my current work and repos before being
  asked — Track 0 PR #<YOUR_TRACK0_NUMBER>
- [x] I kept moving between reviews instead of waiting to be told the next
  step — filed 4 UI issues + 1 proposal from the same analysis
- [x] I chose my own scope and said why — reader-only scope; desktop IA left
  unchanged deliberately (`next/README.md`)

### Learning

- [x] I name something that was new to me and how I learned it — slider ARIA
  values & focus restore (see "What I learned")
- [x] I describe a thing that went wrong and how I found and fixed it — the
  10 s/8 s skip bug and the offline-banner override
- [x] I asked a question in an issue early instead of guessing late —
  <link if you have one; the 4 UI issues serve this too>
