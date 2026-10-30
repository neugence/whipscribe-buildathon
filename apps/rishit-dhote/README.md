# Rishit Dhote — Track 0

Backend engineer, Mumbai. B.Tech Computer Science, VIT Vellore, 2025. I build the parts of a product that have to stay up when traffic arrives: WebSocket services, data pipelines, and the load tests that show where they break. Most of what I have shipped since May 2026 is public; the repos below are the ones worth your time, with commit counts, because that is what you said you check.

## Where I have worked

- **Apeing Labs** (contract, Nov 2025 – May 2026) — a seed-stage SocialFi trading platform. I owned the real-time layer: a Rust (Tokio) WebSocket service carrying 30+ event types per room, Redis pub/sub fanout, PgBouncer pooling, and a Solana ingest pipeline over Yellowstone gRPC. Grafana K6 load tests found the bottleneck; the refactor took init-payload delivery from 89% to 99% at 1,000 concurrent users per replica. The company closed when investors pulled out and the backend code is not public, so I cannot link it. The closest public stand-in for the same skills is `llm-gateway` below; a working preview of the product's trading room runs on [my portfolio](https://rishitdhote.vercel.app).
- **Caerulean Bytechains** (internship, Apr – Nov 2025) — a 3-person startup. Built backend modules in Rust for a SaaS that lets Web2 developers compose a blockchain from a drag-and-drop feature builder.
- **National Stock Exchange** (data engineering intern, Jan – Mar 2025) — Greenplum to Cloudera migration; exploratory analysis over billions of order records.
- **Smartavya Analytica** (AI intern, Jun – Jul 2024) — LLM-to-SQL for NSE: plain English in, validated SQL out, run against the live database, on locally deployed open-source models because the data could not leave the building.

## Repos where the commit history is mine

Every commit in each of these is mine (checked against the GitHub contributors API on 22 Sep 2026).

| Repo | Commits | What it is, and the decision inside it |
|---|---|---|
| [llm-gateway](https://github.com/Ripperox/llm-gateway) | 16 | Rust/Axum streaming proxy, Anthropic-compatible. Tees every SSE chunk into a metrics pipeline (time-to-first-token, tokens/s, latency) and pushes it to a React dashboard over WebSockets. The decision: relay the bytes untouched and parse a copy, so instrumentation can never corrupt the stream. |
| [agentflow](https://github.com/Ripperox/agentflow) · [live](https://agentflow-ripperoxs-projects.vercel.app) | 21 | A mini n8n for chaining AI-agent steps, on nhost (Postgres + Hasura) with Next.js. Two independent permission layers; in the Hasura one, reads are granted by org membership and writes by role within the owning org, so a forged role header gains nothing. Design reasoning in `docs/WRITEUP.md`. |
| [agency-dashboard](https://github.com/Ripperox/agency-dashboard) · [live](https://agency-dashboard-chi-five.vercel.app) | 15 | Clients, projects and tasks for a small agency, with three roles enforced in the API rather than hidden in the UI, and a Socket.io activity feed that updates every open session without a refresh. Built for a hiring take-home; demo logins are in the README. |
| [binance-futures-bot](https://github.com/Ripperox/binance-futures-bot) · [live](https://binance-futures-bot-theta.vercel.app) | 5 | Python CLI plus a FastAPI demo that places MARKET, LIMIT, STOP-LIMIT and TWAP orders on Binance Futures testnet. SDK-free on purpose: HMAC signing, clock sync, retries and the error taxonomy are visible, testable code. 44 mocked tests, CI. |
| [cc-meter](https://github.com/Ripperox/cc-meter) | 16 | Usage observability for Claude Code: a status line with rate-limit bars and a cross-session cost report, reading Claude Code's own data with no proxy or API key. 3 stars; the only repo of mine anyone else has starred. |

## Track record

- LinkedIn: https://linkedin.com/in/rishit-dhote
- Shipped apps: none in a store. Live web apps: agentflow, agency-dashboard and the binance-futures-bot demo (links above), and https://rishitdhote.vercel.app
- Hackathon wins: none
- Team lead: none. At Apeing I owned the real-time backend end to end; I did not manage people.
- Team projects: Apeing Labs, above. I owned the real-time backend on a small engineering team; the repo is private and the company is closed, so there is nothing to link. I can walk through the architecture on a call.
- Proudest work: https://github.com/Ripperox/llm-gateway
- Contributions elsewhere: none merged yet. The Track 1 issues I file here will be my first.

## What I plan to do here

1. **Track 1.** whipscribe.com on my phone and my laptop, signed in, with my own recordings. I have read every issue already open and will file only what is not there, with a proposal where the fix is small and clear.
2. **Track 4.** A workflow for someone who records mock and real interviews and never listens back. Today they reconstruct the debrief from memory. The workflow: recording in; out come the questions that were asked with timestamps, how long each answer ran, where the filler words cluster, and a short drill list, landing in a plain-text log they already keep. I am that person, so the first user test is honest. The problem page, the drawn workflow and a prototype on real API calls will come in a separate PR once the credit lands.
3. **Not Track 2.** I am on macOS and cannot test a Windows build, and the leaderboard says the API-side work moves people up most. I would rather finish one workflow than half a recorder.
