# Track 3: Google Drive Ingestion Pipeline

Built by Ayush Kharya for WhipScribe Buildathon.

### Core Capabilities
- **Zero-Disk Streaming**: Streams audio directly from Google Drive v3 API to the WhipScribe transcription endpoint via `form-data` chunks (handles multi-GB audio without local memory or disk bottlenecks).
- **Supported Media**: Automatically filters audio/video MIME types (`mp3`, `wav`, `m4a`, `mp4`).
- **Diarization & Language**: Enables speaker diarization and auto-language detection on dispatch.

### Architecture
- **Input**: Google Drive Folder ID & OAuth2 Access Token
- **Processing**: Recursive metadata query -> streaming read pipeline
- **Target**: `https://api.whipscribe.com/v1/transcribe`
