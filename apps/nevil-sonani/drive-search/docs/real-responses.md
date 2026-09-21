# What the WhipScribe API actually returned

Before building on the API I sent it a recording and wrote down what came back
(21 September 2026). The app's client (`src/lib/whipscribe.ts`) is written
against these responses and the docs, and where they disagree it accepts both.
Claim tokens are removed. The recording is a 53-second, two-voice interview
I made with Windows text-to-speech; it is in no one else's account.

## Submit a file, without an API key

```
POST https://whipscribe.com/api/v1/transcribe
Idempotency-Key: nevil-track3-test-…
multipart: file=@research-interview-01.wav (audio/wav), language=en, source=api

202
{"job_id":"66195b53-…","status":"queued","tier":2,
 "estimated_seconds":52,"queue_position":1,"claim_token":"<removed>"}
```

`estimated_seconds` and `queue_position` are not in the docs.

## Poll the job

```
GET /api/v1/jobs/66195b53-…        X-Claim-Token: <removed>

t+3 s  {"status":"processing","progress":5, …}
t+6 s  {"job_id":"66195b53-…","status":"done","progress":100,"queue_position":0,
        "created_at":1789969895.0,"completed_at":1789969899.4,
        "audio_duration_seconds":52.775,"processing_seconds":3.98,"error":null,
        "tier":2,"source":"api","speech_detected":true,"speech_ratio":0.67}
```

- **Docs:** `progress` is 0.0–1.0. **Actual:** 5, then 100. The client accepts
  both (`normaliseProgress`).
- **Docs:** the status has `"locked": false`. **Actual:** no `locked` field on a
  finished, unlocked job. The client treats a missing field as not locked.

## Get the transcript

```
GET /api/v1/jobs/66195b53-…/result?format=json

200
{"language":"en","text":"Thanks for making time. …","segments":[
  {"start":0.0,"end":5.4,"text":"Thanks for making time. Can you walk me through …","words":null,"speaker":null},
  {"start":6.8,"end":16.12,"text":"Sure. After every interview I drop the recording …","words":null,"speaker":null},
  … 8 segments …],
 "speech_detected":true,"speech_ratio":0.67,"job_id":"66195b53-…",
 "duration":52.775,"word_count":123,"char_count":656}
```

- **Docs:** `diarize` and `word_timestamps` default to true, and segments carry
  `speaker` and `words`. **Actual:** both `null` on every segment. The same
  happened when I sent `diarize=true` and `word_timestamps=true` explicitly
  (job `b2988184-…`).
- **What the app does:** search results jump to the segment's `start`. The
  segments were sentence-sized here, so a jump lands within a few seconds.
  Speaker names show only when they are present.
- I asked about this in a Question issue.

`format=txt` returned `text/plain` and `format=srt` returned
`application/x-subrip`, both 200.

## Insights

```
GET /api/v1/jobs/66195b53-…/insights

200
{"insights":{"summary":"A researcher describes their current workflow …",
  "quotes":[{"speaker":"Speaker 1","text":"Most of them I never listen to again. …","start":20.5}, …],
  "topics":["interview recording storage", …],
  "speakers":[{"speaker":"Speaker 0","text":"Conducted the interview, …"}, …],
  "_meta":{…}},
 "cache_hit":false}
```

The app stores `summary`, `topics` and `quotes` and shows the first two on the
transcript page.

## Audio

```
GET /api/v1/jobs/66195b53-…/audio/url

200 {"url":"https://audio.sjc1.vultrobjects.com/…","expires_in":3600,"storage":"vultr"}
```

- **Docs:** `expires_in` 600. **Actual:** 3600.
- The app never stores this URL. Its `/api/files/{id}/audio` route fetches a
  fresh one on every request and redirects to it, so an expired link heals
  itself.

## Who am I, without a key

```
GET /api/v1/me
200 {"email":null,"tier":"guest","concrete_tier":"enterprise","retention_days":36500,"signed_in":false}
```

- **Docs:** guest audio is kept 3 days. **Actual:** `retention_days` 36500.
- I also asked about this in the Question issue.
