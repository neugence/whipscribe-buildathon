# Bhupesh Cholake | Track 0

I have an engineering background in Artificial Intelligence & Data Science and build with Python, TypeScript/JavaScript, React/Next.js, APIs and databases. My work ranges from a live automotive-services website to agent tools, an offline evidence store and contributions to existing developer tools.

**Start here:** [Spa for Cars](https://spaforcars.ca), my proudest project; [STOCKEX](https://github.com/RealBhupesh/stokex-research-harness-for-your-agents), for evidence and validation; and [Grafana Faro #2257](https://github.com/grafana/faro-web-sdk/pull/2257), for how I handle a correctness bug and maintainer feedback.

GitHub/contact: [RealBhupesh](https://github.com/RealBhupesh). A matching LinkedIn could not be verified from my GitHub profile, so I am not supplying a guessed URL.

[Complete GitHub project inventory](PROJECT_INVENTORY.md) · [Evidence, history and verification](EVIDENCE.md) · [Honest checklist](CHECKLIST.md)

## Selected work

### Spa for Cars: the project I am proudest of

**Problem:** help an automotive-detailing customer understand services and get into the booking flow. **What I built:** the customer-facing React website and booking experience, with related content and service-management work in private repositories. Those repositories contain successive versions of the same business project, not several independent products.

**Technical depth:** a service/vehicle-driven booking interface, availability handling and supporting API integration. Private history shows iteration on booking UX and deployment boundaries; source and customer details stay private. **Why it matters:** it puts product decisions in front of customers on a real business domain.

**Evidence:** [live site](https://spaforcars.ca) and [booking page](https://www.spaforcars.ca/booking). On 21 September 2026 the site returned HTTP 200 and browser inspection confirmed that the home-page booking action opens the four-step flow. No booking was submitted, and payment, conversion, revenue and customer-usage claims have not been verified. The [public Spa4Car repository](https://github.com/RealBhupesh/Spa4Car) is an early static concept, **not the current production source**.

### AI Fitness Coach: full-stack work with a testable movement pipeline

**Problem:** turn movement and session data into coaching feedback that can be inspected. **What I built:** substantial backend and subsequent coaching/review-lab work within a project with another contributor; I do not claim the entire starting application as solely mine.

**Technical depth:** Next.js/TypeScript, Drizzle/PostgreSQL, server-side request guards, Groq/OpenAI provider selection, pose replay and structured review evidence. **Why it matters:** the code separates measurements, feedback and evaluation instead of relying on a convincing AI response alone.

**Evidence:** [repository](https://github.com/RealBhupesh/ai-fitness-coach), [my account-linked history](https://github.com/RealBhupesh/ai-fitness-coach/commits/main/?author=RealBhupesh), [replay](https://github.com/RealBhupesh/ai-fitness-coach/blob/518b174315cea3065edf50675db911191990cad5/src/lib/pose/replay.ts), [review evidence](https://github.com/RealBhupesh/ai-fitness-coach/blob/518b174315cea3065edf50675db911191990cad5/src/lib/review-lab/evidence.ts). Full default-branch history has 34 commits: 18 linked to my account, 15 further commits bearing my name without an account link, and one linked to another contributor. Demo-mode writes can be stubbed; real-device camera QA remains necessary. No medical-grade accuracy or production usage is claimed.

### STOCKEX: evidence before generated conclusions

**Problem:** research can accidentally use future information or turn uncertain inputs into confident conclusions. **What I built:** the research harness, deterministic validators and offline SQLite evidence foundation. **Technical depth:** availability cutoffs, revision chains, typed records, provenance, integrity checks and a CLI. The design explicitly keeps data collection outside the deterministic store.

**Why it matters:** an agent workflow needs enforceable evidence boundaries, not just longer prompts. **Evidence:** [repository](https://github.com/RealBhupesh/stokex-research-harness-for-your-agents), [evidence-store change](https://github.com/RealBhupesh/stokex-research-harness-for-your-agents/commit/c9f9e354), [query regressions](https://github.com/RealBhupesh/stokex-research-harness-for-your-agents/blob/4875b07479eb4ed975b5589b5fece88c4b6158d0/tests/test_store_queries.py), [design decisions](https://github.com/RealBhupesh/stokex-research-harness-for-your-agents/blob/4875b07479eb4ed975b5589b5fece88c4b6158d0/references/design-decisions.md). All 13 default-branch commits are account-linked. The audit reran **118 passing tests on Python 3.12**. This is an offline research tool, not a live feed, trading system or proven investment strategy.

### Parley: a bounded conversation-export workflow

**Problem:** move a Discord conversation into a usable file without manually reconstructing speakers and messages. **What I built:** a Chromium Manifest V3 extension with a React popup, TypeScript export pipeline and Markdown/CSV/HTML/PDF output.

**Technical depth:** paginated message retrieval, rate-limit handling, range selection, formatting tests and an explicit handoff to ChatGPT that does not press Send. **Why it matters:** one clear workflow with privacy and scope boundaries. **Evidence:** [repository](https://github.com/RealBhupesh/parley), [bridge](https://github.com/RealBhupesh/parley/blob/9d4a829cf3ff8ce5087a181f94868ea602fb5a7b/src/injected/discord-bridge.ts), [format tests](https://github.com/RealBhupesh/parley/blob/9d4a829cf3ff8ce5087a181f94868ea602fb5a7b/src/lib/format/format.test.ts). Both commits are linked to me, but this is a bulk implementation plus documentation, not a long iterative history. The audit passed **21 tests and the production build**. Unpacked installation only; no store release or authenticated Discord export was verified.

### Valora: explicit limits on agent actions

**Problem:** community automation needs a boundary between a suggestion and a consequential action. **What I built:** an Eve/Groq bot prototype with typed tools, specialist agents, local persistence and approval decisions.

**Technical depth:** invalid confidence fails closed; severe actions retain approval requirements; the Discord action path checks a server-side authorization value. **Why it matters:** control logic and tests constrain autonomy. **Evidence:** [repository](https://github.com/RealBhupesh/valora-agentic-bot), [autonomy decisions](https://github.com/RealBhupesh/valora-agentic-bot/blob/f482864c2cc5032728f426a9b9ee1dc0bc8fe8de/agent/lib/autonomy.ts), [corrective commit](https://github.com/RealBhupesh/valora-agentic-bot/commit/a062bc07), [approval tests](https://github.com/RealBhupesh/valora-agentic-bot/blob/f482864c2cc5032728f426a9b9ee1dc0bc8fe8de/tests/discordActionApproval.test.ts). The 20 commits bear my name but are not linked to my GitHub account. This is weaker identity evidence than the projects above. Local JSON storage is not a production durability claim; live Discord actions and model evaluations were not exercised.

### CMF Watch AI: investigate the constraint before building around it

**Problem:** find out whether a watch can support useful AI-assisted quick replies. **What I built:** the feasibility plan, capture tools, standalone Python reply engine and key-holding proxy. **Technical depth:** sanitized short replies, provider timeout/fallback handling, explicit `from_ai` provenance and proxy tests.

**Why it matters:** [the plan was resequenced](https://github.com/RealBhupesh/CMF-WATCH-AI/commit/18c2e258) around the uncertain phone/watch return channel before committing to Android work. **Evidence:** [repository](https://github.com/RealBhupesh/CMF-WATCH-AI), [engine](https://github.com/RealBhupesh/CMF-WATCH-AI/blob/1fbd679bdbff2fd7c73b10662d81ffc2f7bcb58b/engine/generate.py), [tests](https://github.com/RealBhupesh/CMF-WATCH-AI/tree/1fbd679bdbff2fd7c73b10662d81ffc2f7bcb58b/tests). Four account-linked commits; **41 tests passed** during this audit. This is a tested software component and an unresolved hardware investigation, not a working watch app.

### Bell Agentic Discord Bot: broader integration, with visible limits

**Problem:** consolidate community moderation and contextual assistance. **What I built:** a Python bot integrating moderation, bounded conversation context, AI providers, music and persisted virtual-economy operations. **Technical depth:** the code includes atomic persistence helpers, configurable provider fallbacks and command-level permissions.

**Why it matters:** it shows integration breadth, but breadth alone is not proof of reliability. **Evidence:** [repository and setup](https://github.com/RealBhupesh/Bell-Agentic-Discord-Bot), [implementation](https://github.com/RealBhupesh/Bell-Agentic-Discord-Bot/blob/0d39a845d5e6b3b2acf929f572dd4286eb53ccb7/bot.py), [history](https://github.com/RealBhupesh/Bell-Agentic-Discord-Bot/commits/main/). Four large commits bear my name and include Cursor attribution; none is account-linked. Live bot operation, adoption and end-to-end behavior were not verified in this audit.

## Contributions and working with maintainers

These are contributions to other people's projects, not products I built from scratch:

| Project | My change | Evidence |
| --- | --- | --- |
| Grafana Faro | Preserve signals added during a flush; address the reviewer's failed-send/buffer-limit edge case with a regression test. | [Merged #2257](https://github.com/grafana/faro-web-sdk/pull/2257), [review response](https://github.com/grafana/faro-web-sdk/pull/2257#discussion_r3947863718) |
| Cloudflare Workers SDK | Stop persistence writes triggering Vite updates, while preserving disabled watching and existing ignore patterns. | [Merged #15574](https://github.com/cloudflare/workers-sdk/pull/15574), [correction after review](https://github.com/cloudflare/workers-sdk/pull/15574#issuecomment-5596093033) |
| NanoCoder | Bound edit-result context instead of returning whole files; preserve enough context to verify changes. | [Merged #798](https://github.com/Nano-Collective/nanocoder/pull/798) |
| Sentry JavaScript | Stop attaching obsolete DOMException numeric codes to events. | [Merged #23992](https://github.com/getsentry/sentry-javascript/pull/23992) |
| NestJS schematics | Set an explicit `rootDir` in generated TypeScript configuration. | [Merged #2435](https://github.com/nestjs/schematics/pull/2435) |
| Plane | Restore sub-work-item display on the parent in the affected local view. | [Merged #9804](https://github.com/makeplane/plane/pull/9804) |

Maintainers reviewed and merged these changes; that is evidence of collaboration, not a claim that I led their teams. More verified merged work is listed in [EVIDENCE.md](EVIDENCE.md).

## How I use AI, and what I learned from corrections

I use AI heavily for implementation and investigation. I remain responsible for requirements, architecture, product decisions, debugging, validation, accepting or rejecting generated code, and deciding what is ready to ship. This submission was also prepared with AI assistance and checked against repository evidence.

A concrete example is the [Cursor-attributed Cloudflare PR](https://github.com/cloudflare/workers-sdk/pull/15574): the first approach needed correction because `server.watch: null` means watching is disabled. I changed the helper to preserve that state and included tests. This is documented correction of AI-assisted work; I am not claiming to know which individual lines came from a model.

In [Faro's review](https://github.com/grafana/faro-web-sdk/pull/2257#discussion_r3947863718), fixing dropped re-entrant signals exposed a second requirement: retry behavior must still respect the buffer limit after a failed send. I added the full-buffer regression and responded to the maintainer. That is the engineering lesson I can point to: a fix must preserve the surrounding invariants, not only stop the reported symptom. I cannot reconstruct when I first learned a technology from commits alone.

## What I am not claiming

No verified App Store/Play Store release, user count, revenue, hackathon win, leadership role or independent user-testing result is included. Passing unit tests is not proof that a deployed product works end to end. HTTP 200 only establishes a reachable page. Imported histories, agent-authored commits and inaccessible private work are not inflated into sole authorship.

AeroAssist, HospitalIQ and CareerAI were inspected rather than omitted: AeroAssist's configured AI provider remains a mock and its linked site returned HTTP 500; HospitalIQ has a single bulk commit and is not presented as clinically validated; CareerAI has agent-authored work and an HTTP-200 landing page, but no verified complete live flow. Their code and limitations belong in the [inventory](PROJECT_INVENTORY.md), not in unsupported production claims.

## Next: Track 1 first

I am moving immediately into required Track 1. I will use WhipScribe on phone and desktop, with my own account and recording, and inspect upload, processing, transcript reading, the library, credits and pricing. I will select a small number of high-impact problems, file reproducible issues with evidence, and prepare a serious mobile transcript-reader proposal with current/proposed states, including processing, four speakers at 320 px, and player/keyboard overlap.

Track 4 is the optional direction I want to evaluate afterward, once the product walkthrough reveals a specific workflow worth building. I am not promising completion of Tracks 2, 3 or 4 here. Neugence contacted me about the challenge after I emailed about the role; I did **not** open Track 0 before being asked.
