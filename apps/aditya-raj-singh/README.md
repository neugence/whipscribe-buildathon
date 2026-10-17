# Aditya Raj Singh

Track 0 entry for the WhipScribe Buildathon. This folder will also hold my
Track 4 work.

B.Tech CSE at SRM IST Ghaziabad (2023–2027). Based in Ghaziabad. Email: adityars2005@gmail.com

**Plan:** Track 1 (UI findings on whipscribe.com, plus Challenge 01) next,
then Track 4.

## Track record

- LinkedIn: https://www.linkedin.com/in/aditya-raj-singh-b48006287
- Shipped apps: none in a store yet. Closest: PadosiPro, a native Android test build (APK v1.0.4 on GitHub Releases): https://github.com/Adityabit102/padosipro-assignment/releases/latest
- Hackathon wins: GFG SRMIST Hackathon, Apr 2025, 1st place (Error Detection in Code). Also national-round qualifier at Amazon HackOn 6.0 (Tech Challenge, Jun 2026) and Smart India Hackathon (Disaster Management System, Sep 2025); those are qualifications, not wins.
- Team lead: none yet
- Team projects: EcoCredit Marketplace, a team project in my 1M1B Green Internship: https://github.com/Adityabit102/EcoCredit-Marketplace (live: https://eco-credit-marketplace.vercel.app/). My part: 17 of its 19 commits. I built the platform, the scikit-learn claim validator and the Solidity credit contract, and fixed the mobile and session bugs. @panyakapoor1 created the repo and its README. Also: Amazon HackOn 6.0 (3-person team, national round) and Smart India Hackathon (5-person team, national round).
- Proudest work: https://github.com/Adityabit102/VaultStream (live: https://vault-stream-snowy.vercel.app/)
- Contributions elsewhere: none yet

## Experience

| Where | Role | When |
|---|---|---|
| HCLTech | Intern, BTIS-EDS (remote) | Jun 2026 – Jul 2026 |
| 1M1B (One Million for One Billion) | Green Intern: prototyped features for a blockchain-integrated AI credit marketplace (remote) | Sep 2025 – Oct 2025 |
| Cognifyz Technologies | Full Stack Development Intern: a web app with bcrypt auth, form validation and a role-protected admin dashboard (remote) | Apr 2025 – Jun 2025 |
| Elevate Labs | Web Development and AI/ML Intern (remote) | May 2025 – Jun 2025 |
| GFG SRMIST Student Chapter | Core Member, PR: organised 10+ technical events and coding contests | Sep 2024 – present |

## Certifications

- AWS Certified Data Engineer – Associate (2026): https://www.credly.com/badges/40187fae-3593-4e67-9f80-f8d328866667/public_url
- AWS Certified AI Practitioner (2026): https://www.credly.com/badges/a4982c13-2877-4fab-9c62-d60a4898aa7d/public_url
- NPTEL Natural Language Processing, Elite + Silver, top 5% (May 2026)

## Publication

- *Fake Reality Detection Using Multi-Modal Deep Learning Techniques*, co-author, SRM Institute of Science and Technology, Ghaziabad, 2026

## Repos

I am the only contributor in the commit history of every repo below.

| Project | Live | Code | What does not work yet |
|---|---|---|---|
| VaultStream: real-time fraud scoring (FastAPI, Next.js, Kafka, Redis, Postgres) | https://vault-stream-snowy.vercel.app/ | https://github.com/Adityabit102/VaultStream | The public demo uses mock sign-in with demo accounts, not real auth |
| Cove: CRM for D2C brands, with segments, campaigns and an AI agent layer (Next.js, Postgres, Groq) | https://xenocrm-app.vercel.app/ | https://github.com/Adityabit102/Cove | Message delivery is simulated by a stub channel service; nothing is sent to real customers |
| Kansoku: machine-fault diagnosis from vibration signals (scikit-learn, TensorFlow, FastAPI, Next.js) | https://kansoku-weld.vercel.app/ | https://github.com/Adityabit102/Kansoku | The backend is on Render's free tier, so the first request after idle is slow |
| AlgoRhythm: predicts whether a Spotify track looks like a chart hit, with SHAP explanations (XGBoost, Next.js) | https://algo-rhythm-nu.vercel.app/ | https://github.com/Adityabit102/AlgoRhythm | The frontend ships with mock prediction data; the trained model needs Spotify API keys to rebuild |
| DocMind: document Q&A with hybrid retrieval, reranking and cited answers (FastAPI, Next.js) | https://doc-mind-mu.vercel.app/ | https://github.com/Adityabit102/DocMind | It only generates answers when a backend with an LLM is running (a local Ollama instance or an OpenAI/Anthropic key), so the hosted version is mainly the interface |
| Medicare: 30-day hospital readmission risk and cost impact (XGBoost, SHAP, Next.js) | https://medicare-nine-pi.vercel.app/ | https://github.com/Adityabit102/Medicare | Test AUC is 0.648, only slightly above a logistic-regression baseline (0.642) |
| PadosiPro: native Android onboarding app with email-OTP sign-in, plus a Node/TypeScript and PostgreSQL API (take-home assignment) | APK on GitHub Releases | https://github.com/Adityabit102/padosipro-assignment | A test build, not in the Play Store |
| Second Life Commerce: returns and resale platform (FastAPI, React, AWS Bedrock) | https://second-life-commerce-puce.vercel.app/ | https://github.com/Adityabit102/Second-Life-Commerce | Payments run in mock mode only, and there is no admin panel yet |
| ChurnLens: merchant churn-risk dashboard, built in a 90-minute timed round | https://adityabit102.github.io/churnlens/ | https://github.com/Adityabit102/churnlens | Uses generated seed data and a weighted formula, not a trained model or live data |

## What I learned from the WhipScribe API docs

A job's `locked` flag is separate from its `status`: a job can be `done` and
`locked` at the same time, so a client must check both before it downloads
anything. The API also refuses calls from a browser, so the key stays on a
server, and the page plays audio from the short-lived link that
`GET /v1/jobs/{id}/audio/url` returns.
