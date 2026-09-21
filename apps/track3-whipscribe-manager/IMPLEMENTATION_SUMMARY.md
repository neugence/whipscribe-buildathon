# WhipScribe Google Drive Transcript Manager - Implementation Summary

## Overview
This is a Track 3 implementation for the WhipScribe Buildathon: a web application that connects to Google Drive, allows users to browse folders and select audio/video files, submits selected files for transcription through the WhipScribe API, tracks transcription jobs, displays completed transcripts, and provides transcript search with timestamp navigation.

Features Implemented
--------------------

### Core Functionality

1.  **Google OAuth Authentication**
    -   Sign in using a Google account.
    -   OAuth tokens are maintained server-side for the active session.
2.  **Google Drive Integration**
    -   Browse folders available in the user's Google Drive.
    -   Select folders to view their audio/video files.
    -   Select individual files for transcription.
    -   Stream Drive audio files directly for playback.
3.  **WhipScribe API Integration**
    -   Download selected Drive files through the backend.
    -   Submit files to the WhipScribe transcription API.
    -   Support automatic language detection.
    -   Enable diarization and word timestamps.
    -   Retrieve transcription job status.
    -   Retrieve completed transcription results.
4.  **Transcription Job Tracking**
    -   Track multiple transcription jobs.
    -   Display queued, processing, completed, and failed states.
    -   Display transcription progress when available.
    -   Preserve the last known progress value when the API temporarily does not return progress.
5.  **Transcript Display**
    -   Display completed transcripts in a dedicated transcript view.
    -   Display timestamped transcript segments.
    -   Play audio directly from Google Drive.
    -   Jump to specific timestamps from transcript segments.
    -   Pause and resume playback.
    -   Navigate back to the transcript list.
6.  **Search Functionality**
    -   Search across completed transcripts.
    -   Match search terms within transcript segments.
    -   Highlight matching text.
    -   Display matching transcript results.
    -   Show timestamps associated with matching segments.
7.  **Timestamp Navigation**
    -   Click a search result to open the corresponding transcript.
    -   Automatically seek the audio to the selected timestamp.
    -   Begin playback from the selected position.

### User Interface

-   **Responsive Design** --- Designed for desktop and mobile layouts.
-   **Folder-Based Organization** --- Drive folders and their associated files are displayed in a structured interface.
-   **Job Progress Visualization** --- Transcription progress is represented visually using progress bars.
-   **Loading States** --- Loading indicators are displayed during authentication, folder loading, file loading, and transcription operations.
-   **Error States** --- API and authentication errors are surfaced to the user.
-   **Empty States** --- Empty folders, jobs, transcripts, and search results have dedicated UI states.
-   **Component-Based Architecture** --- Functionality is separated into reusable React components.
-   **Audio-First Transcript Experience** --- Transcript playback is implemented using an HTML audio player rather than video playback.

Technical Implementation
------------------------

-   **Frontend:** React + TypeScript + Vite
-   **Backend:** Node.js + Express.js
-   **Authentication:** Google OAuth 2.0
-   **Google Integration:** Google Drive API
-   **WhipScribe Integration:** WhipScribe REST API
-   **HTTP Communication:** Axios
-   **File Upload:** FormData / multipart form submission
-   **State Management:** React `useState` and `useEffect`
-   **Styling:** CSS and component-level styling
-   **Development:** Vite development server and Express backend

Project Structure
-----------------

```
apps/track3-whipscribe-manager/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GoogleLoginButton.tsx
│   │   │   ├── FolderBrowser.tsx
│   │   │   ├── FileList.tsx
│   │   │   ├── TranscriptionJobs.tsx
│   │   │   ├── TranscriptDisplay.tsx
│   │   │   └── SearchBar.tsx
│   │   │
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
│
├── server.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── IMPLEMENTATION_SUMMARY.md
```

Setup Instructions
------------------

### Prerequisites

1.  **Node.js**
    -   Node.js 16+ recommended.
2.  **WhipScribe API Access**
    -   A WhipScribe account and API key.
3.  **Google Cloud Project**
    -   Google Drive API enabled.
    -   OAuth 2.0 Client ID configured as a Web application.
    -   OAuth redirect URI configured for the local backend.

### Environment Variables

Create a `.env` file in the project root:

```
WHIPSCRIBE_API_KEY=your_whipscribe_api_key_here

GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

FRONTEND_URL=http://localhost:5175

PORT=3000
NODE_ENV=development
```

The `.env` file is excluded from Git through `.gitignore`.

### Installation

Install backend dependencies:

