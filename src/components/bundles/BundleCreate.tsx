import React, { useState, useEffect } from 'react';
import { ImageData, ApiError, imageService, bundleService } from '../../services';
import { GetItemsRequest } from '../../models';
import ImageFallback from '../images/ImageFallback';
import styles from './BundleCreate.module.css';

interface BundleCreateProps {
  onCreateSuccess: () => void;
}

const BundleCreate: React.FC<BundleCreateProps> = ({ onCreateSuccess }) => {
  const [candidateImages, setCandidateImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Fetch parent items (images with parentId)
  const fetchParentItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const request: GetItemsRequest = {
        limit: 200,
        filter: {}
      };
      
      const response = await imageService.getImages(200, request);
      console.log('Parent items API Response:', response);
      
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
      
      // Filter images that have a parentId (these are the parent items)
      const parentItems = imagesList.filter(img => img.parentId);
      setCandidateImages(parentItems);
    } catch (err) {
      console.error('Failed to fetch parent items:', err);
      const apiError = err as ApiError;
      setError(`Failed to fetch items: ${apiError.message}`);
      setCandidateImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch images on component mount
  useEffect(() => {
    fetchParentItems();
  }, []);

  const handleImageError = (imageId: string, imageType: string) => {
    const errorKey = `${imageId}-${imageType}`;
    setImageErrors(prev => new Set(prev).add(errorKey));
  };

  const isImageError = (imageId: string, imageType: string): boolean => {
    const errorKey = `${imageId}-${imageType}`;
    return imageErrors.has(errorKey);
  };

  const handleToggleSelection = (itemId: string) => {
    const newSelected = new Set(selectedItemIds);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItemIds(newSelected);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItemIds.size === 0) {
      setError('Please select at least one parent item');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const itemIdsArray = Array.from(selectedItemIds);
      console.log('Creating bundle with itemIds:', itemIdsArray);

      await bundleService.createBundle(itemIdsArray);
      
      console.log('Bundle created successfully');
      setSelectedItemIds(new Set());
      onCreateSuccess();
    } catch (err) {
      console.error('Failed to create bundle:', err);
      const apiError = err as ApiError;
      setError(`Failed to create bundle: ${apiError.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedItemIds(new Set());
    setError(null);
  };

  const handleCopyItemIds = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const button = e.currentTarget;
    if (!button) return;
    
    if (selectedItemIds.size === 0) {
      alert('No items selected to copy');
      return;
    }
    
    try {
      const itemIdsString = Array.from(selectedItemIds).join(',');
      await navigator.clipboard.writeText(itemIdsString);
      console.log('Item IDs copied to clipboard');
      // Show a temporary success message
      const originalText = button.textContent || '';
      button.textContent = '✓ Copied!';
      setTimeout(() => {
        if (button) {
          button.textContent = originalText;
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy item IDs to clipboard. Please try again.');
    }
  };

  // Group images by parentId for better display
  const groupedByParent = candidateImages.reduce((acc, img) => {
    const parentId = img.parentId || 'unknown';
    if (!acc[parentId]) {
      acc[parentId] = [];
    }
    acc[parentId].push(img);
    return acc;
  }, {} as Record<string, ImageData[]>);

  const uniqueParentIds = Object.keys(groupedByParent);

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ marginBottom: '10px', color: '#333' }}>Select Parent Items</h3>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
              Select parent items to create a bundle. Selected: {selectedItemIds.size} item(s)
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              fetchParentItems();
              setImageErrors(new Set()); // Clear image errors on refresh
            }}
            disabled={loading}
            style={{
              padding: '6px 12px',
              backgroundColor: loading ? '#6c757d' : '#28a745',
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
                e.currentTarget.style.backgroundColor = '#28a745';
              }
            }}
          >
            <span>↻</span>
            {loading ? 'Loading...' : 'Refresh Items'}
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
            Loading parent items...
          </div>
        ) : uniqueParentIds.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            No parent items found. Parent items are images that have a parent ID.
          </div>
        ) : (
          <>
            {/* Selected Items Summary */}
            {selectedItemIds.size > 0 && (
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#e7f3ff',
                borderRadius: '8px',
                border: '1px solid #b3d9ff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ color: '#0066cc' }}>Selected Items ({selectedItemIds.size}):</strong>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleCopyItemIds}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                      title="Copy selected item IDs to clipboard"
                    >
                      📋 Copy IDs
                    </button>
                    <button
                      type="button"
                      onClick={handleClearSelection}
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
                      Clear All
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {Array.from(selectedItemIds).map((itemId) => (
                    <span
                      key={itemId}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#fff',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        border: '1px solid #b3d9ff'
                      }}
                    >
                      {itemId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Parent Items Grid */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#333' }}>
                Available Parent Items ({uniqueParentIds.length} parents)
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                {uniqueParentIds.map((parentId) => {
                  const items = groupedByParent[parentId];
                  const firstItem = items[0];
                  const isSelected = selectedItemIds.has(parentId);

                  return (
                    <div
                      key={parentId}
                      onClick={() => handleToggleSelection(parentId)}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        opacity: isSelected ? 0.7 : 1,
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
                      {isImageError(firstItem._id, 'main') ? (
                        <ImageFallback imageType="Image" size="100%" />
                      ) : (
                        <img
                          src={imageService.getImageUrl(firstItem)}
                          alt={`Parent ${parentId}`}
                          onError={() => handleImageError(firstItem._id, 'main')}
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            display: 'block'
                          }}
                        />
                      )}
                      <div style={{
                        marginTop: '4px',
                        fontSize: '10px',
                        color: '#666',
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: '500'
                      }}>
                        {parentId}
                      </div>
                      <div style={{
                        marginTop: '2px',
                        fontSize: '9px',
                        color: '#999',
                        textAlign: 'center'
                      }}>
                        {items.length} item(s)
                      </div>
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={handleClearSelection}
                disabled={submitting || selectedItemIds.size === 0}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (submitting || selectedItemIds.size === 0) ? 'not-allowed' : 'pointer',
                  opacity: (submitting || selectedItemIds.size === 0) ? 0.6 : 1,
                  fontSize: '14px'
                }}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={submitting || selectedItemIds.size === 0}
                style={{
                  padding: '8px 16px',
                  backgroundColor: (submitting || selectedItemIds.size === 0) ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (submitting || selectedItemIds.size === 0) ? 'not-allowed' : 'pointer',
                  opacity: (submitting || selectedItemIds.size === 0) ? 0.6 : 1,
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {submitting ? 'Creating Bundle...' : `Create Bundle (${selectedItemIds.size} items)`}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default BundleCreate;

