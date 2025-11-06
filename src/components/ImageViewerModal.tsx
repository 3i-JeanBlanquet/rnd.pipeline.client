import React, { useState, useEffect } from 'react';

interface ImageViewerModalProps {
  imageUrl: string;
  imageId: string;
  onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  imageUrl,
  imageId,
  onClose,
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state when image URL changes
  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        cursor: 'pointer'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '90%',
          maxHeight: '90%',
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '20px',
          cursor: 'default'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001
          }}
        >
          ×
        </button>
        {hasError ? (
          <div style={{
            width: '100%',
            minHeight: '400px',
            backgroundColor: '#f8f9fa',
            border: '2px dashed #dee2e6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: '#6c757d',
            textAlign: 'center',
            padding: '20px'
          }}>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
              <div>Image Not Available</div>
              <div style={{ fontSize: '14px', marginTop: '5px', opacity: 0.7 }}>
                The image failed to load or doesn't exist
              </div>
            </div>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={`Image ${imageId}`}
            onError={() => setHasError(true)}
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        )}
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#333' }}>
            <strong>ID:</strong> {imageId}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageViewerModal;

