import React, { useState, useRef } from 'react';
import { imageService, ApiError } from '../../services';
import styles from './ImageCreate.module.css';

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
        <div className={styles.errorMessage}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleUpload} className={styles.form}>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={styles.fileInput}
          />
          <p className={styles.fileHint}>
            Supported formats: JPG, PNG, GIF, WebP (Max size: 10MB)
          </p>
        </div>
        
        {previewUrl && (
          <div className={styles.previewContainer}>
            <img
              src={previewUrl}
              alt="Preview"
              className={styles.previewImage}
            />
            <p className={styles.previewInfo}>
              {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
            </p>
          </div>
        )}
        
        <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Item ID (required)"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
            className={styles.textInput}
              />
              <button
                type="button"
                onClick={generateUUID}
            className={styles.generateButton}
                title="Generate a new UUID"
              >
                Generate UUID
              </button>
            </div>
        
        <button
          type="submit"
          disabled={uploading || !selectedFile || !itemId}
          className={styles.submitButton}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>
    </div>
  );
};

export default ImageCreate;
