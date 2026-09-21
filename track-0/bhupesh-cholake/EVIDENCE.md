# Evidence and verification notes

Snapshot: 21 September 2026. Repository ownership, author-name strings, account-linked commits, upstream merges and live behavior are different kinds of evidence. They are not interchangeable.

## Selected commit history

Counts below cover the entire default-branch history returned by paginated GitHub commits API at the audited head. They include merge and documentation commits, so they are not counts of independent features. Name-only attribution is explicitly weaker than an account link.

| Repository | Audited head | Commits | Account-linked to RealBhupesh | Other attribution |
| --- | --- | ---: | ---: | --- |
| [ai-fitness-coach](https://github.com/RealBhupesh/ai-fitness-coach) | [518b1743](https://github.com/RealBhupesh/ai-fitness-coach/commit/518b174315cea3065edf50675db911191990cad5) | 34 | 18 | 15 name-only; 1 other contributor commit(s) |
| [stokex-research-harness-for-your-agents](https://github.com/RealBhupesh/stokex-research-harness-for-your-agents) | [4875b074](https://github.com/RealBhupesh/stokex-research-harness-for-your-agents/commit/4875b07479eb4ed975b5589b5fece88c4b6158d0) | 13 | 13 | 0 name-only; 0 other contributor commit(s) |
| [parley](https://github.com/RealBhupesh/parley) | [9d4a829c](https://github.com/RealBhupesh/parley/commit/9d4a829cf3ff8ce5087a181f94868ea602fb5a7b) | 2 | 2 | 0 name-only; 0 other contributor commit(s) |
| [valora-agentic-bot](https://github.com/RealBhupesh/valora-agentic-bot) | [f482864c](https://github.com/RealBhupesh/valora-agentic-bot/commit/f482864c2cc5032728f426a9b9ee1dc0bc8fe8de) | 20 | 0 | 20 name-only; 0 other contributor commit(s) |
| [CMF-WATCH-AI](https://github.com/RealBhupesh/CMF-WATCH-AI) | [1fbd679b](https://github.com/RealBhupesh/CMF-WATCH-AI/commit/1fbd679bdbff2fd7c73b10662d81ffc2f7bcb58b) | 4 | 4 | 0 name-only; 0 other contributor commit(s) |
| [Bell-Agentic-Discord-Bot](https://github.com/RealBhupesh/Bell-Agentic-Discord-Bot) | [0d39a845](https://github.com/RealBhupesh/Bell-Agentic-Discord-Bot/commit/0d39a845d5e6b3b2acf929f572dd4286eb53ccb7) | 4 | 0 | 4 name-only; 0 other contributor commit(s) |

AI Fitness Coach's contributor endpoint attributes 18 commits to RealBhupesh and one to Chinmayeemore; it does not account for all unlinked author records. No claim is made that a contributor count measures how much code a person wrote. Parley and Bell have short, large-commit histories and are not presented as incremental-delivery examples.

Spa for Cars was selected by Bhupesh as his proudest work. Private implementation/history was inspected, including React booking pages and availability handling. The audit found overlapping histories across the related repositories. The live domain was not tied to a publicly inspectable deployment commit, so no claim is made that a specific private SHA is the current production revision. Public observers can inspect the website; they cannot verify the private source through this PR.

## Checks actually rerun

These ran in separate downloaded snapshots, without changing the source repositories or using live provider credentials.

| Project | Command / check | Result and limit |
| --- | --- | --- |
| STOCKEX | `python3.12 -m unittest discover -s tests` | 118 passed. Includes revision/cutoff/provenance and CLI tests. The machine's default Python 3.9 failed imports because the code uses newer union-type syntax; Python 3.12 passed unchanged. |
| CMF Watch AI | `python3 -m unittest discover -s tests` | 41 passed on Python 3.9, including local proxy HTTP tests. No watch hardware or live Groq request tested. |
| Parley | `npm ci --ignore-scripts --no-audit --no-fund`; `npm test`; `npm run build` | 21 tests passed; TypeScript and Vite build passed on Node 26. No authenticated Discord export or store installation tested. |
| Valora | `npm ci --ignore-scripts --no-audit --no-fund`; `npm test`; `npm run typecheck` | 43 tests and typecheck passed on Node 26. Package requests Node 24 and npm warned about the mismatch; this is not a Node 24 compatibility or live Eve deployment result. |
| Spa for Cars | HTTP GET and browser navigation from home to booking | HTTP 200; four-step booking entry visible. No customer booking, payment or destructive action submitted. |

**223 tests passed across four projects.** This is audit-time verification, not a historical claim about what tests ran before each original release. Other projects' test files and CI configuration were inspected where present; their suites were not rerun. Full clean-install product flows, other-person testing, accessibility and device QA remain unverified.

## Public upstream merges

Each row below was checked through the pull-request API for author `RealBhupesh`, public base repository and a non-null `merged_at`. Changes to my own forks are not counted as upstream merges. This is the verified set from the audit, not a claim that GitHub search reveals every contribution ever made.

| Upstream change | Merged (UTC) | Scope |
| --- | --- | --- |
| [makeplane/plane #9804](https://github.com/makeplane/plane/pull/9804) | 2026-09-17 | fix(web): show sub-work items on the parent in local |
| [grafana/faro-web-sdk #2257](https://github.com/grafana/faro-web-sdk/pull/2257) | 2026-09-16 | fix(core): do not drop signals added during BatchExecutor flush |
| [nestjs/schematics #2435](https://github.com/nestjs/schematics/pull/2435) | 2026-09-14 | fix(application): set explicit rootDir in generated tsconfig |
| [cloudflare/workers-sdk #15574](https://github.com/cloudflare/workers-sdk/pull/15574) | 2026-09-12 | [vite-plugin] Ignore .wrangler persistence writes in Vite's file watcher |
| [cloudflare/workers-sdk #15569](https://github.com/cloudflare/workers-sdk/pull/15569) | 2026-09-10 | [wrangler] Handle dynamic retry delays in workflows instances describe |
| [cloudflare/workers-sdk #15485](https://github.com/cloudflare/workers-sdk/pull/15485) | 2026-09-08 | fix(miniflare): reject loopback bind failures during startup |
| [getsentry/sentry-javascript #23992](https://github.com/getsentry/sentry-javascript/pull/23992) | 2026-09-03 | fix(browser)!: stop tagging DOMException.code on events |
| [Nano-Collective/nanocoder #785](https://github.com/Nano-Collective/nanocoder/pull/785) | 2026-08-11 | fix: summarize oversized git diffs |
| [Nano-Collective/nanocoder #786](https://github.com/Nano-Collective/nanocoder/pull/786) | 2026-08-09 | fix: cap oversized tool results |
| [Nano-Collective/nanocoder #782](https://github.com/Nano-Collective/nanocoder/pull/782) | 2026-08-09 | fix: preview very large files before ranged reads |
| [Nano-Collective/nanocoder #830](https://github.com/Nano-Collective/nanocoder/pull/830) | 2026-08-09 | fix: restore ACP provider discovery |
| [Nano-Collective/nanocoder #820](https://github.com/Nano-Collective/nanocoder/pull/820) | 2026-08-09 | fix: normalize Atlas Cloud GPT-5.6 model IDs |
| [Nano-Collective/nanocoder #798](https://github.com/Nano-Collective/nanocoder/pull/798) | 2026-08-09 | fix: bound diff_edit result context |
| [Nano-Collective/nanocoder #784](https://github.com/Nano-Collective/nanocoder/pull/784) | 2026-08-09 | fix: bound string_replace result context |
| [Nano-Collective/nanocoder #744](https://github.com/Nano-Collective/nanocoder/pull/744) | 2026-08-05 | fix: preserve multibyte input in alternate-screen TUI |
| [Nano-Collective/nanocoder #743](https://github.com/Nano-Collective/nanocoder/pull/743) | 2026-08-05 | docs: add local-first memory MCP recipe |
| [Nano-Collective/nanocoder #742](https://github.com/Nano-Collective/nanocoder/pull/742) | 2026-08-05 | Fix wide terminal content width |
| [Nano-Collective/organisation #85](https://github.com/Nano-Collective/organisation/pull/85) | 2026-08-03 | Add Bhupesh Cholake to contributors |
| [Nano-Collective/nanocoder #741](https://github.com/Nano-Collective/nanocoder/pull/741) | 2026-08-02 | Fix update checks, cache presence, and network error classification |
| [lokus-ai/lokus #439](https://github.com/lokus-ai/lokus/pull/439) | 2026-03-27 | Feature/txt support |
| [firstcontributions/first-contributions #114183](https://github.com/firstcontributions/first-contributions/pull/114183) | 2026-03-24 | Add Bhupesh Cholake to Contributors list |

Contributor-list and documentation changes are intentionally named as such. Open or closed-but-unmerged PRs are not promoted to accepted contributions. Old profile links to unavailable Kalshi PRs were not accepted as proof of a merge. Private PRs were excluded from this public table even when an older public profile linked them.

## Review-driven corrections

- **Cloudflare:** [the PR](https://github.com/cloudflare/workers-sdk/pull/15574) explicitly attributes AI assistance to Cursor. [Bhupesh's response](https://github.com/cloudflare/workers-sdk/pull/15574#issuecomment-5596093033) describes retaining `server.watch: null`. The final diff adds `getServerWatchConfig` and tests for disabled watching and preserving existing ignore patterns. The claim is correction of AI-assisted work, not unsupported line-by-line attribution to the model.
- **Grafana:** [the maintainer requested changes](https://github.com/grafana/faro-web-sdk/pull/2257#pullrequestreview-5129512149). [Bhupesh responded with a buffer-limit fix and regression](https://github.com/grafana/faro-web-sdk/pull/2257#discussion_r3947863718); the reviewer then approved it. Tests cover re-entrant writes and a full buffer when sending fails. That demonstrates responding to review, not reviewing another person's PR.
- **Issue participation:** [response on Cloudflare's persistence-watcher issue](https://github.com/cloudflare/workers-sdk/issues/15550#issuecomment-5589479781). The comment's PR number is mistaken; the verified watcher fix is #15574. This is evidence of answering an issue, not a claim that the comment is error-free.

## Deployment checks

The following public links were present in repository metadata/READMEs or supplied by Bhupesh. HTTP checks followed redirects on 21 September 2026. HTTP 200 does **not** establish a functioning backend, ownership, real users or production quality. Except for Spa for Cars' navigation, these were reachability checks, not browser flow tests.

| Repository / project | Linked URL | HTTP result |
| --- | --- | --- |
| RealBhupesh/aeroassist | [linked site](https://physics-engine-wheat.vercel.app) | 500 |
| RealBhupesh/Aichatbot | [linked site](https://aichatbot-cq21.vercel.app/) | 200 |
| RealBhupesh/anushka-career-navigator | [linked site](https://anushkacareernavigator.vercel.app/) | 404 |
| RealBhupesh/book-it-doctor-appointments | [linked site](https://doctor-appointment-rose-eight.vercel.app/) | 500 |
| RealBhupesh/career-ai-platform | [linked site](https://careernavig.vercel.app) | 200 |
| RealBhupesh/credit-card-celebration | [linked site](https://credit-card-two-xi.vercel.app) | 404 |
| RealBhupesh/experiment1-website | [linked site](https://experiment1-website.vercel.app) | 200 |
| RealBhupesh/focus-timer | [linked site](https://timer-fawn-zeta.vercel.app) | 200 |
| RealBhupesh/folio-whiteboard-study | [linked site](https://personalwhiteboard.vercel.app) | 404 |
| RealBhupesh/gayatri-gallery-shop | [linked site](https://hershoes.vercel.app) | 200 |
| RealBhupesh/Gift4corp | [linked site](https://gift4corp.vercel.app) | 200 |
| RealBhupesh/Gift4corpAdmin | [linked site](https://gift4corp-admin.vercel.app) | 200 |
| RealBhupesh/nestly-homes | [linked site](https://nestly-homes.vercel.app) | 200 |
| RealBhupesh/new-website-checking | [linked site](https://new-website-checking.vercel.app) | 200 |
| RealBhupesh/pollify | [linked site](https://polling-system-lovat.vercel.app) | 200 |
| RealBhupesh/Spa4Car | [linked site](https://spa4-car.vercel.app) | 200 |
| RealBhupesh/sweetcrumb-bakery | [linked site](https://timepassbak.vercel.app) | 200 |
| RealBhupesh/tempo-timer | [linked site](https://timereapp.vercel.app) | 404 |
| RealBhupesh/untilrich | [linked site](https://untilrich.vercel.app) | 200 |
| RealBhupesh/wastex-ai-management-platform | [linked site](https://wastex-ai-management-platform.vercel.app) | 200 |
| RealBhupesh/year-progress-clock | [linked site](https://percentage-clock-gxas.vercel.app) | 200 |
| Spa for Cars | [linked site](https://spaforcars.ca) | 200 |

## Scope of exclusions

- LinkedIn: the user supplied https://www.linkedin.com/in/thebhupesh/ and it is included in the introduction. The GitHub social-accounts API returned no social accounts at audit time, so profile matching is not claimed.
- No App Store/Play Store release, revenue, download, customer-count or hackathon-win claim without verifiable evidence. The user's SIH team-lead statement is included in the record, without claiming a win or result.
- No client source, credentials, private repository names, private upstream names or customer records included. Private inventory rows are opaque by design.
- No claim that a Vercel config proves deployment, a README's “production-ready” phrase proves readiness, an agent commit proves personal implementation, or a fork's history is mine.
- No WhipScribe API behavior asserted; this Track 0 PR has no integration code.
- No frontend or application UI changed by this PR. Its validation is Markdown structure, attribution, links, inventory reconciliation and secret/privacy review; UI claims await Track 1.
