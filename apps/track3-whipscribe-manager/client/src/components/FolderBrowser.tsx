import React from 'react';

interface DriveFolder {
  id: string;
  name: string;
}

interface FolderBrowserProps {
  folders: DriveFolder[];
  loading: boolean;
  onBrowseFolders: () => void;
  onFolderSelect: (folderId: string) => void;
  renderFolderContent: (folder: DriveFolder) => React.ReactNode;
}

export default function FolderBrowser({
  folders,
  loading,
  onBrowseFolders,
  onFolderSelect,
  renderFolderContent,
}: FolderBrowserProps) {
  return (
    <div className="folder-browser">
      <div className="folder-browser-header">
        <h2>My Drive</h2>

        <button
          type="button"
          className="browse-folders-button"
          onClick={onBrowseFolders}
          disabled={loading}
        >
          {loading ? 'Loading My Drive...' : 'Browse Drive'}
        </button>
      </div>

      {!loading && folders.length === 0 && (
        <div className="empty-state">
          Click <strong>Browse Drive</strong> to load your
          Google Drive folders.
        </div>
      )}

      {loading && (
        <div className="loading-state">
          Loading your Google Drive...
        </div>
      )}

      {!loading && folders.length > 0 && (
        <div className="folder-list">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="folder-item"
            >
              <button
                type="button"
                className="folder-button"
                onClick={() =>
                  onFolderSelect(folder.id)
                }
              >
                <span className="folder-icon">
                  📁
                </span>

                <span className="folder-name">
                  {folder.name}
                </span>

                <span className="folder-arrow">
                  →
                </span>
              </button>

              {renderFolderContent(folder)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}