import React from 'react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
}

interface TranscriptionJob {
  id: string;
  file: DriveFile;
  status: 'queued' | 'processing' | 'done' | 'failed';
  progress: number;
}

interface TranscriptionJobsProps {
  jobs: TranscriptionJob[];
  onViewTranscript?: (jobId: string) => void;
}

export default function TranscriptionJobs({
  jobs,
  onViewTranscript,
}: TranscriptionJobsProps) {
  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        No transcription jobs yet.
      </div>
    );
  }

  const getProgress = (job: TranscriptionJob) => {
    if (job.status === 'done') {
      return 100;
    }

    if (
      typeof job.progress !== 'number' ||
      Number.isNaN(job.progress)
    ) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(100, job.progress)
    );
  };

  return (
    <div className="transcription-jobs">
      {jobs.map((job) => {
        const progress = getProgress(job);

        return (
          <div
            key={job.id}
            className="transcription-job"
          >
            {/* File name */}
            <div className="job-top">
              <div className="job-file">
                <span className="job-icon">
                  🎧
                </span>

                <span
                  className="job-file-name"
                  title={job.file.name}
                >
                  {job.file.name}
                </span>
              </div>

              <div
                className={`job-status ${job.status}`}
              >
                {job.status === 'done' && '✓ Done'}
                {job.status === 'processing' &&
                  'Transcribing'}
                {job.status === 'queued' &&
                  'Queued'}
                {job.status === 'failed' &&
                  'Failed'}
              </div>
            </div>

            {/* Progress */}
            <div className="job-progress-wrapper">
              <div className="job-progress-bar">
                <div
                  className={`job-progress-fill ${
                    job.status === 'done'
                      ? 'completed'
                      : job.status === 'failed'
                      ? 'failed'
                      : ''
                  }`}
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <span className="job-progress-percent">
                {Math.round(progress)}%
              </span>
            </div>

            {/* View transcript */}
            {job.status === 'done' &&
              onViewTranscript && (
                <button
                  type="button"
                  className="view-transcript-button"
                  onClick={() =>
                    onViewTranscript(job.id)
                  }
                >
                  View Transcript
                </button>
              )}
          </div>
        );
      })}
    </div>
  );
}