import React, { useState, useEffect } from 'react';
import { BundleData, imageService, bundleService, ProcessingStatus } from '../../services';
import { ImageData, GetItemsRequest } from '../../models';
import { ItemStorage } from '../../common/item.storage';
import { config } from '../../config/env';

interface BundleResearchModalProps {
  bundle: BundleData;
  isOpen: boolean;
  onClose: () => void;
}

const BundleResearchModal: React.FC<BundleResearchModalProps> = ({
  bundle,
  isOpen,
  onClose
}) => {
  const [researchImages, setResearchImages] = useState<ImageData[]>([]);
  const [loadingResearchImages, setLoadingResearchImages] = useState(false);
  const [selectedResearchImage, setSelectedResearchImage] = useState<ImageData | null>(null);
  const [processingResearch, setProcessingResearch] = useState(false);
  const [researchResults, setResearchResults] = useState<string[]>([]);
  const [researchResultImages, setResearchResultImages] = useState<ImageData[]>([]);
  const [loadingResultImages, setLoadingResultImages] = useState(false);
  const [researchImageFilter, setResearchImageFilter] = useState<string>('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadResearchImages();
    } else {
      // Reset state when modal closes
      setResearchImages([]);
      setSelectedResearchImage(null);
      setResearchResults([]);
      setResearchResultImages([]);
      setResearchImageFilter('');
      setShowResults(false);
    }
  }, [isOpen]);

  const loadResearchImages = async () => {
    setLoadingResearchImages(true);
    setSelectedResearchImage(null);
    setResearchResults([]);
    setResearchImageFilter('');
    
    try {
      const request: GetItemsRequest = {
        limit: 200,
        filter: {
          featureStatus: ProcessingStatus.PROCESSED
        }
      };
      
      const response = await imageService.getImages(200, request);
      let imagesData = response.data;
      let imagesList: ImageData[] = [];
      
      if (Array.isArray(imagesData)) {
        imagesList = imagesData;
      } else if (imagesData && typeof imagesData === 'object' && 'items' in imagesData && Array.isArray((imagesData as any).items)) {
        imagesList = (imagesData as any).items;
      } else if (imagesData && typeof imagesData === 'object' && 'data' in imagesData && Array.isArray((imagesData as any).data)) {
        imagesList = (imagesData as any).data;
      }
      
      // Set all images with featureStatus PROCESSED (no parentId filter)
      setResearchImages(imagesList);
    } catch (err) {
      console.error('Failed to fetch research images:', err);
      alert('Failed to fetch feature processed images. Please try again.');
      setResearchImages([]);
    } finally {
      setLoadingResearchImages(false);
    }
  };

  const handleProcessResearch = async () => {
    if (!selectedResearchImage) {
      alert('Please select an image first');
      return;
    }

    setProcessingResearch(true);
    setLoadingResultImages(true);
    setShowResults(false);
    
    try {
      const response = await bundleService.research(bundle._id, selectedResearchImage._id);
      let resultIds: string[] = [];
      
      // Response structure: { data: { data: [...], msgCode: "OK", code: 201 } }
      // The actual array is in response.data.data
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data)) {
        resultIds = responseData.data.map((item: { itemId: string; distance: number }) => item.itemId);
      } else if (Array.isArray(response.data)) {
        // Fallback: if response.data is directly an array
        resultIds = response.data.map((item: { itemId: string; distance: number }) => item.itemId);
      }
      
      // Set results first
      setResearchResults([...resultIds]);
      
      // Show results view immediately
      setShowResults(true);
      
      // Fetch item objects for each result ID
      if (resultIds.length > 0) {
        const itemPromises = resultIds.map(async (itemId) => {
          try {
            const itemResponse = await imageService.getImage(itemId);
            // Response structure: { data: { resultCd: 200, resultMsg: "OK", data: {...} } }
            // The actual ImageData is in response.data.data
            let itemData: ImageData;
            if (itemResponse.data && typeof itemResponse.data === 'object' && 'data' in itemResponse.data) {
              itemData = (itemResponse.data as any).data;
            } else {
              // Fallback: if response.data is directly the ImageData
              itemData = itemResponse.data as ImageData;
            }
            
            // Ensure we have a valid ImageData object with required fields
            if (!itemData.extension) {
              itemData.extension = 'jpg'; // Default extension
            }
            return itemData;
          } catch (err) {
            console.error(`Failed to fetch item ${itemId}:`, err);
            // Return a minimal ImageData object if fetch fails
            return { _id: itemId, extension: 'jpg' } as ImageData;
          }
        });
        
        const items = await Promise.all(itemPromises);
        setResearchResultImages([...items]);
      } else {
        setResearchResultImages([]);
      }
    } catch (err) {
      console.error('Research request failed:', err);
      alert('Failed to process research. Please try again.');
      setResearchResults([]);
      setResearchResultImages([]);
      setShowResults(false);
    } finally {
      setProcessingResearch(false);
      setLoadingResultImages(false);
    }
  };

  if (!isOpen) return null;

  const filteredImages = researchImages.filter((image) => {
    if (!researchImageFilter.trim()) return true;
    const filterLower = researchImageFilter.toLowerCase();
    return (
      image._id.toLowerCase().includes(filterLower) ||
      (image.parentId && image.parentId.toLowerCase().includes(filterLower))
    );
  });

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
        zIndex: 2000,
        cursor: 'pointer'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '90%',
          maxHeight: '90%',
          width: '800px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '20px',
          cursor: 'default',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
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
        
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
          {showResults ? 'Research Results' : 'Research - Select Feature Processed Image'}
        </h2>

        {/* Image Selection Section - Hide when results are shown */}
        {!showResults && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#495057', fontWeight: '600' }}>
              Available Images:
            </h3>
            <input
              type="text"
              placeholder="Filter by ID..."
              value={researchImageFilter}
              onChange={(e) => setResearchImageFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                width: '200px',
                outline: 'none'
              }}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {loadingResearchImages ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              Loading images...
            </div>
          ) : researchImages.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              No feature processed images found.
            </div>
          ) : filteredImages.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              No images match the filter "{researchImageFilter}"
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '8px', fontSize: '12px', color: '#6c757d' }}>
                Showing {filteredImages.length} of {researchImages.length} images
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #dee2e6',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {filteredImages.map((image) => {
                  const imageUrl = imageService.getImageUrl(image);
                  const isSelected = selectedResearchImage?._id === image._id;
                  
                  return (
                    <div
                      key={image._id}
                      onClick={() => setSelectedResearchImage(image)}
                      style={{
                        padding: '8px',
                        backgroundColor: isSelected ? '#e7f3ff' : '#fff',
                        borderRadius: '6px',
                        border: `2px solid ${isSelected ? '#007bff' : '#ced4da'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#007bff';
                          e.currentTarget.style.backgroundColor = '#f0f8ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#ced4da';
                          e.currentTarget.style.backgroundColor = '#fff';
                        }
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt={image._id}
                        style={{
                          width: '100%',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span style={{
                        fontSize: '10px',
                        color: '#495057',
                        textAlign: 'center',
                        wordBreak: 'break-all',
                        fontWeight: isSelected ? '600' : '400'
                      }}>
                        {image._id}
                      </span>
                      {image.parentId && (
                        <span style={{
                          fontSize: '9px',
                          color: '#6c757d',
                          textAlign: 'center'
                        }}>
                          Parent: {image.parentId}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        )}

        {/* Process Button - Hide when results are shown */}
        {!showResults && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button
            onClick={handleProcessResearch}
            disabled={!selectedResearchImage || processingResearch}
            style={{
              padding: '10px 20px',
              backgroundColor: !selectedResearchImage || processingResearch ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !selectedResearchImage || processingResearch ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: !selectedResearchImage || processingResearch ? 0.6 : 1
            }}
          >
            {processingResearch ? '⏳ Processing...' : '▶ Process Research'}
          </button>
        </div>
        )}

        {/* Results Gallery Section */}
        {showResults && (
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#495057', fontWeight: '600' }}>
              Research Results ({researchResults.length} images):
            </h3>
            {loadingResultImages ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Loading result images...
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #dee2e6',
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                {researchResultImages.map((image) => {
                  // Use ItemStorage to get the image URL
                  const itemStorage = image.parentId 
                    ? new ItemStorage(image._id, image.extension || 'jpg', image.parentId)
                    : new ItemStorage(image._id, image.extension || 'jpg');
                  const imagePath = itemStorage.getImageFile();
                  const imageUrl = `${config.s3BucketUrl}/${imagePath}`;
                  
                  return (
                    <div
                      key={image._id}
                      style={{
                        padding: '8px',
                        backgroundColor: '#fff',
                        borderRadius: '6px',
                        border: '1px solid #ced4da',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'transform 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt={image._id}
                        style={{
                          width: '100%',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span style={{
                        fontSize: '10px',
                        color: '#495057',
                        textAlign: 'center',
                        wordBreak: 'break-all',
                        fontWeight: '400'
                      }}>
                        {image._id}
                      </span>
                      {image.parentId && (
                        <span style={{
                          fontSize: '9px',
                          color: '#6c757d',
                          textAlign: 'center'
                        }}>
                          Parent: {image.parentId}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BundleResearchModal;

