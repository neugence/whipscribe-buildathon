**Track** 0 — my current work and repos

**What this does**

Introduces me and my existing work, with links, so you can check it before I
write any code for you. No product changes in this PR.

I am a third-year CS undergrad at Galgotias College of Engineering and
Technology (CGPA 8.26). Most of what I have built is backend and full-stack
web work in Python (FastAPI) and JavaScript/TypeScript (React, Next.js). The
one project I would ask you to actually open is ReturnSentinel AI — an
agentic return-abuse system I built solo over eight days for the Razorpay AI
Buildathon 2026.

**How to try it**

- ReturnSentinel AI — https://github.com/aryatasrivastava/return_sentinel_ai
  Runs locally: FastAPI backend on `:8000`, Next.js frontend on `:3000`. The
  README has the full setup and a walkthrough of the demo flow — open
  `/storefront`, add the same product in two sizes to trigger size-bracketing,
  and the return policy is assessed before checkout. `ARCHITECTURE.md` has the
  design decisions and ML evaluation.
  It is not deployed. There is no hosted demo yet.

**What works, what does not yet**

Works, end to end on a local install:

- XGBoost risk model scoring an order on cart, customer, product and
  behavioural signals, with SHAP attribution per order.
- A LangGraph pipeline with a Risk Agent, a confidence router that runs at
  most two extra investigation rounds, a Policy Agent, and a deterministic
  policy engine that validates the agent's recommendation against what the
  merchant has approved. The agent can recommend; it cannot act outside the
  approved set.
- Graduated, non-blocking outcomes — standard return, exchange-first, store
  credit, restocking fee — rather than allow/deny.
- `POST /api/assess-order` exposing the whole pipeline, and a merchant
  dashboard, orders feed, risk deep-dive, policy config and demo storefront.
- Async audit-trail narration via Gemini.

Does not work yet, honestly:

- No deployment and no hosted demo. Local only.
- No automated tests.
- Razorpay payment integration was in the plan and did not get built.
- Nobody outside me has run it, so nothing in it has been changed because a
  real user hit a problem.

Two other repos, described accurately rather than generously:

- Callendric — https://github.com/aryatasrivastava/Callendric — a meeting
  scheduler in Next.js with Clerk auth. Landing page, auth and a
  schedule-a-meeting section are built. I paused it in December 2025; it is
  started, not finished, and its README is still the framework default.
- Resume Analyzer — https://github.com/aryatasrivastava/Resume-Analyzer — a
  browser-based ATS resume analyzer on Puter.js, React Router and Tailwind.
  Multi-step flow: upload → analysis → recommendations. Small, and not
  deployed.

**What I learned or had to look up**

Agentic systems were new to me when I started ReturnSentinel. I had not used
LangGraph before and had to learn state, routing and tool selection from the
docs while building. The decision I am most glad I made was not trusting the
agent with the final action: the Policy Agent proposes, and a plain
deterministic policy engine checks that proposal against the merchant's
approved policies before anything is applied. An LLM choosing a customer's
return terms unsupervised is not something I would ship.

When I was designing the Policy Agent, the AI's default suggestion was to have an LLM read the risk data and pick the return policy directly. I threw that out and rewrote it as deterministic rule-based scoring, because a system that decides whether a customer gets a refund or store credit needs to produce the same output for the same input every time — reproducibility mattered more than flexibility, and I could unit-test the rules in a way I couldn't test an LLM's judgment.

The bug I spent longest on was double-counting in the risk distribution on
the merchant dashboard, along with a gap in the top risk factors — fixed in
`Fix risk_distribution double-counting and resolve top_risk_factors gap`.
I caught it by checking the arithmetic instead of trusting the output: the dashboard reported 62 orders analysed, but the LOW/MEDIUM/HIGH risk counts summed to 73. Tracing it back, the aggregation query wasn't filtering to the latest prediction per order, so orders that had been re-assessed during testing were being counted multiple times.