```
npm install
```

Install frontend dependencies:

```
cd client
npm install
cd ..
```

### Running the Application

Start the backend:

```
npm run dev
```

Start the frontend using the project's Vite configuration.

The development environment uses:

```
Backend:  http://localhost:3000
Frontend: http://localhost:5175
```

Implementation Details
----------------------

### Backend --- `server.js`

The Express backend provides the integration layer between the React application, Google Drive, and WhipScribe.

#### Google OAuth Flow

The backend:

-   Creates the Google OAuth authorization URL.
-   Redirects the user to Google authentication.
-   Handles the OAuth callback.
-   Retrieves the user's Google account information.
-   Stores the authenticated Google session in memory.
-   Uses the Google access token for Drive API requests.

The application requests read-only Google Drive access.

#### Google Drive Folder API

The backend provides an endpoint for retrieving the user's Drive folders.

The frontend uses this endpoint to populate the folder browser.

#### Google Drive File API

The backend retrieves audio/video files from the selected Drive folder.

File information includes:

-   File ID
-   File name
-   MIME type
-   File size

#### Google Drive File Download

When a user starts transcription, the backend downloads the selected Drive file to a temporary location before sending it to WhipScribe.

Temporary files are cleaned up after the request is completed.

#### Google Drive Audio Streaming

The backend also provides a streaming endpoint for audio playback.

The stream implementation supports HTTP range requests, allowing the frontend to seek to specific timestamps without requiring the entire recording to be downloaded first.

#### WhipScribe Transcription

The backend sends the Drive file to WhipScribe using multipart form data.

The transcription request uses:

-   Automatic language detection
-   Diarization
-   Word timestamps

The backend returns the resulting transcription job information to the frontend.

#### Job Status

The frontend periodically requests the current job status from the backend.

Supported states include:

```
queued
processing
done
failed
```

Progress values are normalized so both fractional values and percentage values can be handled.

For example:

```
0.25 → 25%
25   → 25%
1    → 100%
100  → 100%
```

#### Transcript Result

After a job completes, the backend retrieves the transcription result from WhipScribe.

The frontend converts the returned transcript data into timestamped segments that can be searched and played.

Frontend Implementation
-----------------------

### `App.tsx`

`App.tsx` acts as the main application controller.

It manages:

-   Authentication state
-   Google Drive folders
-   Files associated with folders
-   Selected files
-   Transcription jobs
-   Completed transcripts
-   Search queries
-   Search results
-   Selected transcript
-   Selected playback timestamp
-   Loading states

### `GoogleLoginButton.tsx`

Handles the Google authentication entry point and initiates the OAuth flow.

### `FolderBrowser.tsx`

Displays Google Drive folders and allows the user to select a folder.

When a folder is selected, its associated files are loaded through the backend.

### `FileList.tsx`

Displays the files contained within the selected Drive folder.

Users can select individual files before starting transcription.

### `TranscriptionJobs.tsx`

Displays active and completed transcription jobs.

The component provides visual feedback for:

-   Queued jobs
-   Processing jobs
-   Progress
-   Completed jobs
-   Failed jobs

### `TranscriptDisplay.tsx`

Displays the transcript associated with a completed transcription job.

The component provides:

-   Timestamped transcript segments
-   Audio playback
-   Play/pause controls
-   Timestamp seeking
-   Segment selection
-   Navigation back to the transcript list

### `SearchBar.tsx`

Provides the transcript search interface.

Search input is passed to the main application, where completed transcripts are searched for matching text.

Search Implementation
---------------------

Search operates across the completed transcripts stored in the application state.

For each transcript, the application checks:

1.  Individual transcript segments.
2.  Full transcript text.

Matching segments are returned as search results.

Search terms are normalized for case-insensitive matching.

When a matching segment is selected, the application:

1.  Opens the corresponding transcript.
2.  Identifies the segment timestamp.
3.  Seeks the Drive audio stream to that timestamp.
4.  Starts playback.

This allows users to move directly from a search result to the relevant part of the recording.

Authentication and Security
---------------------------

Sensitive credentials are stored in environment variables rather than source code.

The repository includes:

```
.env.example
.gitignore
```

The actual `.env` file is excluded from Git.

The application uses Google Drive's read-only OAuth scope rather than requesting write access to the user's Drive.

The WhipScribe API key is also stored server-side and is not exposed directly to the React frontend.

Current Architecture
--------------------

