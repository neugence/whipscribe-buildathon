# Design notes

*Competitor notes are from general product knowledge (as of mid-2026), not hands-on testing in this build session. Verify before quoting.*

## What I looked at
- **Otter / Fireflies / Fathom:** a bot joins the call. Strong summaries and sharing, but attendees see a bot, some orgs block it, and nothing is recorded if the bot is denied.
- **Granola / Krisp / Jamie:** bot-free local capture of system audio + mic. Much better social fit. Weak spots I'd attack: what happens if the app dies mid-call, offline behaviour, and opaque failures after upload.
- **MacWhisper and similar:** great local transcription, but you manage files yourself; no calendar context.
- **OS/meeting-app built-ins (Zoom, Teams):** tied to one platform, host permissions, cloud-only.

## What I chose to do differently
1. **Bot-free, native capture, crash-proof by construction.** Audio hits disk every 100 ms; the library record exists before the first word; recovery is automatic. The promise is "you never lose a meeting".
2. **Honest states.** Every recording shows exactly where it is (on this PC → uploading → transcribing → ready / needs attention) with the real error and a retry. No fake demo data: the original MVP showed made-up meetings labelled "from your connected calendar".
3. **Offline-first.** Recording never depends on the network; uploads queue and resume (idempotency key prevents duplicate jobs).
4. **Audio-synced transcript you can edit.** Click a line to hear it; rename a speaker once.
5. **Privacy posture.** Read-only calendar scope, PKCE in the system browser (no embedded login), API key never crosses into the webview, always-visible consent reminder while recording.

## Why this stack
Tauri 2: small installer, Rust for real-time audio and secrets, web UI for speed. WebView2 cannot capture system audio (`getDisplayMedia` is unreliable there), so capture had to go native: cpal over WASAPI, including loopback.

## Where I stopped
Calendar → recording → transcript → library are all implemented; polish is partial (shortcut Ctrl+Shift+R, accessibility labels, reduced-motion). Not done: macOS system audio, Opus encoding, native desktop notifications before meetings, Outlook/ICS calendars, MCP-backed folders (see README).
