import React, { useState, useEffect } from 'react';
import { ImageData, ApiError, imageService } from '../../services';
import { GetItemsRequest, ItemFilterRequest } from '../../models';
import ImageRow from './ImageRow';
import ImageModal from './ImageModal';
import SearchFilterPanel from '../common/SearchFilterPanel';
import styles from './ImageGallery.module.css';

interface ImageGalleryProps {
  // Component is now self-contained and manages its own data
}

const ImageGallery: React.FC<ImageGalleryProps> = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [showDepthImage, setShowDepthImage] = useState(false);
  const [showFeatureImage, setShowFeatureImage] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  // Filter and sort state
  const [itemIds, setItemIds] = useState<string>('');
  const [parentIds, setParentIds] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | '_id' | 'extension' | 'tilingStatus' | 'featureStatus' | 'depthStatus'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const handleImageClick = (image: ImageData) => {
    setSelectedImage(image);
    setShowDepthImage(false);
    setShowFeatureImage(false);
  };

  const handleDepthImageClick = (image: ImageData) => {
    setSelectedImage(image);
    setShowDepthImage(true);
    setShowFeatureImage(false);
  };

  const handleFeatureImageClick = (image: ImageData) => {
    setSelectedImage(image);
    setShowDepthImage(false);
    setShowFeatureImage(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setShowDepthImage(false);
    setShowFeatureImage(false);
  };

  const handleImageError = (imageId: string, imageType: string) => {
    const errorKey = `${imageId}-${imageType}`;
    setImageErrors(prev => new Set(prev).add(errorKey));
  };

  const isImageError = (imageId: string, imageType: string): boolean => {
    const errorKey = `${imageId}-${imageType}`;
    return imageErrors.has(errorKey);
  };

  // Helper function to parse IDs string into array
  const parseIdsString = (idsString: string): string[] => {
    if (!idsString || idsString.trim() === '') return [];
    return idsString
      .split(/[,\n]/)
      .map(id => id.trim())
      .filter(id => id.length > 0);
  };

  // Fetch images with filters
  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parse itemIds and parentIds
      const itemIdsList = parseIdsString(itemIds);
      const parentIdsList = parseIdsString(parentIds);
      
      // Build filter object
      // Note: If multiple IDs are provided, we'll use the first one for now
      // If API supports multiple IDs, we can extend this to send comma-separated or array
      const filter: ItemFilterRequest = {};
      if (itemIdsList.length > 0) {
        // For multiple IDs, join with comma or use first one
        // Adjust based on API support
        filter._id = itemIdsList.length === 1 ? itemIdsList[0] : itemIdsList.join(',');
      }
      if (parentIdsList.length > 0) {
        filter.parentId = parentIdsList.length === 1 ? parentIdsList[0] : parentIdsList.join(',');
      }
      
      const request: GetItemsRequest = {
        page,
        limit,
        sortBy,
        sortOrder,
        filter: Object.keys(filter).length > 0 ? filter : undefined
      };
      
      const response = await imageService.getImages(limit, request);
      console.log('Images API Response:', response);
      
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
      
      setImages(imagesList);
    } catch (err) {
      console.error('Failed to fetch images:', err);
      const apiError = err as ApiError;
      setError(`Failed to fetch images: ${apiError.message}`);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch images on mount and when filters/sort change
  useEffect(() => {
    fetchImages();
  }, [page, limit, sortBy, sortOrder]);

  // Handle limit change
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <>
      <div>
        {/* Search and Filter Panel */}
        <SearchFilterPanel
          itemIds={itemIds}
          onItemIdsChange={(value) => { setItemIds(value); setPage(1); }}
          parentIds={parentIds}
          onParentIdsChange={(value) => { setParentIds(value); setPage(1); }}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          page={page}
          limit={limit}
          onLimitChange={handleLimitChange}
          loading={loading}
          itemCount={images.length}
          onApplyFilters={() => { setPage(1); fetchImages(); }}
        />

        {/* Pagination Controls */}
        {!loading && images.length > 0 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
              className={styles.paginationButton}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={images.length < limit || loading}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (!Array.isArray(images) || images.length === 0) ? (
          <div className={styles.loadingMessage}>
            Loading images...
          </div>
        ) : !Array.isArray(images) || images.length === 0 ? (
          <div className={styles.emptyMessage}>
            No images found. Upload your first image above!
          </div>
        ) : (
          <div className={styles.imageList}>
            {images.map((image) => (
              <ImageRow
                key={image._id}
                image={image}
                onImageClick={handleImageClick}
                onDepthImageClick={handleDepthImageClick}
                onFeatureImageClick={handleFeatureImageClick}
              />
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          showDepthImage={showDepthImage}
          showFeatureImage={showFeatureImage}
          onClose={closeImageModal}
          onImageError={handleImageError}
          isImageError={isImageError}
        />
      )}
    </>
  );
};

export default ImageGallery;
