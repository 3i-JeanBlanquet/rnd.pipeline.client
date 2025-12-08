import React, { useState, useRef } from 'react';
import { clipService, ApiError } from '../../services';
import styles from './ClipCreate.module.css';

interface ClipCreateProps {
  onUploadSuccess: () => void;
}

interface FileWithId {
  file: File;
  id: string;
  previewUrl: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const ClipCreate: React.FC<ClipCreateProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithId[]>([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: FileWithId[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        errors.push(`${file.name}: Please select a valid video file`);
        return;
      }
      
      // Validate file size (max 2GB for videos)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        errors.push(`${file.name}: File size must be less than 2GB`);
        return;
      }

      const id = generateUUID();
      const previewUrl = URL.createObjectURL(file);
      validFiles.push({
        file,
        id,
        previewUrl,
        status: 'pending'
      });
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setError(null);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }

    // Reset input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    // Upload files sequentially
    for (let i = 0; i < selectedFiles.length; i++) {
      const fileWithId = selectedFiles[i];
      
      // Update status to uploading
      setCurrentUploadIndex(i);
      setSelectedFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'uploading' } : f
      ));

      try {
        console.log('Uploading clip:', {
          fileName: fileWithId.file.name,
          fileSize: fileWithId.file.size,
          fileType: fileWithId.file.type,
          clipId: fileWithId.id
        });
        
        await clipService.uploadClip(fileWithId.file, fileWithId.id);
        
        console.log('Upload successful:', fileWithId.file.name);
        
        // Update status to success
        setSelectedFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'success' } : f
        ));
      } catch (err) {
        console.error('Upload failed:', err);
        const apiError = err as ApiError;
        const errorMessage = `Failed to upload ${fileWithId.file.name}: ${apiError.message}`;
        
        // Update status to error
        setSelectedFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error', error: apiError.message } : f
        ));
        
        setError(prev => prev ? `${prev}\n${errorMessage}` : errorMessage);
      }
    }

    setCurrentUploadIndex(null);
    setUploading(false);
    
    // Check if all uploads succeeded
    const allSucceeded = selectedFiles.every(f => f.status === 'success');
    if (allSucceeded) {
      // Clear all files after a short delay
      setTimeout(() => {
        selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
        setSelectedFiles([]);
        onUploadSuccess(); // Call parent callback to refresh the list
      }, 1000);
    }
  };

  const handleRemoveFile = (index: number) => {
    const fileWithId = selectedFiles[index];
    URL.revokeObjectURL(fileWithId.previewUrl);
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleClearAll = () => {
    selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setSelectedFiles([]);
    setError(null);
  };

  const handleCopyAllIds = async () => {
    if (selectedFiles.length === 0) {
      alert('No clips selected to copy IDs');
      return;
    }
    
    try {
      const allIds = selectedFiles.map(f => f.id).join(',');
      await navigator.clipboard.writeText(allIds);
      console.log('All IDs copied to clipboard:', allIds);
      // Show a temporary success message
      setSuccessMessage('✓ All IDs copied to clipboard!');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy IDs to clipboard. Please try again.');
    }
  };

  const getStatusBadge = (status: FileWithId['status']) => {
    switch (status) {
      case 'uploading':
        return <span style={{ color: '#007bff', fontSize: '11px' }}>⏳ Uploading...</span>;
      case 'success':
        return <span style={{ color: '#28a745', fontSize: '11px' }}>✓ Success</span>;
      case 'error':
        return <span style={{ color: '#dc3545', fontSize: '11px' }}>✗ Error</span>;
      default:
        return <span style={{ color: '#6c757d', fontSize: '11px' }}>⏸ Pending</span>;
    }
  };

  return (
    <div>
      {error && (
        <div className={styles.errorMessage}>
          <strong>Error:</strong> 
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{error}</pre>
        </div>
      )}
      {successMessage && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
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
            Supported formats: MP4, WebM, MOV, AVI (Max size: 2GB per file)
            <br />
            You can select multiple videos at once
          </p>
        </div>
        
        {selectedFiles.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
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
                    gap: '4px'
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
                    opacity: uploading ? 0.6 : 1
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '12px',
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              {selectedFiles.map((fileWithId, index) => (
                <div
                  key={fileWithId.id}
                  style={{
                    position: 'relative',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '4px',
                    backgroundColor: '#fff',
                    opacity: fileWithId.status === 'error' ? 0.7 : 1
                  }}
                >
                  <video
                    src={fileWithId.previewUrl}
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      display: 'block'
                    }}
                    muted
                    preload="metadata"
                  />
                  <div style={{
                    marginTop: '4px',
                    fontSize: '9px',
                    color: '#666',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace'
                  }}>
                    {fileWithId.id}
                  </div>
                  <div style={{
                    marginTop: '2px',
                    fontSize: '10px',
                    color: '#333',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {fileWithId.file.name}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    {getStatusBadge(fileWithId.status)}
                  </div>
                  {fileWithId.status === 'error' && fileWithId.error && (
                    <div style={{
                      marginTop: '4px',
                      fontSize: '9px',
                      color: '#dc3545',
                      wordBreak: 'break-word'
                    }}>
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
                        padding: 0
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
              <div style={{
                marginTop: '10px',
                padding: '8px',
                backgroundColor: '#e7f3ff',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#0066cc'
              }}>
                Uploading {currentUploadIndex + 1} of {selectedFiles.length}...
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

export default ClipCreate;

