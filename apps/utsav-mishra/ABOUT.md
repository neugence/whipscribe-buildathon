# Utsav Mishra

Full-stack, AI, and desktop systems engineer based in India. I build resilient software end-to-end: React and TypeScript frontends, Node.js and FastAPI backends, Electron desktop apps, and Model Context Protocol (MCP) servers. I focus on building systems that actually ship to real users and hold up under real operational pressure: low-latency UI, fault-tolerant media streams, and reliable API pipelines.

- GitHub: https://github.com/bhaktofmahakal
- LinkedIn: https://www.linkedin.com/in/utsav-mishra1 (matches social link on my GitHub profile)
- Portfolio: https://www.utsavmishra.me/

## Where I Have Worked

| Organization | Role | What I Built & Shipped |
|---|---|---|
| PPR Capital | Growth & Outbound Systems Engineer | Built automated n8n pipelines ingesting and routing 1,000+ leads weekly, Python ETL scripts deduplicating and cleaning 4,000+ contact records, and configured DNS authentication (SPF, DKIM, DMARC) across 15 domain workspaces. |
| Gaprio Labs | Full-Stack AI Engineer | Built responsive web frontends and modular landing page funnels with React, Vite, and Claude Code, cutting iteration cycles from 4 days to hours. Engineered AI gateway webhooks and event listeners connecting client frontends to backend model endpoints. |
| SM Infotech Solutions & Bluestock Fintech | Frontend Engineer | Built customer-facing web applications focusing on smooth UX. Diagnosed and resolved UI rendering lag to maintain 60 FPS, optimized mobile page loads to sub-seconds, and built responsive form components with instant validation. |
| Scale AI | AI Software & Systems Evaluator | Evaluated complex software solutions, backend code, and AI model outputs against strict quality benchmarks. Conducted rigorous edge-case testing on data pipelines and input validation. |

## Public Repositories Where the Commit History is Mine

- [Zenier Recorder](https://github.com/bhaktofmahakal/Zenier): A studio-grade Screen and Webcam Recorder built with Electron 33, React 18, TypeScript 5, Tailwind CSS 3, and FFmpeg (`@ffmpeg-installer/ffmpeg`).
  - *Key Engineering Decision:* Long high-resolution sessions easily trigger out-of-memory crashes if video chunks accumulate in renderer RAM. I implemented a chunk streaming architecture using `MediaRecorder.start(1000)` that flushes 1-second media chunks directly to disk via Node.js write streams over typed IPC (`contextBridge`). If the app or machine closes mid-session, recording progress is completely preserved. Includes real-time audio volume analysis via Web Audio `AnalyserNode`.
- [offline-os](https://github.com/bhaktofmahakal/offline-os): An autonomous CRM intelligence engine and operator console built with Next.js 14, Supabase pgvector, FastAPI, and RapidFuzz. Implements bidirectional Airtable synchronization with rate-limited queueing, deduplication state resolution, and 768-dimensional semantic embeddings for member matching.
- [ops-copilot-mcp](https://github.com/bhaktofmahakal/ops-copilot-mcp): A remotely hosted TypeScript Model Context Protocol (MCP) server for automated discrepancy investigation, root-cause diagnostics, and human-in-the-loop escalation.
- [linkedin-profile-api](https://github.com/bhaktofmahakal/linkedin-profile-api): A hosted FastAPI service that extracts profile data via direct HTTP requests with API-key authentication, Swagger documentation, and automated tests.
- [Frontend-clones](https://github.com/bhaktofmahakal/Frontend-clones): A collection of 10+ modular, high-fidelity responsive web frontends demonstrating sub-second load times and accessible mobile UX.

## Open-Source Contributions in Others' Repositories

- [Remotion](https://github.com/bhaktofmahakal/remotion) (`remotion-dev/remotion`): Contributed 5+ merged PRs to the open-source React video creation framework. Fixed headless Chromium rendering edge cases where assets timed out during multi-stage rendering pipelines, and improved TypeScript error boundaries.

## What I Am Doing in This Buildathon

- **Track 0**: This introduction and track record pull request.
- **Track 1**: Auditing whipscribe.com across phone and laptop viewports. Filing concrete UI/UX findings as structured issues, specifically measuring chrome-to-content ratios and proposing an optimized mobile transcript reader for Challenge 01.
- **Track 2**: Building the desktop meeting recorder. Leveraging the chunked disk-stream architecture proven in Zenier to ensure zero audio data loss during mid-call disruptions, connecting Google Calendar for upcoming meeting detection, and integrating with the WhipScribe REST API and MCP server for automated transcription and library management.
