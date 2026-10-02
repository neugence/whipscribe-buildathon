# Build notes

The uploaded reference server was `screenscribe_groq_server(1).zip`. It uses:

- `POST /transcribe` with multipart `file`, `diarize=true`, `word_timestamps=true`, `source=api`.
- `GET /jobs/:jobId` for status.
- `GET /jobs/:jobId/result?format=json` for transcript.
- `GET /jobs/:jobId/insights` is used by the reference server but is not required for Track 2's transcript flow.

The desktop client uses the same core WhipScribe request sequence and moves the API key into the native layer.
