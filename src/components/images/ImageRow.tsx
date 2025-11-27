import React, { useState, useEffect, useRef } from 'react';
import { imageService, ImageData } from '../../services';
import { ProcessingStatus } from '../../models/ProcessingStatus';
import { getStatusColor, getStatusTextColor } from '../../utils/statusUtils';
import { downloadImageAsZip } from '../../utils/imageDownload';
import styles from './ImageRow.module.css';

export interface ImageRowProps {
  image: ImageData;
  onImageClick: (image: ImageData) => void;
  onDepthImageClick: (image: ImageData) => void;
  onFeatureImageClick: (image: ImageData) => void;
}

const ImageRow: React.FC<ImageRowProps> = ({
  image: initialImage,
  onImageClick,
  onDepthImageClick,
  onFeatureImageClick,
}) => {
  const [image, setImage] = useState<ImageData>(initialImage);
  const [panoLoading, setPanoLoading] = useState(false);
  const [featureLoading, setFeatureLoading] = useState(false);
  const [depthLoading, setDepthLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const imageRef = useRef<ImageData>(initialImage);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  // Update image when initialImage prop changes
  useEffect(() => {
    setImage(initialImage);
    imageRef.current = initialImage;
  }, [initialImage]);

  // Keep ref in sync with state
  useEffect(() => {
    imageRef.current = image;
  }, [image]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  const handleRunPano = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setPanoLoading(true);
    try {
      const currentImage = imageRef.current;
      console.log('Running pano for image:', {
        itemId: currentImage._id,
        requestId: currentImage._id
      });
      
      await imageService.runPano(currentImage._id, currentImage._id, true);
      console.log('Pano request submitted successfully');
      
      // Trigger parent component refresh
      refresh();
    } catch (err) {
      console.error('Pano request failed:', err);
      alert('Failed to run pano processing. Please try again.');
    } finally {
      setPanoLoading(false);
    }
  };

  const handleRunFeature = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setFeatureLoading(true);
    try {
      const currentImage = imageRef.current;
      console.log('Running feature for image:', {
        itemId: currentImage._id,
        requestId: currentImage._id
      });
      
      await imageService.runFeature(currentImage._id, currentImage._id, true);
      image.featureStatus = ProcessingStatus.PROCESSED;
      console.log('Feature request submitted successfully');
      
      // Trigger parent component refresh
      refresh();
    } catch (err) {
      console.error('Feature request failed:', err);
      alert('Failed to run feature processing. Please try again.');
    } finally {
      setFeatureLoading(false);
    }
  };

  const handleRunDepth = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDepthLoading(true);
    try {
      const currentImage = imageRef.current;
      console.log('Running depth for image:', {
        itemId: currentImage._id,
        requestId: currentImage._id
      });
      
      await imageService.runDepth(currentImage._id, currentImage._id, true);
      image.depthStatus = ProcessingStatus.PROCESSED;
      console.log('Depth request submitted successfully');
      
      // Trigger parent component refresh
      refresh();
    } catch (err) {
      console.error('Depth request failed:', err);
      alert('Failed to run depth processing. Please try again.');
    } finally {
      setDepthLoading(false);
    }
  };

  // Helper functions to get image URLs with logging
  const getImageUrl = () => {
    const url = imageService.getImageUrl(image);
    return url;
  };

  const getDepthUrl = () => {
    const url = imageService.getDepthUrl(image);
    return url;
  };

  const getFeatureUrl = () => {
    const url = imageService.getFeatureUrl(image);
    return url;
  };

  const handleDownloadZip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await downloadImageAsZip(image, (imageId) => setZipLoading(imageId !== null));
  };

  const formatDate = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.imageRow}>
      {/* Main image card */}
      <div className={styles.imageCard}>
        {/* Top section: Image thumbnails, ID, status badges, and action buttons */}
        <div className={styles.topSection}>
          {/* Left side: Image thumbnails, ID, and Status badges */}
          <div className={styles.leftContent}>
            {/* Image thumbnails */}
            <div className={styles.thumbnailGroup}>
              {/* Main Image */}
              {image._id ? (
                <img
                  src={getImageUrl()}
                  alt={`Image ${image._id}`}
                  onClick={() => onImageClick(image)}
                  className={styles.thumbnail}
                />
              ) : (
                <div className={styles.thumbnailPlaceholder}>
                  No Image
                </div>
              )}
              
              {/* Depth Image */}
              {image.depthStatus === ProcessingStatus.PROCESSED && image.parentId ? (
                <img
                  src={getDepthUrl()}
                  alt={`${image._id} - Depth`}
                  onClick={() => onDepthImageClick(image)}
                  className={styles.thumbnail}
                />
              ) : image.parentId ? (
                <div className={styles.thumbnailPlaceholder}>
                  {image.depthStatus === ProcessingStatus.PROCESSING ? 'Processing...' : 'No Depth'}
                </div>
              ) : null}
              
              {/* Feature Image */}
              {image.featureStatus === ProcessingStatus.PROCESSED && image.parentId ? (
                <img
                  src={getFeatureUrl()}
                  alt={`${image._id} - Feature`}
                  onClick={() => onFeatureImageClick(image)}
                  className={styles.thumbnail}
                />
              ) : image.parentId ? (
                <div className={styles.thumbnailPlaceholder}>
                  {image.featureStatus === ProcessingStatus.PROCESSING ? 'Processing...' : 'No Feature'}
                </div>
              ) : null}
            </div>

            {/* ID and Status info */}
            <div className={styles.imageInfo}>
              <h3 className={styles.imageId}>
                {image.parentId ? (
                  <>
                    {image.parentId}
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: '400' }}> / {image._id}</span>
                  </>
                ) : (
                  image._id
                )}
              </h3>
              <p className={styles.imageMeta}>
                {image.extension && `Extension: ${image.extension} • `}
                {image.createdAt ? `Created: ${formatDate(image.createdAt)}` : 'N/A'}
                {image.hasCameraInfo && ' • 📷 Camera Info'}
              </p>
              {/* Status badges */}
              <div className={styles.statusBadges}>
                {image.parentId && (
                  <>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: getStatusColor(image.featureStatus),
                        color: getStatusTextColor(image.featureStatus)
                      }}
                    >
                      F: {image.featureStatus}
                    </span>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: getStatusColor(image.depthStatus),
                        color: getStatusTextColor(image.depthStatus)
                      }}
                    >
                      D: {image.depthStatus}
                    </span>
                  </>
                )}
                {!image.parentId && (
                  <span
                    className={styles.statusBadge}
                    style={{
                      backgroundColor: getStatusColor(image.tilingStatus),
                      color: getStatusTextColor(image.tilingStatus)
                    }}
                  >
                    T: {image.tilingStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side: Run buttons and Actions menu dropdown */}
          <div className={styles.rightActions}>
            {/* Run buttons */}
            <div className={styles.buttonGroup}>
              {image.parentId && (
                <>
                  <button
                    onClick={handleRunFeature}
                    disabled={featureLoading}
                    className={`${styles.actionButton} ${featureLoading ? styles.actionButtonDisabled : styles.actionButtonSuccess}`}
                    title="Run feature processing"
                  >
                    {featureLoading ? '⏳' : '▶'} Feature
                  </button>
                  <button
                    onClick={handleRunDepth}
                    disabled={depthLoading}
                    className={`${styles.actionButton} ${depthLoading ? styles.actionButtonDisabled : styles.actionButtonInfo}`}
                    title="Run depth processing"
                  >
                    {depthLoading ? '⏳' : '▶'} Depth
                  </button>
                </>
              )}
              {!image.parentId && (
                <button
                  onClick={handleRunPano}
                  disabled={panoLoading}
                  className={`${styles.actionButton} ${panoLoading ? styles.actionButtonDisabled : styles.actionButtonPrimary}`}
                  title="Run pano processing"
                >
                  {panoLoading ? '⏳' : '▶'} Pano
                </button>
              )}
            </div>
            
            {/* Actions menu dropdown */}
            <div className={styles.actionsMenu} ref={actionsMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionsMenu(!showActionsMenu);
                }}
                className={styles.actionsButton}
                title="More actions"
              >
                ⋯
              </button>
              {showActionsMenu && (
                <div
                  className={styles.actionsDropdown}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadZip(e);
                      setShowActionsMenu(false);
                    }}
                    disabled={zipLoading}
                    className={`${styles.menuItem} ${zipLoading ? styles.menuItemDisabled : ''}`}
                  >
                    {zipLoading ? '⏳' : '📦'} Download ZIP
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageClick(image);
                      setShowActionsMenu(false);
                    }}
                    className={`${styles.menuItem} ${styles.menuItemLast} ${styles.menuItemPrimary}`}
                  >
                    👁️ View Image
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageRow;

