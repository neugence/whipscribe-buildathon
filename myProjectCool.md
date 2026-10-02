**Track:** 4 — Invent a workflow 🤖

## What this does ✨

This PR submits **Starfire**, a voice-first desktop AI companion built around a simple idea:

> Instead of operating the computer through menus and applications, talk to it naturally.

Starfire can listen to the user, understand requests, choose from explicit tools, and perform supported desktop actions.

The project combines:

- 🎙️ Realtime voice interaction
- 🧠 Agent/tool decision-making
- 🖥️ Desktop control
- 📂 Files and folders
- 📋 Clipboard
- 🌐 Web search
- 🪟 Window control
- 👀 Screen understanding
- 🎭 A realtime 3D companion

## Why WhipScribe 🎧

Starfire is being extended with WhipScribe as the audio/transcript intelligence layer.

The goal is to make recorded audio something the agent can actually act on instead of just turning it into text.

The workflow is:

```text
🎙️ User / Recording
        ↓
   WhipScribe
        ↓
Transcript + timestamps
        ↓
   🧠 Starfire
        ↓
Understand → decide → act
        ↓
     Useful result