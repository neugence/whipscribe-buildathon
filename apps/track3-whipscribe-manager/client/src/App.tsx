import React, { useState, useEffect } from 'react';
import './App.css';
import GoogleLoginButton from './components/GoogleLoginButton';
import FolderBrowser from './components/FolderBrowser';
import FileList from './components/FileList';
import TranscriptionJobs from './components/TranscriptionJobs';
import TranscriptDisplay from './components/TranscriptDisplay';
import SearchBar from './components/SearchBar';

const API_BASE = 'http://localhost:3000';

interface DriveFolder {
  id: string;
  name: string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
}

interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  speaker: string;
  text: string;
}

interface Transcript {
  jobId: string;
  file: DriveFile;
  text: string;
  segments: TranscriptSegment[];
}

interface TranscriptionJob {
  id: string;
  file: DriveFile;
  status: 'queued' | 'processing' | 'done' | 'failed';
  progress: number;
}

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] =
    useState<string | null>(null);

  const [filesByFolder, setFilesByFolder] = useState<
    Record<string, DriveFile[]>
  >({});

  const [selectedFiles, setSelectedFiles] = useState<DriveFile[]>([]);

  const [transcriptionJobs, setTranscriptionJobs] = useState<
    TranscriptionJob[]
  >([]);

  const [transcripts, setTranscripts] = useState<Transcript[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Transcript[]>([]);

  const [selectedTranscript, setSelectedTranscript] =
    useState<Transcript | null>(null);

  const [selectedTranscriptTime, setSelectedTranscriptTime] =
    useState<number>(0);

  const [loadingStates, setLoadingStates] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramUserId = urlParams.get('userId');

    if (paramUserId) {
      setUserId(paramUserId);
      setIsAuthenticated(true);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, []);

  const handleLogin = () => {
    console.log('Google login clicked');
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleBrowseFolders = async () => {
    if (!userId) {
      console.error('No user ID available');
      return;
    }

    setLoadingStates((prev) => ({
      ...prev,
      folders: true,
    }));

    try {
      const response = await fetch(
        `${API_BASE}/api/drive/folders?userId=${encodeURIComponent(userId)}`
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `Failed to load folders: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();

      setFolders(data.files || []);
      setSelectedFolderId(null);
      setFilesByFolder({});
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error fetching Google Drive folders:', error);

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to load Google Drive folders.'
      );
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        folders: false,
      }));
    }
  };

  const handleFolderSelect = async (folderId: string) => {
    if (!userId) {
      console.error('No user ID available');
      return;
    }

    setSelectedFolderId((prev) =>
      prev === folderId ? null : folderId
    );

    if (filesByFolder[folderId]) {
      return;
    }

    setLoadingStates((prev) => ({
      ...prev,
      [`folder-${folderId}`]: true,
    }));

    try {
      const response = await fetch(
        `${API_BASE}/api/drive/files?userId=${encodeURIComponent(
          userId
        )}&folderId=${encodeURIComponent(folderId)}`
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `Failed to load files: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();

      setFilesByFolder((prev) => ({
        ...prev,
        [folderId]: data.files || [],
      }));
    } catch (error) {
      console.error('Error fetching Google Drive files:', error);

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to load files from Google Drive.'
      );

      setFilesByFolder((prev) => ({
        ...prev,
        [folderId]: [],
      }));
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [`folder-${folderId}`]: false,
      }));
    }
  };

  const handleFileSelect = (file: DriveFile) => {
    setSelectedFiles((prev) => {
      const isSelected = prev.some(
        (selectedFile) => selectedFile.id === file.id
      );

      if (isSelected) {
        return prev.filter(
          (selectedFile) => selectedFile.id !== file.id
        );
      }

      return [...prev, file];
    });
  };

  const normalizeJobStatus = (
    status: unknown
  ): 'queued' | 'processing' | 'done' | 'failed' => {
    if (
      status === 'processing' ||
      status === 'in_progress' ||
      status === 'running'
    ) {
      return 'processing';
    }

    if (
      status === 'done' ||
      status === 'completed' ||
      status === 'complete'
    ) {
      return 'done';
    }

    if (
      status === 'failed' ||
      status === 'error' ||
      status === 'cancelled'
    ) {
      return 'failed';
    }

    return 'queued';
  };

  const normalizeProgress = (value: unknown): number => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return 0;
    }

    const progress = value <= 1 ? value * 100 : value;

    return Math.max(0, Math.min(100, progress));
  };

  const handleTranscribe = async () => {
    if (!userId) {
      alert('Please sign in with Google first.');
      return;
    }

    if (selectedFiles.length === 0) {
      alert('Please select at least one audio file to transcribe.');
      return;
    }

    for (const file of selectedFiles) {
      const temporaryJobId = `pending-${file.id}-${Date.now()}`;

      const temporaryJob: TranscriptionJob = {
        id: temporaryJobId,
        file,
        status: 'queued',
        progress: 0,
      };

      setTranscriptionJobs((prev) => [...prev, temporaryJob]);

      try {
        const response = await fetch(
          `${API_BASE}/api/whipscribe/transcribe?userId=${encodeURIComponent(
            userId
          )}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              fileId: file.id,
              fileName: file.name,
              mimeType: file.mimeType,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(
            `Failed to start transcription for ${file.name}: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();

        const actualJobId =
          data.job_id ||
          data.jobId ||
          data.id ||
          data.job?.job_id ||
          data.job?.id ||
          data.data?.job_id ||
          data.data?.jobId ||
          data.data?.id ||
          temporaryJobId;

        const actualStatus = normalizeJobStatus(
          data.status ||
            data.job?.status ||
            data.data?.status
        );

        const rawProgress =
          typeof data.progress === 'number'
            ? data.progress
            : typeof data.job?.progress === 'number'
            ? data.job.progress
            : typeof data.data?.progress === 'number'
            ? data.data.progress
            : null;

        const actualProgress =
          actualStatus === 'done'
            ? 100
            : actualStatus === 'queued'
            ? 0
            : typeof rawProgress === 'number'
            ? normalizeProgress(rawProgress)
            : 0;

        setTranscriptionJobs((prev) =>
          prev.map((job) =>
            job.id === temporaryJobId
              ? {
                  ...job,
                  id: actualJobId,
                  status: actualStatus,
                  progress: actualProgress,
                }
              : job
          )
        );

        if (actualStatus === 'failed') {
          continue;
        }

        pollTranscriptionJob(actualJobId, file);
      } catch (error) {
        console.error(
          `Error starting transcription for ${file.name}:`,
          error
        );

        setTranscriptionJobs((prev) =>
          prev.map((job) =>
            job.id === temporaryJobId
              ? {
                  ...job,
                  status: 'failed',
                  progress: 0,
                }
              : job
          )
        );
      }
    }

    setSelectedFiles([]);
  };

  const pollTranscriptionJob = async (
    jobId: string,
    file: DriveFile
  ): Promise<void> => {
    const maxAttempts = 120;
    let attempts = 0;

    const poll = async (): Promise<void> => {
      if (attempts >= maxAttempts) {
        setTranscriptionJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  status: 'failed',
                }
              : job
          )
        );

        return;
      }

      attempts++;

      try {
        const response = await fetch(
          `${API_BASE}/api/whipscribe/jobs/${encodeURIComponent(
            jobId
          )}?userId=${encodeURIComponent(userId || '')}`
        );

        if (!response.ok) {
          throw new Error(
            `Job status request failed: ${response.status}`
          );
        }

        const data = await response.json();

        const status = normalizeJobStatus(
          data.status ||
            data.job?.status ||
            data.data?.status
        );

        const rawProgress =
          typeof data.progress === 'number'
            ? data.progress
            : typeof data.job?.progress === 'number'
            ? data.job.progress
            : typeof data.data?.progress === 'number'
            ? data.data.progress
            : null;

        setTranscriptionJobs((prev) =>
          prev.map((job) => {
            if (job.id !== jobId) {
              return job;
            }

            let progress = job.progress;

            if (status === 'done') {
              progress = 100;
            } else if (status === 'queued') {
              progress = 0;
            } else if (typeof rawProgress === 'number') {
              progress = normalizeProgress(rawProgress);
            }

            return {
              ...job,
              status,
              progress,
            };
          })
        );

        if (status === 'done') {
          await fetchTranscript(jobId, file);
          return;
        }

        if (status === 'failed') {
          return;
        }

        setTimeout(poll, 2000);
      } catch (error) {
        console.error(
          `Error polling job ${jobId}:`,
          error
        );

        setTranscriptionJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  status: 'failed',
                }
              : job
          )
        );
      }
    };

    await poll();
  };

  const fetchTranscript = async (
    jobId: string,
    file: DriveFile
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE}/api/whipscribe/jobs/${encodeURIComponent(
          jobId
        )}/result?userId=${encodeURIComponent(userId || '')}`
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `Failed to fetch transcript: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();

      const rawTranscript =
        data.transcript ||
        data.result ||
        data.data ||
        data;

      const rawSegments =
        rawTranscript.segments ||
        rawTranscript.utterances ||
        rawTranscript.results ||
        [];

      const segments: TranscriptSegment[] =
        Array.isArray(rawSegments)
          ? rawSegments.map(
              (segment: any, index: number) => ({
                id: index,
                start: Number(
                  segment.start ??
                    segment.start_time ??
                    0
                ),
                end: Number(
                  segment.end ??
                    segment.end_time ??
                    0
                ),
                speaker:
                  segment.speaker ||
                  segment.speaker_label ||
                  `Speaker ${index + 1}`,
                text: segment.text || '',
              })
            )
          : [];

      const text =
        rawTranscript.text ||
        rawTranscript.transcript ||
        segments
          .map((segment) => segment.text)
          .filter(Boolean)
          .join(' ');

      const transcript: Transcript = {
        jobId,
        file,
        text:
          text ||
          'Transcript returned without text content.',
        segments,
      };

      setTranscripts((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.jobId === jobId
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = transcript;
          return updated;
        }

        return [...prev, transcript];
      });
    } catch (error) {
      console.error(
        `Error fetching transcript for job ${jobId}:`,
        error
      );
    }
  };

  const handleSearch = (query: string) => {
    const value = query.trim();

    setSearchQuery(value);

    if (!value) {
      setSearchResults([]);
      return;
    }

    const normalizedQuery = value.toLowerCase();

    const results = transcripts
      .map((transcript) => {
        const matchingSegments =
          transcript.segments.filter((segment) =>
            segment.text
              .toLowerCase()
              .includes(normalizedQuery)
          );

        const transcriptTextMatches =
          transcript.text
            .toLowerCase()
            .includes(normalizedQuery);

        if (
          matchingSegments.length === 0 &&
          !transcriptTextMatches
        ) {
          return null;
        }

        return {
          ...transcript,
          segments:
            matchingSegments.length > 0
              ? matchingSegments
              : transcript.segments,
        };
      })
      .filter(
        (result): result is Transcript =>
          result !== null
      );

    console.log('Search query:', value);
    console.log('Search results:', results);

    setSearchResults(results);
  };

  const handleSelectTranscript = (
    transcript: Transcript,
    startTime: number = 0
  ) => {
    setSelectedTranscript(transcript);
    setSelectedTranscriptTime(startTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>
            WhipScribe Google Drive Transcript Manager
          </h1>

          <p>
            Connect your Google Drive to transcribe and
            search audio files
          </p>
        </header>

        <main className="app-main">
          <div className="auth-section">
            <GoogleLoginButton
              onClick={handleLogin}
            />

            <p className="auth-help-text">
              To use this app, you need to:
            </p>

            <ul className="auth-help-list">
              <li>
                Have a WhipScribe account with API key
              </li>

              <li>
                Set up a Google Cloud project with Drive
                API enabled
              </li>

              <li>
                Configure OAuth 2.0 credentials
              </li>

              <li>
                Set environment variables in .env file
              </li>
            </ul>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          WhipScribe Google Drive Transcript Manager
        </h1>

        <div className="user-info">
          <span>User ID: {userId}</span>
        </div>
      </header>

      <main className="app-main">
        <div className="sidebar">
          <FolderBrowser
            folders={folders}
            loading={loadingStates.folders || false}
            onBrowseFolders={handleBrowseFolders}
            onFolderSelect={handleFolderSelect}
            renderFolderContent={(folder) => {
              const folderFiles =
                filesByFolder[folder.id] || [];

              const isLoading =
                loadingStates[
                  `folder-${folder.id}`
                ];

              if (selectedFolderId !== folder.id) {
                return null;
              }

              if (isLoading) {
                return (
                  <p className="loading-state">
                    Loading files...
                  </p>
                );
              }

              return (
                <FileList
                  files={folderFiles}
                  selectedFiles={selectedFiles}
                  onFileSelect={handleFileSelect}
                  onTranscribe={handleTranscribe}
                />
              );
            }}
          />
        </div>

        <div className="main-content">
          <section className="jobs-section">
            <TranscriptionJobs
              jobs={transcriptionJobs}
              onViewTranscript={(jobId) => {
                const transcript =
                  transcripts.find(
                    (item) =>
                      item.jobId === jobId
                  );

                if (transcript) {
                  handleSelectTranscript(
                    transcript
                  );
                }
              }}
            />
          </section>

          <section className="transcripts-section">
            <div className="section-header">
              <h2>Transcripts</h2>

              <SearchBar
                onSearch={handleSearch}
              />
            </div>

            {selectedTranscript ? (
              <TranscriptDisplay
                transcript={selectedTranscript}
                userId={userId}
                initialTime={selectedTranscriptTime}
              />
            ) : transcripts.length === 0 ? (
              <p className="empty-state">
                No transcripts yet. Select audio files
                from Google Drive and transcribe them to
                see results here.
              </p>
            ) : (
              <div className="transcript-list">
                {transcripts.map((transcript) => (
                  <div
                    key={transcript.jobId}
                    className="transcript-item"
                    onClick={() =>
                      handleSelectTranscript(
                        transcript
                      )
                    }
                  >
                    <div className="transcript-preview">
                      <h3>
                        {transcript.file.name}
                      </h3>

                      <p className="transcript-preview-text">
                        {transcript.text.substring(
                          0,
                          100
                        )}
                        {transcript.text.length > 100
                          ? '...'
                          : ''}
                      </p>

                      <span className="transcript-preview-meta">
                        {transcript.segments.length}{' '}
                        segments •{' '}
                        {formatTime(
                          transcript.segments.reduce(
                            (
                              max: number,
                              segment: TranscriptSegment
                            ) =>
                              Math.max(
                                max,
                                segment.end
                              ),
                            0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {searchQuery && (
            <section className="search-results-section">
              <div className="section-header">
                <h2>
                  Search Results (
                  {searchResults.length})
                </h2>

                <span className="search-term">
                  “{searchQuery}”
                </span>
              </div>

              {searchResults.length === 0 ? (
                <p className="empty-state">
                  No transcripts found for "{searchQuery}".
                </p>
              ) : (
                <div className="search-results-list">
                  {searchResults.map((result) => (
                    <div
                      key={result.jobId}
                      className="search-result-item"
                      onClick={() =>
                        handleSelectTranscript(
                          result
                        )
                      }
                    >
                      <div className="search-result-header">
                        <h3>
                          {result.file.name}
                        </h3>
                      </div>

                      <div className="search-result-content">
                        {result.segments.length > 0 ? (
                          <div className="search-result-segments">
                            {result.segments.map(
                              (
                                segment: TranscriptSegment
                              ) => {
                                const escapedQuery =
                                  searchQuery.replace(
                                    /[.*+?^${}()|[\]\\]/g,
                                    '\\$&'
                                  );

                                const highlights =
                                  segment.text
                                    .split(
                                      new RegExp(
                                        `(${escapedQuery})`,
                                        'gi'
                                      )
                                    )
                                    .map(
                                      (
                                        part: string,
                                        index: number
                                      ) =>
                                        part.toLowerCase() ===
                                        searchQuery.toLowerCase() ? (
                                          <span
                                            key={index}
                                            className="highlight"
                                          >
                                            {part}
                                          </span>
                                        ) : (
                                          <span
                                            key={index}
                                          >
                                            {part}
                                          </span>
                                        )
                                    );

                                return (
                                  <div
                                    key={segment.id}
                                    className="search-result-segment"
                                  >
                                    <button
                                      type="button"
                                      className="segment-time"
                                      onClick={(
                                        event
                                      ) => {
                                        event.stopPropagation();

                                        handleSelectTranscript(
                                          result,
                                          segment.start
                                        );
                                      }}
                                    >
                                      [
                                      {formatTime(
                                        segment.start
                                      )}
                                      ]
                                    </button>

                                    <span className="segment-speaker">
                                      {segment.speaker}:
                                    </span>

                                    <span className="segment-text">
                                      {highlights}
                                    </span>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        ) : (
                          <p>{result.text}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;