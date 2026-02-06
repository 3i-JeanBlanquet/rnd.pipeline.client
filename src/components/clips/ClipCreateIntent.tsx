import React from 'react';
import styles from './ClipCreate.module.css';
import { useClipCreateIntent, getStatusText, type FileWithId } from './ClipCreateIntent.hooks';

interface ClipCreateIntentProps {
  onUploadSuccess: () => void;
}

function getStatusBadge(status: FileWithId['status']) {
  switch (status) {
    case 'intent':
      return <span style={{ color: '#007bff', fontSize: '11px' }}>🔑 Creating intent...</span>;
    case 'uploading':
      return <span style={{ color: '#007bff', fontSize: '11px' }}>⏳ Uploading to S3...</span>;
    case 'confirming':
      return <span style={{ color: '#007bff', fontSize: '11px' }}>✓ Confirming...</span>;
    case 'success':
      return <span style={{ color: '#28a745', fontSize: '11px' }}>✓ Success</span>;
    case 'error':
      return <span style={{ color: '#dc3545', fontSize: '11px' }}>✗ Error</span>;
    default:
      return <span style={{ color: '#6c757d', fontSize: '11px' }}>⏸ Pending</span>;
  }
}

const ClipCreateIntent: React.FC<ClipCreateIntentProps> = ({ onUploadSuccess }) => {
  const {
    uploading,
    selectedFiles,
    currentUploadIndex,
    error,
    successMessage,
    fileInputRef,
    handleFileSelect,
    handleUpload,
    handleRemoveFile,
    handleClearAll,
    handleCopyAllIds,
  } = useClipCreateIntent({ onUploadSuccess });

  return (
    <div>
      {error && (
        <div className={styles.errorMessage}>
          <strong>Error:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{error}</pre>
        </div>
      )}
      {successMessage && (
        <div
          style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb',
          }}
        >
          <strong>Success:</strong> {successMessage}
        </div>
      )}

      <form onSubmit={handleUpload} className={styles.form}>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            multiple
            onChange={handleFileSelect}
            className={styles.fileInput}
          />
          <p className={styles.fileHint}>
            Supported formats: MP4, WebM, MOV, AVI
            <br />
            You can select multiple videos at once
            <br />
            <strong>Upload Flow: Intent → S3 Upload → Confirm</strong>
          </p>
        </div>

        {selectedFiles.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <strong style={{ color: '#333' }}>Selected Clips ({selectedFiles.length}):</strong>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleCopyAllIds}
                  disabled={uploading}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    opacity: uploading ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Copy all IDs to clipboard (comma-separated)"
                >
                  📋 Copy All IDs
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={uploading}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    opacity: uploading ? 0.6 : 1,
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
              }}
            >
              {selectedFiles.map((fileWithId, index) => (
                <div
                  key={fileWithId.id}
                  style={{
                    position: 'relative',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '4px',
                    backgroundColor: '#fff',
                    opacity: fileWithId.status === 'error' ? 0.7 : 1,
                  }}
                >
                  <video
                    src={fileWithId.previewUrl}
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      display: 'block',
                    }}
                    muted
                    preload="metadata"
                  />
                  <div
                    style={{
                      marginTop: '4px',
                      fontSize: '9px',
                      color: '#666',
                      wordBreak: 'break-word',
                      fontFamily: 'monospace',
                    }}
                  >
                    {fileWithId.id}
                  </div>
                  <div
                    style={{
                      marginTop: '2px',
                      fontSize: '10px',
                      color: '#333',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {fileWithId.file.name}
                  </div>
                  <div style={{ marginTop: '4px' }}>{getStatusBadge(fileWithId.status)}</div>
                  {fileWithId.status === 'error' && fileWithId.error && (
                    <div
                      style={{
                        marginTop: '4px',
                        fontSize: '9px',
                        color: '#dc3545',
                        wordBreak: 'break-word',
                      }}
                    >
                      {fileWithId.error}
                    </div>
                  )}
                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                      title="Remove this clip"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {currentUploadIndex !== null && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '8px',
                  backgroundColor: '#e7f3ff',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#0066cc',
                }}
              >
                Uploading {currentUploadIndex + 1} of {selectedFiles.length}... (
                {getStatusText(selectedFiles[currentUploadIndex]?.status || 'pending')})
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || selectedFiles.length === 0}
          className={styles.submitButton}
        >
          {uploading
            ? `Uploading ${currentUploadIndex !== null ? `${currentUploadIndex + 1}/${selectedFiles.length}` : ''}...`
            : `Upload ${selectedFiles.length} Clip${selectedFiles.length !== 1 ? 's' : ''}`}
        </button>
      </form>
    </div>
  );
};

export default ClipCreateIntent;
