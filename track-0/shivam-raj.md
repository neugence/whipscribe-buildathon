# Shivam Raj

Hey, I am Shivam. I am a software developer specializing in building
mobile apps and AI native workflows. I have 3 years of experience in tech.
My first year went almost entirely into building mobile apps, then I
switched towards building AI apps, both mobile and web, as my interest in
AI kept growing. I have worked with low code platforms like n8n as well as
custom code to build reliable backends handling good volumes of jobs, and
I have a fair grip on production tooling like Docker, Redis and SQL and
how to knit them together in a real environment. Right now I work part
time at Lunastra AI and freelance on the side, with clients across
Australia, the US, Europe and India in real estate, ecommerce and banking.

Some of my work: I built HiddenVault, an ecommerce store running in
production, solo with custom code, and I worked with a team on a loan
servicing voice agent that handled calls for loans worth around
100 million USD over 9 months. Everything below has links.

- GitHub: https://github.com/07Shivam08
- LinkedIn: https://www.linkedin.com/in/shivam-raj-07a29128a/
- Email: shivamraj782000@gmail.com

## Web projects

A note before the links: client work lives in private repositories, so the
client project repos below are not the production repos. They are mirrors I
had the rights to publish, pushed so reviewers can read real code. That is
also why their public commit history is short. I can walk through any part
of them on a call.

### HiddenVault, ecommerce store (live in production, built solo)

Early stage ecommerce brand where I built the complete technical side with
custom code: themed catalogs per anime series, product variants, persistent
cart, checkout, order history, discount codes, full text search and
WhatsApp ordering.

- Live: https://hiddenvault.in/
- Repo: https://github.com/07Shivam08/hiddenvault-os
- Stack: Next.js 14, TypeScript, Supabase (PostgreSQL), Zustand, Zod, Tailwind

### HiddenVault Admin, the operations panel behind the store

Everything the store runs on: product and variant management, stock control,
order processing, customer accounts, coupons, review moderation and
storefront content controls.

- Live: https://admin.hiddenvault.in/
- Repo: https://github.com/07Shivam08/hiddenvault-admin-os
- Stack: Next.js 14 App Router, TypeScript, Supabase, Zod, Tailwind

### Loan Finance System, voice agent for loan servicing (team project)

Built with a team over 9 months: a voice agent that handles loan servicing
calls, and over that period it handled calls for loans worth around
100 million USD. The project is confidential, so I cannot share the code or
the product itself. The link below is a marketing overview of what the
system does.

- Overview: https://finance.nexicaai.com

### CameroAI, multi tenant AI assistant platform (rebuilt open version)

I built the original product for a client, so I do not own the IP and
cannot share the live link. This repo is a rebuild that shows how it works:
organizations create AI chat assistants trained on their own PDFs using
RAG with Pinecone vector search and Gemini, with org, branch and user
roles, OAuth integrations for Google, HubSpot and Jira, and Razorpay
subscriptions.

- Repo: https://github.com/07Shivam08/CameroAI-os
- Stack: Next.js, TypeScript, Prisma, PostgreSQL, LangChain, Pinecone,
  Hono, Clerk, Vercel AI SDK

### MediSync, hospital resource dashboard

Real time dashboard for hospital admins: beds and room occupancy, patient
records, bookings, medicine inventory with low stock alerts, and supply
orders, with role based access.

- Repo: https://github.com/07Shivam08/hospital-bot-os
- Demo video: https://drive.google.com/file/d/1inGW4RYpgh7_3qRfoindlu1t_6E3k0il/view?usp=sharing
- Stack: React 18, TypeScript, Vite, Supabase Realtime, Recharts

## Android apps (Kotlin, installable APKs below)

### SplitBills, shared expense tracker

Groups, expenses, who owes whom, settlement suggestions and payment
history. Supports multiple groups per user with real time sync through
Firestore, using atomic batch writes so balances never go out of sync.

- Repo: https://github.com/07Shivam08/SplitBills
- APK: https://drive.google.com/file/d/16RcW6E_T8os3kPco9l7TgCruOqEuS1mO/view?usp=drivesdk
- Stack: Kotlin, Jetpack Compose, Firebase Auth, Firestore, MVVM with Clean Architecture

### Study Smart, study planner

Subjects with goal hours, tasks with priorities and due dates, and study
session logging with automatic duration tracking. Fully offline with Room.

- Repo: https://github.com/07Shivam08/studySmart
- APK: https://drive.google.com/file/d/1v7O_17rSH2xZHmKLG39yDz3SD8MkRtWS/view?usp=drivesdk
- Stack: Kotlin 2.0, Jetpack Compose, Material 3, Room, Dagger Hilt,
  Coroutines and Flow, type safe Navigation Compose

Neither app is on the Play Store yet. Both APKs install and run on a clean
device. I am saying this plainly because the checklist asks for store links
and I would rather be exact about where things stand.

## What I want to do next in this buildathon

Track 1 is where I start: I will run WhipScribe on my Android phone and on
desktop this week and file UI bugs the way the template asks. As soon as I
am done with Track 1, I will align towards Track 4, because it suits my
forte and what I have been doing all along: spotting issues and solving
them with the right tools. Designing a workflow around the WhipScribe API
that fixes a real user's problem is exactly the kind of work I enjoy. And
if I find more time, I would love to take on the other tracks like Track 2
as a challenge as well. I am treating this buildathon like a real product
sprint so I hope I end up building something cool.