I have used Microsoft Learn's Azure and cloud-computing modules. I have not
sat a certification and I have not run anything in production on a cloud
platform yet.

**About me** (name, how to reach you)

Aryata Srivastava — srivastavaaryata2610@gmail.com — Greater Noida, Uttar
Pradesh, India. Third-year B.Tech CSE, Galgotias College of Engineering and
Technology.

## Track record

- LinkedIn: https://www.linkedin.com/in/aryata-srivastava-61994637a/
- Shipped apps: none. Nothing of mine is live in the App Store or Play Store, and I have no deployed app with real users yet.
- Hackathon wins: none. I built ReturnSentinel AI for the Razorpay AI Buildathon 2026 (https://github.com/aryatasrivastava/return_sentinel_ai) — a submission, not a win.
- Team lead: I have not led an engineering team. I coordinate activities for my college technical club and was part of the organising team for a college hackathon, handling coordination and participant engagement — organising an event, not leading a build.
- Team projects: my repos are solo work.
- Proudest work: https://github.com/aryatasrivastava/return_sentinel_ai
- Contributions elsewhere: none yet. I have not had a pull request merged in someone else's repository and have not reviewed others' PRs or answered their issues. This is the clearest gap in my track record and I know it.

Also true, though it is not a hackathon result: I won my college's group
discussion competition.

**Tracks I plan to do:** Track 1 next (filing UI bugs and proposals on whipscribe.com), followed by Track 3 — Google Drive Bulk Upload and Search, because it lets me build a practical workflow for bulk transcription and transcript search while focusing on a clean, robust web UI and progress state management.

## Checklist

Tick what is true of this PR:

### UI and UX

- [ ] Every screen has designed empty, loading, error and done states
- [ ] Works on a phone-sized screen, or has a clear reason not to
- [ ] Keyboard reachable, readable contrast, labelled controls
- [ ] Copy is in the user's words, not the system's
- [ ] The first run is designed: what a new user sees before any data
- [ ] Before/after screenshots or a short recording attached

Nothing ticked here on purpose: this PR ships no UI. My Track 1 entry is where
you should judge my eye.

### Shipped apps

- [ ] At least one app of mine is live in the App Store or Play Store today
- [ ] It has real users and reviews, and I have answered some
- [ ] I shipped an update that fixed a crash or a review complaint
- [ ] I handled store review, signing and release myself
- [ ] I can say what I would do differently next time

Store links: none.

### Building with AI

- [x] The README explains the decisions, not just the features
- [x] Commits are small and named for the change
- [x] I removed or rewrote something the tool produced, and say what and why
- [x] No invented API behaviour: every call matches the docs or a real response

### Finishing

- [x] One full flow works end to end from a clean install
- [ ] Someone other than me used it and I changed something because of it
- [ ] The README says exactly what does not work yet
- [ ] Install and run instructions work on a machine that is not mine

The flow runs locally from a clean setup. Nobody else has run it, and I have
not verified the setup steps on another machine — so I have left those
unticked rather than assume.

### Ownership and teamwork

- [x] I linked repos where the commit history is mine, not a fork's
- [x] One of them is a complex project I owned from start to finish
- [ ] I have reviewed others' pull requests or answered their issues, and can point to it
- [ ] I have shipped work alongside a team, and can say what I did and what they did
- [ ] I have won a hackathon (link the entry and the result)
- [ ] I have led a team, and can say what I decided and what I delegated

ReturnSentinel is 15 commits, all mine, from an empty repo to a working
pipeline — the model, the agents, the router, the policy engine and the
frontend. Collaboration is where I am thin: my work so far has been solo, and
that is something joining a small team would change immediately.

### Self-drive

- [x] I opened a pull request with my current work and repos before being asked
- [ ] I kept moving between reviews instead of waiting to be told the next step
- [x] I chose my own scope and said why

### Learning

- [x] I name something that was new to me and how I learned it
- [x] I describe a thing that went wrong and how I found and fixed it
- [ ] I asked a question in an issue early instead of guessing late