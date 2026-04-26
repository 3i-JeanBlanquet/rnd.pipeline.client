import React, { useState, useEffect } from 'react';
import { ImageData, ApiError, imageService } from '../../services';
import { GetItemsRequest, ItemFilterRequest } from '../../models';
import ItemRow from './ItemRow';
import ItemSearchFilterPanel from '../common/ItemSearchFilterPanel';
import styles from './ItemGallery.module.css';

interface ItemGalleryProps {
  // Self-contained: loads items from the API
}

const ItemGallery: React.FC<ItemGalleryProps> = () => {
  const [items, setItems] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemIds, setItemIds] = useState<string>('');
  const [parentIds, setParentIds] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | '_id' | 'extension' | 'tilingStatus' | 'featureStatus' | 'depthStatus'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const parseIdsString = (idsString: string): string[] => {
    if (!idsString || idsString.trim() === '') return [];
    return idsString
      .split(/[,\n]/)
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
  };

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const itemIdsList = parseIdsString(itemIds);
      const parentIdsList = parseIdsString(parentIds);

      const filter: ItemFilterRequest = {};
      if (itemIdsList.length > 0) {
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
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      };

      const response = await imageService.getImages(limit, request);
      console.log('Items API Response:', response);

      let itemsData = response.data;
      let itemsList: ImageData[] = [];

      if (Array.isArray(itemsData)) {
        itemsList = itemsData;
      } else if (itemsData && typeof itemsData === 'object' && 'items' in itemsData && Array.isArray((itemsData as any).items)) {
        itemsList = (itemsData as any).items;
      } else if (itemsData && typeof itemsData === 'object' && 'data' in itemsData && Array.isArray((itemsData as any).data)) {
        itemsList = (itemsData as any).data;
      } else {
        console.warn('Unexpected response structure:', itemsData);
        itemsList = [];
      }

      setItems(itemsList);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      const apiError = err as ApiError;
      setError(`Failed to fetch items: ${apiError.message}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, limit, sortBy, sortOrder]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <>
      <div className={styles.container}>
        <ItemSearchFilterPanel
          itemIds={itemIds}
          onItemIdsChange={(value) => {
            setItemIds(value);
            setPage(1);
          }}
          parentIds={parentIds}
          onParentIdsChange={(value) => {
            setParentIds(value);
            setPage(1);
          }}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          page={page}
          limit={limit}
          onLimitChange={handleLimitChange}
          loading={loading}
          itemCount={items.length}
          onApplyFilters={() => {
            setPage(1);
            fetchItems();
          }}
        />

        {!loading && items.length > 0 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
              className={styles.paginationButton}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={items.length < limit || loading}
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

        {loading && (!Array.isArray(items) || items.length === 0) ? (
          <div className={styles.loadingMessage}>Loading items…</div>
        ) : !Array.isArray(items) || items.length === 0 ? (
          <div className={styles.emptyMessage}>No items found. Upload above to add files.</div>
        ) : (
          <div className={styles.itemList}>
            {items.map((row) => (
              <ItemRow key={row._id} item={row} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ItemGallery;
