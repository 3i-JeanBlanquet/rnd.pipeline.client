import React, { useState, useEffect, useRef } from 'react';
import { imageService, ImageData } from '../../services';
import { ProcessingStatus } from '../../models/ProcessingStatus';
import { getStatusColor, getStatusTextColor } from '../../utils/statusUtils';
import { downloadImageAsZip } from '../../utils/imageDownload';

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
    <div
      style={{
        backgroundColor: '#fff',
        width: '100%',
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
        borderBottom: '1px solid #e9ecef'
      }}
    >
      {/* Main image card */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Top section: Image thumbnails, ID, status badges, and action buttons */}
        <div
          style={{
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            transition: 'background-color 0.2s ease',
            width: '100%',
            boxSizing: 'border-box',
            gap: '16px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e9ecef';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Left side: Image thumbnails, ID, and Status badges */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
            {/* Image thumbnails */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              {/* Main Image */}
              {image._id ? (
                <img
                  src={getImageUrl()}
                  alt={`Image ${image._id}`}
                  onClick={() => onImageClick(image)}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              ) : (
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '10px'
                }}>
                  No Image
                </div>
              )}
              
              {/* Depth Image */}
              {image.depthStatus === ProcessingStatus.PROCESSED && image.parentId ? (
                <img
                  src={getDepthUrl()}
                  alt={`${image._id} - Depth`}
                  onClick={() => onDepthImageClick(image)}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              ) : image.parentId ? (
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '9px',
                  textAlign: 'center',
                  padding: '4px'
                }}>
                  {image.depthStatus === ProcessingStatus.PROCESSING ? 'Processing...' : 'No Depth'}
                </div>
              ) : null}
              
              {/* Feature Image */}
              {image.featureStatus === ProcessingStatus.PROCESSED && image.parentId ? (
                <img
                  src={getFeatureUrl()}
                  alt={`${image._id} - Feature`}
                  onClick={() => onFeatureImageClick(image)}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              ) : image.parentId ? (
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '9px',
                  textAlign: 'center',
                  padding: '4px'
                }}>
                  {image.featureStatus === ProcessingStatus.PROCESSING ? 'Processing...' : 'No Feature'}
                </div>
              ) : null}
            </div>

            {/* ID and Status info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#333', fontWeight: '600', wordBreak: 'break-word' }}>
                {image.parentId ? (
                  <>
                    {image.parentId}
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: '400' }}> / {image._id}</span>
                  </>
                ) : (
                  image._id
                )}
              </h3>
              <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#666' }}>
                {image.extension && `Extension: ${image.extension} • `}
                {image.createdAt ? `Created: ${formatDate(image.createdAt)}` : 'N/A'}
                {image.hasCameraInfo && ' • 📷 Camera Info'}
              </p>
              {/* Status badges */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {image.parentId && (
                  <>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '9px',
                      fontWeight: '600',
                      backgroundColor: getStatusColor(image.featureStatus),
                      color: getStatusTextColor(image.featureStatus),
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}>
                      F: {image.featureStatus}
                    </span>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '9px',
                      fontWeight: '600',
                      backgroundColor: getStatusColor(image.depthStatus),
                      color: getStatusTextColor(image.depthStatus),
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}>
                      D: {image.depthStatus}
                    </span>
                  </>
                )}
                {!image.parentId && (
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '9px',
                    fontWeight: '600',
                    backgroundColor: getStatusColor(image.tilingStatus),
                    color: getStatusTextColor(image.tilingStatus),
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>
                    T: {image.tilingStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side: Run buttons and Actions menu dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Run buttons */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {image.parentId && (
                <>
                  <button
                    onClick={handleRunFeature}
                    disabled={featureLoading}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: featureLoading ? '#6c757d' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: featureLoading ? 'not-allowed' : 'pointer',
                      fontSize: '11px',
                      fontWeight: '500',
                      opacity: featureLoading ? 0.6 : 1,
                      whiteSpace: 'nowrap'
                    }}
                    title="Run feature processing"
                  >
                    {featureLoading ? '⏳' : '▶'} Feature
                  </button>
                  <button
                    onClick={handleRunDepth}
                    disabled={depthLoading}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: depthLoading ? '#6c757d' : '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: depthLoading ? 'not-allowed' : 'pointer',
                      fontSize: '11px',
                      fontWeight: '500',
                      opacity: depthLoading ? 0.6 : 1,
                      whiteSpace: 'nowrap'
                    }}
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
                  style={{
                    padding: '6px 10px',
                    backgroundColor: panoLoading ? '#6c757d' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: panoLoading ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontWeight: '500',
                    opacity: panoLoading ? 0.6 : 1,
                    whiteSpace: 'nowrap'
                  }}
                  title="Run pano processing"
                >
                  {panoLoading ? '⏳' : '▶'} Pano
                </button>
              )}
            </div>
            
            {/* Actions menu dropdown */}
            <div style={{ position: 'relative' }} ref={actionsMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionsMenu(!showActionsMenu);
                }}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="More actions"
              >
                ⋯
              </button>
              {showActionsMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 100,
                    minWidth: '140px',
                    overflow: 'hidden'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadZip(e);
                      setShowActionsMenu(false);
                    }}
                    disabled={zipLoading}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      color: zipLoading ? '#6c757d' : '#6f42c1',
                      border: 'none',
                      borderBottom: '1px solid #e9ecef',
                      cursor: zipLoading ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: zipLoading ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!zipLoading) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {zipLoading ? '⏳' : '📦'} Download ZIP
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageClick(image);
                      setShowActionsMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      color: '#007bff',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
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

