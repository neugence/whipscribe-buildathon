# Track 0 — Gaurav

**Track:** 0 — current work and repos  
**Planned tracks:** Track 1 + Track 4

## What this does

This is my Track 0 entry: a snapshot of the products I have shipped, the systems I have built, and the projects I have owned end-to-end.

I am a software engineer working across AI systems, backend infrastructure, web, Android, and Kotlin Multiplatform. I particularly enjoy ambiguous problems where I have to understand an unfamiliar system, decide what should actually be built, and take it all the way to something another person can use.

### COASTOK

A production Kotlin Multiplatform product used by thousands of users.

I work across the application and supporting systems: product features, backend services, media infrastructure, analytics, notifications, reliability, and releases across Android, iOS, web, and desktop.

The product has **15K+ registered users**.

**Live Android app:**  
https://play.google.com/store/apps/details?id=com.hk.coastok

### FlyBoxLab

An interactive sandbox built around a simulated fruit-fly connectome with **166,700 neurons and ~25.6 million synapses**.

I spent roughly a week understanding the underlying connectome and simulation, then turned that work into an interactive product where users can place stimuli and objects into a world, observe behaviour, manipulate neural populations and synapses, and inspect neural activity.

**Live:**  
https://flyboxlab.vercel.app/

**Source:**  
https://github.com/gauravvvvvvvvvv/flybox

### Alter

An open-source AI runtime with provider abstraction, asynchronous inference, session/context management, tool execution, vector memory, persistent storage, fallback routing, and REST/GraphQL interfaces.

**Source:**  
https://github.com/gauravvvvvvvvvv/alter

### Puzzlyy

A real-time multiplayer jigsaw application built with Next.js, TypeScript, Supabase Realtime, PostgreSQL, and WebRTC.

The original multiplayer architecture relied on an in-memory/SSE model that did not fit Vercel's runtime well, so I replaced it with Supabase Realtime and redesigned the synchronization flow around infrastructure that would actually survive production deployment.

**Live:**  
https://puzzlyy.vercel.app/

**Source:**  
https://github.com/gauravvvvvvvvvv/puzzlyy

### KMP Calendar

A reusable Kotlin Multiplatform calendar component supporting day, week, month, and year views, configurable week starts and year ranges, theming, today indicators, and optional analytics/chart integration.

The library is published on Maven Central and can be consumed directly as:

`io.github.gauravvvvvvvvvv:kmp-calendar:1.0.1`

**Maven Central:**  
https://central.sonatype.com/artifact/io.github.gauravvvvvvvvvv/kmp-calendar

**Source:**  
https://github.com/gauravvvvvvvvvv/kmp-calendar

---

## How to try it

COASTOK can be installed directly from Google Play:

https://play.google.com/store/apps/details?id=com.hk.coastok

FlyBoxLab can be opened directly in the browser:

https://flyboxlab.vercel.app/

Puzzlyy can also be tried in the browser:

https://puzzlyy.vercel.app/

KMP Calendar can be added directly from Maven Central:

```kotlin
implementation("io.github.gauravvvvvvvvvv:kmp-calendar:1.0.1")
```

https://central.sonatype.com/artifact/io.github.gauravvvvvvvvvv/kmp-calendar

The open-source projects above have their source linked for implementation details and commit history.

---

## What works, what does not yet

These projects are at different stages.

COASTOK is a production application with real users and regular releases.

FlyBoxLab is an experimental product built around a scientific simulation. The sandbox, environmental interactions, neural manipulation, and inspection workflows work, but it is deliberately presented as an exploratory interface rather than as a biological claim about real fly behaviour.

Alter is an ongoing open-source runtime. Its provider/runtime abstractions and core infrastructure work, while some planned integrations and capabilities remain under development.

Puzzlyy has functional single-player and real-time multiplayer flows. Its architecture changed significantly while building it because the first synchronization approach was not appropriate for the deployment environment.

I prefer documenting those boundaries rather than making a prototype sound more complete than it is.

---

## What I learned or had to look up

The best recent example is FlyBoxLab.

Before working on it, I had never worked deeply with a fruit-fly connectome. I spent roughly a week understanding the neural graph, simulation model, readouts, and available abstractions before building the product layer.

The difficult part turned out not to be exposing more functionality. It was deciding what **not** to expose.

A scientific system can surface huge amounts of internal state, but putting all of it in front of a user makes the product worse. I separated the experience into interaction and lab-style inspection layers and exposed only the controls that made an experiment understandable.

I use AI coding tools heavily in my normal workflow. They are particularly useful for exploration, implementation speed, and unfamiliar APIs, but I do not treat generated code as the finished product. I review architecture and behaviour, replace approaches that do not fit the system, and remove generated complexity when a simpler implementation is better.

Puzzlyy is a straightforward example: the initial real-time architecture was technically plausible but wrong for the deployment environment, so I replaced it rather than trying to preserve generated work.

---

## About me

**Gaurav**

Website:  
https://gvrv.cc

GitHub:  
https://github.com/gauravvvvvvvvvv

LinkedIn:  
https://www.linkedin.com/in/gauravnarlawar/

---

## Track record

- LinkedIn: https://www.linkedin.com/in/gauravnarlawar/
- Shipped apps: https://play.google.com/store/apps/details?id=com.hk.coastok
- Hackathon wins: None listed
- Team lead: Led engineering/product work on projects where I owned technical decisions, implementation scope, and delivery
- Team projects: COASTOK — production Kotlin Multiplatform product; worked across application features, backend/media infrastructure, analytics, notifications, and releases
- Proudest work: https://flyboxlab.vercel.app/ — source: https://github.com/gauravvvvvvvvvv/flybox
- Contributions elsewhere: None listed

---

## Checklist

### UI and UX

- [ ] Every screen has designed empty, loading, error and done states
- [ ] Works on a phone-sized screen, or has a clear reason not to
- [ ] Keyboard reachable, readable contrast, labelled controls
- [ ] Copy is in the user's words, not the system's
- [ ] The first run is designed: what a new user sees before any data
- [ ] Before/after screenshots or a short recording attached

Track 0 only. UI/UX work will be covered in Track 1.

### Shipped apps

- [x] At least one app of mine is live in the App Store or Play Store today
- [x] It has real users and reviews, and I have answered some
- [x] I shipped an update that fixed a crash or a review complaint
- [x] I handled store review, signing and release myself
- [x] I can say what I would do differently next time

Store links:

https://play.google.com/store/apps/details?id=com.hk.coastok

### Building with AI

- [x] The README explains the decisions, not just the features
- [x] Commits are small and named for the change
- [x] I removed or rewrote something the tool produced, and say what and why
- [x] No invented API behaviour: every call matches the docs or a real response

### Finishing

- [x] One full flow works end to end from a clean install
- [x] Someone other than me used it and I changed something because of it
- [x] The README says exactly what does not work yet
- [x] Install and run instructions work on a machine that is not mine

### Ownership and teamwork

- [x] I linked repos where the commit history is mine, not a fork's
- [x] One of them is a complex project I owned from start to finish
- [x] I have reviewed others' pull requests or answered their issues, and can point to it
- [x] I have shipped work alongside a team, and can say what I did and what they did
- [ ] I have won a hackathon
- [x] I have led a team, and can say what I decided and what I delegated

### Self-drive

- [x] I opened a pull request with my current work and repos before being asked
- [x] I kept moving between reviews instead of waiting to be told the next step
- [x] I chose my own scope and said why

### Learning

- [x] I name something that was new to me and how I learned it
- [x] I describe a thing that went wrong and how I found and fixed it
- [x] I asked a question in an issue early instead of guessing late
