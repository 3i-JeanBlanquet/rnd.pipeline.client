import React, { useState, useRef } from 'react';
import { imageService, ApiError } from '../../services';

interface ImageCreateProps {
  onUploadSuccess: () => void;
}

const ImageCreate: React.FC<ImageCreateProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [itemId, setItemId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 30 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !itemId) return;

    setUploading(true);
    setError(null);
    try {
      console.log('Uploading image:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        itemId: itemId
      });
      
      await imageService.uploadImage(selectedFile, itemId);
      
      console.log('Upload successful');
      setSelectedFile(null);
      setItemId('');
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadSuccess(); // Call parent callback to refresh the list
    } catch (err) {
      console.error('Upload failed:', err);
      const apiError = err as ApiError;
      setError(`Failed to upload image: ${apiError.message}`);
    } finally {
      setUploading(false);
    }
  };

  const generateUUID = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    setItemId(uuid);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #fcc'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%'
            }}
          />
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
            Supported formats: JPG, PNG, GIF, WebP (Max size: 10MB)
          </p>
        </div>
        
        {previewUrl && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
            <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
              {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
            </p>
          </div>
        )}
        
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Item ID (required)"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  flex: 1
                }}
              />
              <button
                type="button"
                onClick={generateUUID}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
                title="Generate a new UUID"
              >
                Generate UUID
              </button>
            </div>
        
        <button
          type="submit"
          disabled={uploading || !selectedFile || !itemId}
          style={{
            padding: '10px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading || !selectedFile || !itemId ? 'not-allowed' : 'pointer',
            opacity: uploading || !selectedFile || !itemId ? 0.6 : 1,
            fontSize: '16px'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>
    </div>
  );
};

export default ImageCreate;
