import React, { useState, useEffect } from 'react';
import styles from './ImageViewerModal.module.css';

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
      className={styles.modalOverlay}
      onClick={onClose}
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={styles.closeButton}
        >
          ×
        </button>
        {hasError ? (
          <div className={styles.errorContainer}>
            <div>
              <div className={styles.errorIcon}>⚠️</div>
              <div>Image Not Available</div>
              <div className={styles.errorTitle}>
                The image failed to load or doesn't exist
              </div>
            </div>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={`Image ${imageId}`}
            onError={() => setHasError(true)}
            className={styles.image}
          />
        )}
        <div className={styles.imageInfo}>
          <p className={styles.imageId}>
            <strong>ID:</strong> {imageId}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageViewerModal;

