import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ImageData, ApiError, matchService, imageService, ProcessingStatus } from '../../services';
import { GetItemsRequest } from '../../models';
import { previewPlaceholder } from '../common/previewPlaceholder';
import styles from './MatchCreate.module.css';

interface MatchCreateProps {
  onCreateSuccess?: () => void;
}

const MatchCreate: React.FC<MatchCreateProps> = ({ onCreateSuccess }) => {
  const [candidateImages, setCandidateImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage0, setSelectedImage0] = useState<ImageData | null>(null);
  const [selectedImage1, setSelectedImage1] = useState<ImageData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterItemIds, setFilterItemIds] = useState<string>('');

  // Helper function to parse item IDs from input string
  const parseItemIds = (idsString: string): string[] => {
    if (!idsString || idsString.trim() === '') return [];
    return idsString
      .split(/[,\n]/)
      .map(id => id.trim())
      .filter(id => id.length > 0);
  };

  // Fetch candidate images with featureStatus = PROCESSED; when filter IDs are set, ask the API for those items
  const fetchCandidateImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const itemIdsList = parseItemIds(filterItemIds);
      const request: GetItemsRequest = {
        limit: 100,
        filter: {
          featureStatus: ProcessingStatus.PROCESSED,
          ...(itemIdsList.length > 0 ? { ids: itemIdsList } : {})
        }
      };
      
      const response = await imageService.getImages(100, request);
      console.log('Candidate images API Response:', response);
      
      // Handle different response structures
      let imagesData = response.data;
      let imagesList: ImageData[] = [];
      
      if (Array.isArray(imagesData)) {
        imagesList = imagesData;
      } else if (imagesData && typeof imagesData === 'object' && 'items' in imagesData && Array.isArray((imagesData as any).items)) {
        imagesList = (imagesData as any).items;
      } else if (imagesData && typeof imagesData === 'object' && 'data' in imagesData && Array.isArray((imagesData as any).data)) {
        imagesList = (imagesData as any).data;
      } else {
        console.warn('Unexpected response structure:', imagesData);
        imagesList = [];
      }
      
      // Filter images that have a parentId
      const imagesWithParentId = imagesList.filter(img => img.parentId);
      setCandidateImages(imagesWithParentId);
    } catch (err) {
      console.error('Failed to fetch candidate images:', err);
      const apiError = err as ApiError;
      setError(`Failed to fetch images: ${apiError.message}`);
      setCandidateImages([]);
    } finally {
      setLoading(false);
    }
  }, [filterItemIds]);

  const isInitialMount = useRef(true);

  // Initial load + refetch from backend when filter IDs change (debounced after first paint)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      void fetchCandidateImages();
      return;
    }
    const t = window.setTimeout(() => {
      void fetchCandidateImages();
    }, 450);
    return () => window.clearTimeout(t);
  }, [fetchCandidateImages]);

  // Filter images that have a parentId and completed feature status
  const imagesWithFeature = candidateImages.filter(img => 
  {
    return img.parentId && img.featureStatus === ProcessingStatus.PROCESSED;
  }
  );

  // Apply item ID filter if provided
  const filteredImages = React.useMemo(() => {
    const itemIdsList = parseItemIds(filterItemIds);
    if (itemIdsList.length === 0) {
      return imagesWithFeature;
    }
    return imagesWithFeature.filter(img => itemIdsList.includes(img._id));
  }, [imagesWithFeature, filterItemIds]);

  const handleSelectImage = (image: ImageData, slot: 0 | 1) => {
    if (slot === 0) {
      setSelectedImage0(image);
    } else {
      setSelectedImage1(image);
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage0 || !selectedImage1) {
      setError('Please select two images');
      return;
    }

    if (selectedImage0._id === selectedImage1._id) {
      setError('Please select two different images');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log('Creating match:', {
        itemId: selectedImage0._id,
        itemId2: selectedImage1._id
      });

      await matchService.createMatch(selectedImage0._id, selectedImage1._id);
      
      console.log('Match created successfully');
      setSelectedImage0(null);
      setSelectedImage1(null);
      onCreateSuccess?.();
    } catch (err) {
      console.error('Failed to create match:', err);
      const apiError = err as ApiError;
      setError(`Failed to create match: ${apiError.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearSelection = (slot: 0 | 1) => {
    if (slot === 0) {
      setSelectedImage0(null);
    } else {
      setSelectedImage1(null);
    }
    setError(null);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ marginBottom: '10px', color: '#333' }}>Select Two faces</h3>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
              Only images with a parent ID and completed feature processing can be used to create matches
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              fetchCandidateImages();
            }}
            disabled={loading}
            style={{
              padding: '6px 12px',
              backgroundColor: loading ? '#6c757d' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              height: 'fit-content',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#218838';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#666';
              }
            }}
          >
            <span>↻</span>
            {loading ? 'Loading...' : 'Refresh Images'}
          </button>
        </div>

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

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            Loading candidate images...
          </div>
        ) : imagesWithFeature.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            No images with feature processing available. Images must have a parent ID and completed feature processing to create matches.
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {/* First Image Selection */}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#333' }}>
                  First Image {selectedImage0 && `(${selectedImage0._id})`}
                </label>
                {selectedImage0 ? (
                  <div style={{
                    border: '2px solid #28a745',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: '#f8fff9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                      {previewPlaceholder('Feature', '80px')}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                          <strong>Parent:</strong> {selectedImage0.parentId}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          <strong>ID:</strong> {selectedImage0._id}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleClearSelection(0)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    No image selected
                  </div>
                )}
              </div>

              {/* Second Image Selection */}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#333' }}>
                  Second Image {selectedImage1 && `(${selectedImage1._id})`}
                </label>
                {selectedImage1 ? (
                  <div style={{
                    border: '2px solid #17a2b8',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: '#f0f9fb'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                      {previewPlaceholder('Feature', '80px')}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                          <strong>Parent:</strong> {selectedImage1.parentId}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          <strong>ID:</strong> {selectedImage1._id}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleClearSelection(1)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    No image selected
                  </div>
                )}
              </div>
            </div>

            {/* Filter Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                Filter by Item IDs (comma or newline separated)
              </label>
              <textarea
                value={filterItemIds}
                onChange={(e) => setFilterItemIds(e.target.value)}
                placeholder="Enter item IDs separated by commas or newlines, e.g., id1, id2, id3"
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              {filterItemIds.trim() && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
                  Showing {filteredImages.length} of {imagesWithFeature.length} images
                  {filteredImages.length === 0 && filterItemIds.trim() && (
                    <span style={{ color: '#dc3545', marginLeft: '8px' }}>
                      (No matches found for the provided IDs)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Image Selection Grid */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#333' }}>
                Available Feature Images ({filteredImages.length})
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '10px',
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                {filteredImages.length === 0 ? (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '20px',
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    {filterItemIds.trim() 
                      ? 'No images match the provided item IDs'
                      : 'No images available'}
                  </div>
                ) : (
                  filteredImages.map((image) => {
                  const isSelected0 = selectedImage0?._id === image._id;
                  const isSelected1 = selectedImage1?._id === image._id;
                  const isSelected = isSelected0 || isSelected1;

                  return (
                    <div
                      key={image._id}
                      onClick={() => {
                        if (isSelected0) {
                          setSelectedImage0(null);
                        } else if (isSelected1) {
                          setSelectedImage1(null);
                        } else if (!selectedImage0) {
                          handleSelectImage(image, 0);
                        } else if (!selectedImage1) {
                          handleSelectImage(image, 1);
                        }
                      }}
                      style={{
                        position: 'relative',
                        cursor: isSelected ? 'not-allowed' : 'pointer',
                        opacity: isSelected ? 0.5 : 1,
                        border: isSelected ? '3px solid #007bff' : '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '4px',
                        backgroundColor: '#fff',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {previewPlaceholder('Feature', '100%')}
                      <div style={{
                        marginTop: '4px',
                        fontSize: '10px',
                        color: '#666',
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {image.parentId}
                      </div>
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          backgroundColor: '#666',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {isSelected0 ? '1' : '2'}
                        </div>
                      )}
                    </div>
                  );
                  })
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedImage0(null);
                  setSelectedImage1(null);
                  setError(null);
                }}
                disabled={submitting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                  fontSize: '14px'
                }}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedImage0 || !selectedImage1}
                style={{
                  padding: '8px 16px',
                  backgroundColor: (submitting || !selectedImage0 || !selectedImage1) ? '#6c757d' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (submitting || !selectedImage0 || !selectedImage1) ? 'not-allowed' : 'pointer',
                  opacity: (submitting || !selectedImage0 || !selectedImage1) ? 0.6 : 1,
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {submitting ? 'Creating Match...' : 'Create Match'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default MatchCreate;

