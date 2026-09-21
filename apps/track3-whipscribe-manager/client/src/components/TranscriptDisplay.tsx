import React, { useEffect, useRef, useState } from 'react';

interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  speaker: string;
  text: string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
}

interface Transcript {
  jobId: string;
  file: DriveFile;
  text: string;
  segments: TranscriptSegment[];
}

interface TranscriptDisplayProps {
  transcript: Transcript;
  userId?: string | null;
  onBack?: () => void;
  initialTime?: number;
}

const API_BASE = 'http://localhost:3000';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function TranscriptDisplay({
  transcript,
  userId,
  onBack,
  initialTime = 0,
}: TranscriptDisplayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [audioError, setAudioError] = useState(false);
  const [playingSegment, setPlayingSegment] =
    useState<number | null>(null);

  const mediaUrl =
    userId && transcript.file.id
      ? `${API_BASE}/api/drive/files/${encodeURIComponent(
          transcript.file.id
        )}/stream?userId=${encodeURIComponent(userId)}`
      : '';

  const jumpToTime = async (
    seconds: number,
    segmentId: number
  ) => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = seconds;

    setPlayingSegment(segmentId);

    try {
      await audio.play();
    } catch (error) {
      console.error('Unable to play audio:', error);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || initialTime <= 0) {
      return;
    }

    const seekToInitialTime = () => {
      audio.currentTime = initialTime;
      audio.play().catch(() => {});
    };

    if (audio.readyState >= 1) {
      seekToInitialTime();
    } else {
      audio.addEventListener(
        'loadedmetadata',
        seekToInitialTime,
        { once: true }
      );

      return () => {
        audio.removeEventListener(
          'loadedmetadata',
          seekToInitialTime
        );
      };
    }
  }, [initialTime, transcript.jobId]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const handleEnded = () => {
      setPlayingSegment(null);
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        marginTop: '10px',
      }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{
            marginBottom: '14px',
            padding: '7px 12px',
            border: '1px solid #d9dee7',
            borderRadius: '7px',
            background: '#ffffff',
            color: '#475569',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      )}

      {/* Transcript heading */}
      <div
        style={{
          marginBottom: '10px',
          color: '#334155',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        {transcript.segments.length} segments
      </div>

      {/* Hidden audio player */}
      {mediaUrl && !audioError && (
        <audio
          ref={audioRef}
          src={mediaUrl}
          preload="metadata"
          onError={() => setAudioError(true)}
        />
      )}

      {audioError && (
        <div
          style={{
            marginBottom: '10px',
            padding: '8px 10px',
            borderRadius: '6px',
            background: '#fef2f2',
            color: '#b91c1c',
            fontSize: '12px',
          }}
        >
          Unable to load the recording.
        </div>
      )}

      {/* Transcript */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          width: '100%',
        }}
      >
        {transcript.segments.length > 0 ? (
          transcript.segments.map((segment) => {
            const isPlaying =
              playingSegment === segment.id;

            return (
              <div
                key={segment.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  minHeight: '42px',
                  padding: '8px 10px',
                  gap: '10px',

                  background: isPlaying
                    ? '#e1efc9'
                    : '#eef6df',

                  borderLeft: isPlaying
                    ? '3px solid #4d7c0f'
                    : '3px solid #65a30d',

                  borderRadius: '7px',

                  boxSizing: 'border-box',

                  transition: 'all 0.15s ease',
                }}
              >
                {/* Time */}
                <span
                  style={{
                    width: '34px',
                    flexShrink: 0,
                    color: '#4d7c0f',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}
                >
                  {formatTime(segment.start)}
                </span>

                {/* Play */}
                <button
                  type="button"
                  onClick={() =>
                    jumpToTime(
                      segment.start,
                      segment.id
                    )
                  }
                  title={`Play from ${formatTime(
                    segment.start
                  )}`}
                  style={{
                    width: '25px',
                    height: '25px',
                    flexShrink: 0,

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    padding: 0,

                    border: '2px solid #172033',
                    borderRadius: '6px',

                    background: isPlaying
                      ? '#172033'
                      : 'transparent',

                    color: isPlaying
                      ? '#ffffff'
                      : '#172033',

                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  {isPlaying ? '❚❚' : '▶'}
                </button>

                {/* Transcript text */}
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,

                    color: '#334155',

                    fontSize: '13px',
                    lineHeight: '1.4',

                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {segment.text}
                </span>

                {/* Small edit button */}
                <button
                  type="button"
                  title="Edit"
                  style={{
                    width: '22px',
                    height: '22px',

                    flexShrink: 0,

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    padding: 0,

                    border: '1px solid #d9dee7',
                    borderRadius: '5px',

                    background: '#ffffff',
                    color: '#64748b',

                    fontSize: '11px',

                    cursor: 'pointer',
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  ✎
                </button>

                {/* Small close button */}
                <button
                  type="button"
                  title="Remove"
                  style={{
                    width: '22px',
                    height: '22px',

                    flexShrink: 0,

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    padding: 0,

                    border: '1px solid #d9dee7',
                    borderRadius: '5px',

                    background: '#ffffff',
                    color: '#64748b',

                    fontSize: '13px',

                    cursor: 'pointer',
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  ×
                </button>
              </div>
            );
          })
        ) : (
          <div
            style={{
              padding: '14px',
              borderRadius: '8px',
              background: '#eef6df',
              borderLeft: '3px solid #65a30d',
              color: '#334155',
              fontSize: '13px',
              lineHeight: 1.5,
            }}
          >
            {transcript.text}
          </div>
        )}
      </div>
    </div>
  );
}