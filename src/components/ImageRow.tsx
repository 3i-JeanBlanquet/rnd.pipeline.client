import React, { useState, useEffect, useRef } from 'react';
import { imageService, ImageData } from '../services';
import { ProcessingStatus } from '../models/ProcessingStatus';

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
  const imageRef = useRef<ImageData>(initialImage);
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

  const handleRunPano = async () => {
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
    } finally {
      setPanoLoading(false);
    }
  };

  const handleRunFeature = async () => {
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
    } finally {
      setFeatureLoading(false);
    }
  };

  const handleRunDepth = async () => {
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

  return (
    <tr style={{ borderBottom: '1px solid #e9ecef' }}>
      <td style={{ padding: '8px' }}>
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
      </td>
      <td style={{ padding: '8px' }}>
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
            {image.depthStatus === ProcessingStatus.PROCESSING ? 'Processing...' : 'No Depth'}
          </div>
        )}
      </td>
      <td style={{ padding: '8px' }}>
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
            {image.featureStatus === ProcessingStatus.PROCESSING ? 'Processing...' : 'No Feature'}
          </div>
        )}
      </td>
      <td style={{ padding: '4px', fontSize: '12px', color: '#333' }}>
        {image.parentId ? (
          <div>
            <div>{image.parentId}</div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>/{image._id}</div>
          </div>
        ) : (
          image._id
        )}
      </td>
      <td style={{ padding: '8px' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '4px',
          alignItems: 'flex-start'
        }}>
          {image.parentId && (
            <button
              onClick={handleRunFeature}
              disabled={featureLoading}
              style={{
                padding: '5px 10px',
                backgroundColor: featureLoading ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: featureLoading ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                opacity: featureLoading ? 0.6 : 1,
                transition: 'all 0.2s ease',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!featureLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {featureLoading ? 'Running...' : 'Feature'}
            </button>
          )}
          {image.parentId && (
            <button
              onClick={handleRunDepth}
              disabled={depthLoading}
              style={{
                padding: '5px 10px',
                backgroundColor: depthLoading ? '#6c757d' : '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: depthLoading ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                opacity: depthLoading ? 0.6 : 1,
                transition: 'all 0.2s ease',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!depthLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {depthLoading ? 'Running...' : 'Depth'}
            </button>
          )}
          {!image.parentId && (
            <button
              onClick={handleRunPano}
              disabled={panoLoading}
              style={{
                padding: '5px 10px',
                backgroundColor: panoLoading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: panoLoading ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                opacity: panoLoading ? 0.6 : 1,
                transition: 'all 0.2s ease',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!panoLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {panoLoading ? 'Running...' : 'Pano'}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ImageRow;

