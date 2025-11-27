import React from 'react';
import { imageService, ImageData } from '../../services';
import { getStatusColor, getStatusTextColor } from '../../utils/statusUtils';
import styles from './ImageModal.module.css';

interface ImageModalProps {
  image: ImageData;
  showDepthImage: boolean;
  showFeatureImage: boolean;
  onClose: () => void;
  onImageError: (imageId: string, imageType: string) => void;
  isImageError: (imageId: string, imageType: string) => boolean;
}

const ImageModal: React.FC<ImageModalProps> = ({
  image,
  showDepthImage,
  showFeatureImage,
  onClose,
  onImageError,
  isImageError,
}) => {
  const imageType = showDepthImage ? 'depth' : showFeatureImage ? 'feature' : 'main';
  const isError = isImageError(image._id, imageType);

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
        {isError ? (
          <div className={styles.errorContainer}>
            <div>
              <div className={styles.errorIcon}>⚠️</div>
              <div>
                {showDepthImage ? 'Depth Image' : showFeatureImage ? 'Feature Image' : 'Image'} Not Available
              </div>
              <div className={styles.errorTitle}>
                The image failed to load or doesn't exist
              </div>
            </div>
          </div>
        ) : (
          <img
            src={
              showDepthImage 
                ? imageService.getDepthUrl(image) 
                : showFeatureImage 
                  ? imageService.getFeatureUrl(image)
                  : imageService.getImageUrl(image)
            }
            alt={
              showDepthImage 
                ? `${image._id} - Depth` 
                : showFeatureImage
                  ? `${image._id} - Feature`
                  : `Image ${image._id}`
            }
            onError={() => onImageError(image._id, imageType)}
            className={styles.image}
          />
        )}
        <div className={styles.imageInfo}>
          <p className={styles.imageId}>
            <strong>ID:</strong> {image._id}
          </p>
          <p className={styles.imageDescription}>
            {showDepthImage 
              ? `${image._id} - Depth Image` 
              : showFeatureImage
                ? `${image._id} - Feature Image`
                : `Image ${image._id}`
            }
          </p>
          <div className={styles.statusBadges}>
            <span
              className={styles.statusBadge}
              style={{
                backgroundColor: getStatusColor(image.tilingStatus),
                color: getStatusTextColor(image.tilingStatus)
              }}
            >
              Tiling: {image.tilingStatus}
            </span>
            <span
              className={styles.statusBadge}
              style={{
                backgroundColor: getStatusColor(image.featureStatus),
                color: getStatusTextColor(image.featureStatus)
              }}
            >
              Features: {image.featureStatus}
            </span>
            <span
              className={styles.statusBadge}
              style={{
                backgroundColor: getStatusColor(image.depthStatus),
                color: getStatusTextColor(image.depthStatus)
              }}
            >
              Depth: {image.depthStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;

