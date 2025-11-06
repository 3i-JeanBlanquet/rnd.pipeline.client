import React from 'react';
import { imageService, ImageData } from '../services';
import { getStatusColor, getStatusTextColor } from '../utils/statusUtils';

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
            justifyContent: 'center'
          }}
        >
          ×
        </button>
        {isError ? (
          <div style={{
            width: '100%',
            height: '400px',
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
              <div>
                {showDepthImage ? 'Depth Image' : showFeatureImage ? 'Feature Image' : 'Image'} Not Available
              </div>
              <div style={{ fontSize: '14px', marginTop: '5px', opacity: 0.7 }}>
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
            <strong>ID:</strong> {image._id}
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
            {showDepthImage 
              ? `${image._id} - Depth Image` 
              : showFeatureImage
                ? `${image._id} - Feature Image`
                : `Image ${image._id}`
            }
          </p>
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              backgroundColor: getStatusColor(image.tilingStatus),
              color: getStatusTextColor(image.tilingStatus)
            }}>
              Tiling: {image.tilingStatus}
            </span>
            <span style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              backgroundColor: getStatusColor(image.featureStatus),
              color: getStatusTextColor(image.featureStatus)
            }}>
              Features: {image.featureStatus}
            </span>
            <span style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              backgroundColor: getStatusColor(image.depthStatus),
              color: getStatusTextColor(image.depthStatus)
            }}>
              Depth: {image.depthStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;

