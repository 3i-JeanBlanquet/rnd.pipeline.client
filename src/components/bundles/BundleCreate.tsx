import React, { useState, useEffect } from 'react';
import { ImageData, ApiError, imageService, bundleService } from '../../services';
import { GetItemsRequest, ItemFilterRequest } from '../../models';
import ImageFallback from '../images/ImageFallback';
import ItemSearchFilterPanel from '../common/ItemSearchFilterPanel';
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
  const [popupImage, setPopupImage] = useState<ImageData | null>(null);

  // Filter and sort state
  const [itemIds, setItemIds] = useState<string>('');
  const [parentIds, setParentIds] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | '_id' | 'extension' | 'tilingStatus' | 'featureStatus' | 'depthStatus'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [limit, setLimit] = useState(200);

  // Helper function to parse IDs string into array
  const parseIdsString = (idsString: string): string[] => {
    if (!idsString || idsString.trim() === '') return [];
    return idsString
      .split(/[,\n]/)
      .map(id => id.trim())
      .filter(id => id.length > 0);
  };

  // Fetch parent items (images with parentId)
  const fetchParentItems = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parse itemIds and parentIds
      const itemIdsList = parseIdsString(itemIds);
      const parentIdsList = parseIdsString(parentIds);
      
      // Build filter object
      const filter: ItemFilterRequest = {};
      if (itemIdsList.length > 0) {
        filter._id = itemIdsList.length === 1 ? itemIdsList[0] : itemIdsList.join(',');
      }
      if (parentIdsList.length > 0) {
        filter.parentId = parentIdsList.length === 1 ? parentIdsList[0] : parentIdsList.join(',');
      }
      
      // Remove limit if itemIds is used
      const hasItemIdsFilter = itemIdsList.length > 0;
      const request: GetItemsRequest = {
        ...(hasItemIdsFilter ? {} : { limit }),
        sortBy,
        sortOrder,
        filter: Object.keys(filter).length > 0 ? filter : undefined
      };
      
      const response = await imageService.getImages(hasItemIdsFilter ? itemIdsList.length : limit, request);
      console.log('Parent items API Response:', response);
      
      // Handle different response structures
      let imagesData = response.data;
      let imagesList: ImageData[] = [];
      
      if (Array.isArray(imagesData)) {
        imagesList = imagesData;
      } else if (imagesData && typeof imagesData === 'object' && 'data' in imagesData && Array.isArray((imagesData as any).data)) {
        // Handle API response structure: {resultCd, resultMsg, data: [...], pagination}
        imagesList = (imagesData as any).data;
      } else if (imagesData && typeof imagesData === 'object' && 'items' in imagesData && Array.isArray((imagesData as any).items)) {
        imagesList = (imagesData as any).items;
      } else {
        console.warn('Unexpected response structure:', imagesData);
        imagesList = [];
      }
      
      // For bundle creation, we want to show all items (not just those with parentId)
      // Items with parentId are child items, items without parentId are parent items
      // Since the API might return items without parentId field, we show all items
      setCandidateImages(imagesList);
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

  const handleSelectAll = () => {
    // Recalculate groupedByParent and uniqueParentIds
    const groupedByParent = candidateImages.reduce((acc, img) => {
      const groupKey = img.parentId || img._id;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(img);
      return acc;
    }, {} as Record<string, ImageData[]>);
    
    const uniqueParentIds = Object.keys(groupedByParent);
    const itemIdsList = parseIdsString(itemIds);
    const shouldLimitItems = itemIdsList.length === 0;
    const displayParentIds = shouldLimitItems ? uniqueParentIds.slice(0, 20) : uniqueParentIds;
    setSelectedItemIds(new Set(displayParentIds));
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
  // Items with parentId are child items (grouped by their parentId)
  // Items without parentId are parent items themselves (grouped by their own _id)
  const groupedByParent = candidateImages.reduce((acc, img) => {
    // Use parentId if it exists, otherwise use the item's own _id (it's a parent item)
    const groupKey = img.parentId || img._id;
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(img);
    return acc;
  }, {} as Record<string, ImageData[]>);

  const uniqueParentIds = Object.keys(groupedByParent);
  
  // Limit to 20 items by default, unless itemIds filter is used
  const itemIdsList = parseIdsString(itemIds);
  const shouldLimitItems = itemIdsList.length === 0;
  const displayParentIds = shouldLimitItems ? uniqueParentIds.slice(0, 20) : uniqueParentIds;

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>Select panorama images</h3>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
            Select panorama images to create a bundle. Selected: {selectedItemIds.size} item(s)
          </p>
        </div>

        {/* Search and Filter Panel */}
        <ItemSearchFilterPanel
          itemIds={itemIds}
          onItemIdsChange={setItemIds}
          parentIds={parentIds}
          onParentIdsChange={setParentIds}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          page={1}
          limit={limit}
          onLimitChange={setLimit}
          loading={loading}
          itemCount={candidateImages.length}
          onApplyFilters={() => {
            fetchParentItems();
            setImageErrors(new Set()); // Clear image errors on refresh
          }}
        />

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontWeight: '500', color: '#333' }}>
                  Panorama images ({uniqueParentIds.length} panoramas{shouldLimitItems && uniqueParentIds.length > 20 ? `, showing first 20` : ''})
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  disabled={displayParentIds.length === 0}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: displayParentIds.length === 0 ? '#6c757d' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: displayParentIds.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: displayParentIds.length === 0 ? 0.6 : 1,
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  Select All ({displayParentIds.length})
                </button>
              </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e9ecef', borderBottom: '2px solid #dee2e6' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#495057', width: '40px' }}>Select</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#495057' }}>Parent ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#495057' }}>Items Count</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#495057' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayParentIds.map((parentId, index) => {
                      const items = groupedByParent[parentId];
                      const firstItem = items[0];
                      const isSelected = selectedItemIds.has(parentId);

                      return (
                        <tr
                          key={parentId}
                          onClick={() => handleToggleSelection(parentId)}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#e7f3ff' : index % 2 === 0 ? '#fff' : '#f8f9fa',
                            borderBottom: '1px solid #dee2e6',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#f0f0f0';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f8f9fa';
                            }
                          }}
                        >
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelection(parentId)}
                              onClick={(e) => e.stopPropagation()}
                              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                            />
                          </td>
                          <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#333' }}>
                            {parentId}
                          </td>
                          <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                            {items.length} item(s)
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPopupImage(firstItem);
                              }}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '500'
                              }}
                            >
                              View Image
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
                  backgroundColor: (submitting || selectedItemIds.size === 0) ? '#6c757d' : '#666',
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

      {/* Image Popup Modal */}
      {popupImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setPopupImage(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPopupImage(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001
              }}
            >
              ×
            </button>
            <div style={{ marginBottom: '15px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', color: '#333', marginBottom: '5px' }}>
                {popupImage._id}
              </div>
              {popupImage.parentId && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Parent ID: {popupImage.parentId}
                </div>
              )}
            </div>
            {isImageError(popupImage._id, 'main') ? (
              <ImageFallback imageType="Image" size="600px" />
            ) : (
              <img
                src={imageService.getImageUrl(popupImage)}
                alt={`Image ${popupImage._id}`}
                onError={() => handleImageError(popupImage._id, 'main')}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '4px',
                  display: 'block'
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BundleCreate;

