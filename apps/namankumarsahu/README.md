# WhipScribe Recorder (Track 2)

Windows-first desktop meeting recorder. Tauri 2 (Rust) + React/TypeScript.
Calendar → native recording → WhipScribe transcript with speakers → library.

## Run it

```powershell
npm install
# .env already holds WHIPSCRIBE_API_KEY for local dev (git-ignored). Or paste the key in Settings.
npm run tauri:dev
npm run tauri:build      # NSIS + MSI installers
```
Prereqs: Node 20+, Rust stable, WebView2, MSVC Build Tools.

## What works, and how

| Area | Implementation |
|---|---|
| Recording | Native Rust (`audio.rs`): mic via WASAPI capture + **system audio via WASAPI loopback** (cpal), mixed on a wall-clock into 16 kHz mono WAV. No browser pickers, no screen-share prompt. |
| Crash safety | WAV is appended every 100 ms and fsynced every 5 s. The library record exists from the first second with `status: recording`; on next launch anything still in that state is repaired (`repair_wav` rebuilds the header from file length) and offered as "recovered". Closing the window mid-call finalizes cleanly. |
| Transcription | `POST /transcribe` (diarize + word timestamps, `Idempotency-Key`) → poll `GET /jobs/{id}` → `GET /jobs/{id}/result?format=json`. Retries with backoff on network/429/5xx. Jobs resume polling after a restart. Offline recordings upload automatically when back online. |
| Transcript | Speaker-coloured turns, click-to-seek audio sync, follow-along highlight, in-transcript search, rename a speaker once and it applies everywhere, copy. |
| Calendar | Google Calendar (read-only) via system-browser OAuth + PKCE + loopback redirect. Shows upcoming timed events with Meet/Zoom/Teams links; "starting soon" banner; one-click record with the meeting title. |
| Library | Folders, rename, delete (optionally also from WhipScribe), full-text search across titles and transcripts, import existing jobs from your WhipScribe account. |
| Keys | Stored in the app data dir and only ever used in Rust; the UI never receives the key back. |

## Honest limits

- **Not compiled on Windows by me.** The audio module, local store, transcript normalizer and UI were compiled/unit-tested/type-checked in a Linux sandbox; `gcal.rs`, `whip.rs`, `lib.rs` and the Tauri shell were reviewed but not compiled, and nothing has been run against a real sound card, Google, or the live WhipScribe API (network was blocked for those hosts). Expect to fix a typo or two on first `cargo build`.
- **Library "via MCP":** the hosted server (`https://whipscribe.com/mcp`, 37 tools incl. library) is the intended path for folders/search/rename/delete, but I could not reach it from my sandbox, so I did not guess tool names or its auth. Today folders/rename/search are local and delete uses `DELETE /api/v1/jobs/{id}`. Next step: a small Rust MCP client (`initialize` → `tools/list` → `tools/call`) that discovers the real tool names at runtime.
- Transcript JSON shape isn't documented publicly; `src/transcript.ts` accepts segments / utterances / word-level speakers / plain text. Per the docs it is `{text, language, segments:[{start,end,speaker:"SPEAKER_00",text,words[]}]}`, which `src/transcript.ts` handles; it also handles `speech_detected:false` and `locked` jobs.
- macOS: mic works; system audio needs ScreenCaptureKit (not implemented). Windows only for system audio.
- WAV is uncompressed (~115 MB/hour). Next step: encode to Opus/FLAC on stop.
- Rotate the API key that was shared in chat.

See `docs/DESIGN.md` for the competitive analysis and design choices.
