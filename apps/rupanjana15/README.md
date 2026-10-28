# Rupanjana Choudhury — Track 0

Full-stack developer in Chennai. System Engineer at Tata Consultancy Services
since September 2025. I work in React, Next.js, TypeScript, Java and Spring
Boot, with some Angular. I build small tools for problems I actually have,
and I finish them.

- GitHub: [rupanjana15](https://github.com/rupanjana15)
- LinkedIn: [rupanjanac](https://www.linkedin.com/in/rupanjanac/)
- Portfolio: [rupanjana.vercel.app](https://rupanjana.vercel.app/)

## What I have built

All three repos below are solo projects. Every commit in them is mine.

### JobTrack — [job-application-tracker](https://github.com/rupanjana15/job-application-tracker)
*Next.js, TypeScript, Gmail API (Google OAuth, read-only)*

I was losing track of my own job applications across my inbox, so I built a
tracker that reads Gmail and sorts recruiting emails into Applied, Waiting and
Rejected. Job alerts and recommendations go into a separate Opportunities
view, so they don't clutter the tracker. You can also add jobs by hand.

This is the closest thing I've built to what WhipScribe does. It takes raw
input the user never gets back to and turns it into something structured they
can act on. It also means I've already done Google OAuth and consent scopes,
which Tracks 2 and 3 need.

### DevJourney — [developer-journey](https://github.com/rupanjana15/developer-journey)
*React 19, Next.js 16 App Router, Cloudflare Workers + D1, Drizzle*

A learning tracker. It splits a technology into levels and goals, records
progress, and keeps proof-of-work links next to each goal. It also has a
streak calendar, a 450-problem DSA tracker, and day and night themes. Data
lives in D1, with a typed schema and migrations.

### Portfolio — [rupanjana.vercel.app](https://rupanjana.vercel.app/) · [source](https://github.com/rupanjana15/portfolio)
*Astro, content collections*

My portfolio, which I migrated from vanilla HTML, CSS and JS to Astro without
changing the design. Projects, events and experience are Markdown content
collections, so adding a project means adding one file.

Also: [Pack Pal](https://github.com/rupanjana15/pack-pal), an animated
packing checklist.

## Team project

### ExplainGPT — [anandrajaram21/ExplainGPT](https://github.com/anandrajaram21/ExplainGPT)
*Final-year project, built with my project partner Anand Rajaram. FastAPI and
Python backend, Next.js frontend.*

A tool for seeing inside a language model. You generate text, then inspect the
probability of each token and where the model's attention went. I worked on
the backend: the FastAPI service that loads the model and serves generation,
chat, model switching, token probabilities and attention. All the commits are
under my partner's account, which is why the history shows his name and not
mine.

## Open source

### Puter — [HeyPuter/puter#3845](https://github.com/HeyPuter/puter/pull/3845) (merged Sep 28, 2026)
Fixes [#3638](https://github.com/HeyPuter/puter/issues/3638). When someone
shared a file with you by email and you were signed in to Puter under a
different account, the link opened an empty Shared folder. My change carries
the recipient's account in the link. Puter then switches to that account if
it's already saved on the device, and otherwise shows the login screen. The
link also survives the OIDC sign-in and retry flows, so you land on the file
after logging in.

A maintainer reviewed it and added a fix of their own on top before approving
it and merging it into `main`. All 13 checks passed. It was my first time
working inside a large codebase I didn't write: I traced the share-link flow
across the GUI and the backend, and tested both the account-switch path and
the login fallback by hand.

## Work

| | |
|---|---|
| Tata Consultancy Services | System Engineer, Sep 2025 – present |
| Prodapt | Software Engineer Intern, Jul – Sep 2025 (React components) |
| Taghleef Industries, Oman | IT Intern, Sep – Nov 2023 (ETL pipelines) |

## What I plan to do here

1. **Track 1:** use whipscribe.com on my phone and laptop and file the
   problems that actually stop me, with proposals for the ones that matter.
2. **Challenge 01:** an HTML prototype of the next phone transcript reader,
   with current and mine side by side. It will include the screens the brief
   says are missing: still processing, four speakers at 320 px, and what
   happens after you select a line.
3. **Track 3:** Google Drive, bulk upload and search. I've already built
   Google OAuth and inbox processing in JobTrack, and a React web app is
   where I'm strongest.

I'll open each one as its own small pull request.

## What I'm being honest about

- I have no apps in the App Store or Play Store yet.
- I haven't won a hackathon. I coordinated one, BOLT'24, with 800+
  participants.
