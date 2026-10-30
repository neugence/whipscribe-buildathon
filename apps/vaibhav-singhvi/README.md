# Vaibhav Singhvi

Frontend and full-stack engineer, Udaipur, Rajasthan. I work on
[Polkassembly](https://github.com/polkassembly/polkassembly) and Townhall Gov,
which are governance platforms with real users and a real review culture. Most
of what I do day to day is TypeScript and React on products other people depend
on.

- Portfolio: https://vaibhavsinghvi.netlify.app
- LinkedIn: https://www.linkedin.com/in/vaibhav-singhvi-b31333159/
- GitHub: https://github.com/VAIBHAV-25

## Track record

Every number below is countable from the public GitHub API, and the links are
live as of 21 September 2026.

**Contributions elsewhere.** The bulk of my work is in repos I do not own.

| Repo | My commits | Repo total | Merged PRs | Notes |
|---|---|---|---|---|
| [polkassembly/polkassembly](https://github.com/polkassembly/polkassembly) | 1,479 | 10,843 | 80 | Third-highest contributor of all time. 44 stars, 39 forks. |
| [dhananjays-droid/comfortel](https://github.com/dhananjays-droid/comfortel) | 73 | 236 | 28 | About a third of the repo. |

I have also given 20 pull request reviews on polkassembly, which is the part of
the work that does not show up in a commit graph.

**Ownership, start to finish.** Projects where the history is mine, not a
fork's:

| Project | My commits / total | Live |
|---|---|---|
| [npm-spark](https://github.com/VAIBHAV-25/npm-spark) | 19 / 22 | https://npm-spark.vercel.app/ |
| [JSON-Lens](https://github.com/VAIBHAV-25/JSON-Lens) | 19 / 27 | https://json-lens-vs.vercel.app |
| [FactWise](https://github.com/VAIBHAV-25/FactWise) | 14 / 27 | https://fact-wise-woad.vercel.app |
| [DevPortal](https://github.com/VAIBHAV-25/DevPortal) | 6 / 6 | https://dev-portal-vs.vercel.app/ |

JSON-Lens is the one I would point at first. It is a local-first JSON
workspace: inspect, transform, compare and diff, entirely in the browser with no
backend, no upload and no account. I built it because every JSON tool I reached
for wanted me to paste production data into someone else's server.

DevPortal is the one that taught me the most about extensibility. Adding a new
API to the platform takes an OpenAPI spec and a registration entry, and zero
component code.

**Other things that are live:** [ResumeAI](https://analyzeresumeai.netlify.app/),
[HealthOS](https://health-os-sigma.vercel.app),
[GitMaster](https://app-gitmaster.netlify.app/),
[InteriorDesigner](https://interior-designer-ai.vercel.app/),
[QuickCollab](https://quick-collab.vercel.app),
[wealthup](https://wealthup-nine-umber.vercel.app),
[Fitpro](https://fitpro.netlify.app),
[CryptoMyWorld](https://cryptomyworld.netlify.app/),
[AI Text Summariser](https://text-sumz.netlify.app/).

**Leading a team.** I led a 4-person frontend team at Polkassembly, and a team
of 6 to 7 at Quickads. The commit and review numbers above are from the
Polkassembly side of that: reviewing other people's work is most of what the
job actually is once you are leading it.

**Shipped mobile apps:** none. Everything I have shipped is on the web. I would
rather say that than stretch the definition.

**Hackathon wins:** none I can link and prove, so I am leaving that line empty
rather than filling it in.

## What I did for this challenge

**Track 1, challenge 01.** A next pass at the transcript reader on a phone:
[`challenges/01-mobile-transcript/next/`](../../challenges/01-mobile-transcript/next/).
A working 320 px prototype beside the current design, state by state, with the
reasoning written underneath.

I measured the live product with Playwright before drawing anything, reading
computed styles rather than guessing from screenshots. The short version: at
320x640 the current reader spends about 46% of the screen on things that are not
the transcript, and the pass gets that to about 22% almost entirely by deleting.

**Track 1, bugs.** Filed as issues with measurements and reproduction steps,
listed in [`FINDINGS.md`](FINDINGS.md).

## What I am doing next

**Track 3: Google Drive, bulk upload and search.** A web app is the ground I am
strongest on, and the repo says the UI is most of the problem on that track,
which is the part I want. The order I plan to work in is the one in `AGENTS.md`:
Drive OAuth and a folder listing, one file through the API end to end, then the
bulk queue with per-file progress that survives the tab closing, then search
across transcripts, then a question across a folder if there is time.

The state I expect to be hardest is a folder with hundreds of files: what the
queue looks like part way through, what happens to the ones that failed, and how
you pick the work back up after closing the tab. I would rather design that
properly than get a happy path to a demo.

## What I did not do

- No build track code yet. Track 1 came first because it is the fastest way to
  show how I read a screen, and because I wanted to use the product properly
  before proposing to build on it.
- The prototype is a design prototype, not a build against the API. The content
  in it is sample data.
- I tested signed out. The signed-in states (rename, delete, folders, credits)
  need an account, so anything I say about them is marked as untested.