```
                         ┌─────────────────────┐
                         │     React Client     │
                         │                     │
                         │  Folder Browser     │
                         │  File Selection     │
                         │  Job Tracking       │
                         │  Transcript Search  │
                         │  Audio Playback     │
                         └──────────┬──────────┘
                                    │
                                    │ HTTP
                                    ▼
                         ┌─────────────────────┐
                         │   Express Backend   │
                         │                     │
                         │ Google OAuth        │
                         │ Drive API           │
                         │ File Download       │
                         │ Audio Streaming     │
                         │ WhipScribe API      │
                         │ Job Polling         │
                         └───────┬───────┬─────┘
                                 │       │
                    ┌────────────┘       └────────────┐
                    ▼                                 ▼
          ┌──────────────────┐              ┌──────────────────┐
          │   Google Drive   │              │    WhipScribe    │
          │                  │              │                  │
          │ Folders          │              │ Transcription    │
          │ Audio Files      │              │ Jobs             │
          │ Video Files      │              │ Results          │
          └──────────────────┘              └──────────────────┘
```

Data Flow
---------

### File Transcription

```
User
  │
  ▼
Select Google Drive Folder
  │
  ▼
Select Audio/Video Files
  │
  ▼
Click Transcribe
  │
  ▼
React Client
  │
  ▼
Express Backend
  │
  ▼
Download File from Google Drive
  │
  ▼
Send File to WhipScribe
  │
  ▼
Receive Job ID
  │
  ▼
Poll Job Status
  │
  ▼
Job Completed
  │
  ▼
Retrieve Transcript
  │
  ▼
Display Transcript
```

### Transcript Search

```
Search Query
     │
     ▼
Completed Transcripts
     │
     ▼
Match Transcript Segments
     │
     ▼
Display Matching Results
     │
     ▼
Select Result
     │
     ▼
Open Transcript
     │
     ▼
Seek Audio to Timestamp
     │
     ▼
Play Recording
```

Buildathon Requirement Coverage
-------------------------------

-   **Google Drive integration** --- Implemented through Google OAuth and Google Drive API.
-   **Folder selection** --- Implemented.
-   **File selection** --- Implemented.
-   **Bulk transcription workflow** --- Multiple selected files can be submitted for transcription.
-   **Per-file job tracking** --- Implemented.
-   **Progress display** --- Implemented.
-   **Transcript browsing** --- Implemented.
-   **Transcript search** --- Implemented.
-   **Timestamp navigation** --- Implemented.
-   **Audio playback** --- Implemented using Google Drive streaming.
-   **Secrets protection** --- API credentials are stored through environment variables.
-   **No local AI inference** --- Transcription is handled through the WhipScribe API.
-   **React + TypeScript frontend** --- Implemented.
-   **Node.js + Express backend** --- Implemented.
-   **Loading/error/empty states** --- Implemented throughout the application.

Current Limitations
-------------------

The current implementation uses in-memory application state for sessions, jobs, and transcript data.

As a result:

-   Restarting the backend clears active sessions.
-   Previously loaded application state is not persisted in a database.
-   Long-running jobs would benefit from a persistent background job queue.
-   The current implementation is primarily designed for local development and the buildathon environment.

Potential Future Enhancements
-----------------------------

1.  **Persistent Storage**
    -   Store users, folders, jobs, and transcripts in PostgreSQL or another database.
2.  **Background Job Queue**
    -   Move transcription processing into a persistent worker system for larger batches.
3.  **Webhook-Based Updates**
    -   Use webhooks where available to reduce polling.
4.  **Advanced Search**
    -   Add filters, folder-level search, speaker filtering, and more advanced query capabilities.
5.  **Transcript Export**
    -   Support TXT, SRT, VTT, and other transcript formats.
6.  **Persistent Job Recovery**
    -   Recover unfinished transcription jobs after a backend restart.
7.  **Testing**
    -   Add automated unit, integration, and end-to-end tests.
8.  **Production Deployment**
    -   Add production deployment configuration and infrastructure.
9.  **Accessibility**
    -   Expand keyboard navigation, ARIA support, and screen-reader compatibility.
10. **Analytics**
    -   Add transcription and usage statistics.

Compliance and Repository Practices
-----------------------------------

-   Uses the user's own Google Drive account.
-   Uses the user's own WhipScribe API credentials.
-   API credentials are not committed to the repository.
-   `.env` is excluded through `.gitignore`.
-   `.env.example` documents the required configuration.
-   Uses a lightweight cloud API architecture rather than local AI inference.
-   Track 3 implementation is contained within:

```
apps/track3-whipscribe-manager/
```

-   Existing project areas outside the Track 3 implementation are not modified by the application.