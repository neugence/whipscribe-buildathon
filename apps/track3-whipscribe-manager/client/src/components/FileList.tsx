import React from 'react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
}

interface FileListProps {
  files: DriveFile[];
  selectedFiles: DriveFile[];
  onFileSelect: (file: DriveFile) => void;
  onTranscribe: () => void;
}

function isMediaFile(file: DriveFile): boolean {
  const mimeType = (file.mimeType || '').toLowerCase();
  const fileName = (file.name || '').toLowerCase();

  const audioExtensions = [
    '.mp3',
    '.wav',
    '.m4a',
    '.aac',
    '.flac',
    '.ogg',
    '.opus',
    '.wma',
  ];

  const videoExtensions = [
    '.mp4',
    '.mov',
    '.avi',
    '.mkv',
    '.webm',
    '.m4v',
    '.wmv',
  ];

  return (
    mimeType.startsWith('audio/') ||
    mimeType.startsWith('video/') ||
    audioExtensions.some((ext) =>
      fileName.endsWith(ext)
    ) ||
    videoExtensions.some((ext) =>
      fileName.endsWith(ext)
    )
  );
}

export default function FileList({
  files,
  selectedFiles,
  onFileSelect,
  onTranscribe,
}: FileListProps) {
  const mediaFiles = files.filter(isMediaFile);

  if (mediaFiles.length === 0) {
    return (
      <div className="empty-state">
        No audio or video files found in this folder.
      </div>
    );
  }

  const allSelected = mediaFiles.every((file) =>
    selectedFiles.some(
      (selected) => selected.id === file.id
    )
  );

  const toggleAll = () => {
    if (allSelected) {
      mediaFiles.forEach((file) => {
        if (
          selectedFiles.some(
            (selected) => selected.id === file.id
          )
        ) {
          onFileSelect(file);
        }
      });
    } else {
      mediaFiles.forEach((file) => {
        if (
          !selectedFiles.some(
            (selected) => selected.id === file.id
          )
        ) {
          onFileSelect(file);
        }
      });
    }
  };

  return (
    <div className="file-list">

      {/* Select all + single transcribe button */}
      <div className="file-list-toolbar">
        <button
          type="button"
          className="select-all-button"
          onClick={toggleAll}
        >
          {allSelected
            ? 'Deselect All'
            : 'Select All'}
        </button>

        <button
          type="button"
          className="transcribe-button"
          onClick={onTranscribe}
          disabled={selectedFiles.length === 0}
        >
          Transcribe
          {selectedFiles.length > 0
            ? ` (${selectedFiles.length})`
            : ''}
        </button>
      </div>

      {/* Files */}
      {mediaFiles.map((file) => {
        const selected = selectedFiles.some(
          (selectedFile) =>
            selectedFile.id === file.id
        );

        const isVideo =
          file.mimeType
            ?.toLowerCase()
            .startsWith('video/') ||
          /\.(mp4|mov|avi|mkv|webm|m4v|wmv)$/i.test(
            file.name
          );

        return (
          <div
            key={file.id}
            className={`file-item ${
              selected ? 'selected' : ''
            }`}
            onClick={() => onFileSelect(file)}
          >
            <div className="file-info">
              <div className="file-checkbox">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    onFileSelect(file)
                  }
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                />
              </div>

              <div className="file-icon">
                {isVideo ? '🎬' : '🎧'}
              </div>

              <div className="file-details">
                <div
                  className="file-name"
                  title={file.name}
                >
                  {file.name}
                </div>

                <div className="file-type">
                  {isVideo ? 'Video' : 'Audio'}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}