# Haniya Iqbal: Track 0

**Track** 0: my current work and repos. I plan to do Track 1 next, then Track 4.

**What this does**

Introduces me and my work. I'm a backend engineer at Ninja Studio (since Oct 2024, intern first, full-time since Apr 2025). I build production systems for real clients across IoT, fintech, HR software and AI products, mostly with NestJS, PostgreSQL, AWS and LLMs. I've also built an MCP server, which is a big part of why this challenge caught my eye.

**A note on my repos**

All my professional work lives in private client repos under my work GitHub account, so I can't link the code here. Instead, below are the live products and exactly what I built in each. My personal GitHub (this account) mostly has older learning projects; the work I do for this challenge will be my main public code.

**What I built**

- **Moana, IoT device platform** ([Play Store](https://play.google.com/store/apps/details?id=com.moanatech.app)). I built backend for the admin dashboard and mobile app: role-based access, 2FA, device PIN reset, telemetry APIs, and firmware updates sent as small patches over the air. I designed certificate-based device login with mutual TLS, moved device logs onto a queue (BullMQ + Redis) with compressed storage on S3, built the real-time MQTT layer and push notifications, and deployed it on AWS with CI/CD and monitoring. This is the project I've worked on most: over 300 commits and around 150 pull request reviews for teammates.
- **[KollabHR](https://www.kollabhr.com/), HR software.** I built an MCP server so AI assistants can use HR features safely, with OAuth 2.0 login and strict permission checks per company branch. I cut the size of what the chatbot sends about its tools by ~60% by ranking ~94 tools and sending only the relevant ones. I also built an employee change-request flow with per-section permissions, approvals and audit logs.
- **[Land4Rent](https://land4rent.com/), land auction platform.** Stripe payments for auctions: holding a card, then charging or releasing it, automatic tax and yearly billing. I also built the renter onboarding steps (lease questionnaire and KYC).
- **[GoBlinkly](https://goblinkly.com/), AI/SEO platform.** An AI content pipeline: keyword and search research, drafting, linking, quality review, then publishing to Webflow.
- **[GrantGPT](https://grantgpt.org/), grant applications.** An AWS Bedrock assistant that drafts grant answers and fills application fields from an organization's own data.
- **[TenantPay](https://www.tenantpay.com/), payments** (internship). I cut payment processing time from 40 minutes to 5 by switching to batch processing.

**What works, what does not yet**

This PR is my introduction only. Track 1 and Track 4 work will come as separate PRs and issues.

**What I learned or had to look up**

I haven't used WhipScribe's API or MCP server yet; that's what I'll learn first.

**About me** Haniya Iqbal, reach me on [LinkedIn](https://linkedin.com/in/haniya-iqbal-0b399b269)
## Track record

- LinkedIn: https://linkedin.com/in/haniya-iqbal-0b399b269
- Shipped apps: https://play.google.com/store/apps/details?id=com.moanatech.app (I built the backend, not the mobile app itself)
- Hackathon wins: none yet
- Team lead: none yet
- Team projects: https://www.kollabhr.com/ (MCP server, change-request workflow), https://land4rent.com/ (Stripe auction payments, renter onboarding), https://goblinkly.com/ (AI content pipeline), https://grantgpt.org/ (Bedrock grant assistant), https://www.tenantpay.com/ (batch payment processing)
- Proudest work: https://play.google.com/store/apps/details?id=com.moanatech.app (Moana IoT backend)
- Contributions elsewhere: around 150 pull request reviews for teammates on the Moana backend (private repo)

