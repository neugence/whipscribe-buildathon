# Achi Vyshnavi

I build AI agents that prove their answers. The LLM plans or drafts the
wording; deterministic code computes the result; a check rejects any number
that is not in the evidence. WhipScribe does the same thing for recordings:
an answer comes with the speaker, the recording and the exact second.

- GitHub: https://github.com/achi-vyshnavi28
- LinkedIn: https://www.linkedin.com/in/vyshnavi-achi/
- Email: avyshnavi282004@gmail.com
- Book a call: https://calendar.app.google/HcMHrYXkaRpuRH1VA

## What I have built

| Project | Live | What it is |
|---|---|---|
| [RootCause](https://github.com/achi-vyshnavi28/rootcause) — proudest work | [rootcause-demo.streamlit.app](https://rootcause-demo.streamlit.app) | Ask "why did orders drop in April 2018?". A LangGraph agent writes SQL that is checked for safety, breaks the change down by segment, checks for data bugs, and writes a report in which every claim cites the query behind it. It has a 50-question benchmark and a hallucination check. |
| [BatchGuard](https://github.com/achi-vyshnavi28/batchguard) | [batchguard.onrender.com](https://batchguard.onrender.com) | An electronic batch record for tablet manufacturing, built to 21 CFR Part 11 and ALCOA+. It is validated like a GxP system: URS, FRS, risk assessment, IQ/OQ/PQ with evidence, and a traceability matrix. A Postman suite passes 24/24 assertions against the live app. On Render's free tier, the first visit can take about a minute. |
| [SpecCheck](https://github.com/achi-vyshnavi28/speccheck) | [speccheck1.streamlit.app](https://speccheck1.streamlit.app) | Reviews a PRD before development starts. Deterministic rules flag untestable requirements (vague terms, missing limits, missing actor, GMP changes without audit trail), each with the question to send back to product. An LLM drafts test cases and logs an ambiguity rather than inventing an expected result. |
| [matchlab](https://github.com/achi-vyshnavi28/matchlab) | code only | Product tools for a matchmaking business, built on real data. Covers stated vs revealed preferences, a short psychometric intake, and a funnel diagnosis. |

Supporting material:
- [Figma wireframes for BatchGuard, RootCause and SpecCheck](https://www.figma.com/design/r25fpOdui1TT7TynBe7snc/Wireframes--BatchGuard--RootCause--SpecCheck?node-id=7-2)
- [Work sample: production logbook (PDF)](https://github.com/achi-vyshnavi28/speccheck/blob/main/docs/work_sample_production_logbook.pdf)

React, Node.js and TypeScript work:

| Project | What it is |
|---|---|
| [FluxChat](https://github.com/achi-vyshnavi28/FluxChat) | Real-time, no-code workflow builder for collaborative workflows (React, Next.js, TypeScript, Node.js) |
| [MuseBoard](https://github.com/achi-vyshnavi28/MuseBoard) | Turns design ideas into live app screens with AI (React, Next.js, TypeScript, Node.js) |
| [Math-agent](https://github.com/achi-vyshnavi28/Math-agent) | AI math solver: knowledge base first, LLM and web search as fallback, input/output guardrails, human feedback that updates the knowledge base; React frontend |
| [react-api-auth-app](https://github.com/achi-vyshnavi28/react-api-auth-app) | React app with API authentication, a protected dashboard and session handling |


## How I work: three things that went wrong in RootCause

**The API said 200 OK while every answer failed.** My Postman regression
suite suddenly failed 5 of its 30 checks, yet every request returned 200. The
response bodies showed "DLL load failed" on every question. I had not changed
any code, so I compared the environment. The newest releases of tiktoken,
xxhash and statsmodels shipped compiled files that Windows Application Control
blocked. I pinned the last versions that loaded and recorded the decision. The
suite went back to 13/13 requests and 30/30 checks. The tests caught the
failure only because they checked the actual answer (625 cancelled orders),
not just the status code. Since then I write checks against what the user
will see.

**I didn't trust my own benchmark.** The first run showed 80% SQL accuracy.
I went through every failure one by one instead of tweaking until the number
looked good. Some correct answers had been scored wrong ("2017-11" against
"2017-11-01", "Late" against "late"). Others failed because of a network
outage, not because of the agent. I fixed the scorer, applied the fix to all
50 questions, and re-scored the saved answers without calling the AI again, so
nothing was retried until it passed. That is how the result reached 100%, and
it is all documented.

**The AI model was retired while I was using it.** The provider retired the
Gemini model I had configured, and every call failed with no change on my
side. I now treat a hosted model like any other supplier. RootCause records
the model on every stored answer, and a new model is accepted only after the
benchmark passes again.

## Track record

No store apps, hackathon wins, team leadership or merged PRs in others'
repos yet. Everything above is solo work, and the commit history in each repo
is mine.

## Plan here

1. **Track 1:** use whipscribe.com on phone and laptop, file UI bugs, and
   propose fixes.
2. **Challenge 01:** the next pass on the phone transcript reader, as an HTML
   prototype.
3. **Track 4:** a healthcare workflow on the API. Spoken clinical or ops notes
   become structured, cited records, where every field links back to the
   second it was said.
