import React from 'react';
import styles from './ItemSearchFilterPanel.module.css';

interface ItemSearchFilterPanelProps {
  itemIds?: string;
  onItemIdsChange: (value: string) => void;
  parentIds?: string;
  onParentIdsChange: (value: string) => void;
  sortBy: 'createdAt' | 'updatedAt' | '_id' | 'extension' | 'tilingStatus' | 'featureStatus' | 'depthStatus';
  onSortByChange: (value: 'createdAt' | 'updatedAt' | '_id' | 'extension' | 'tilingStatus' | 'featureStatus' | 'depthStatus') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  page: number;
  limit: number;
  onLimitChange: (value: number) => void;
  loading: boolean;
  itemCount: number;
  onApplyFilters: () => void;
}

const ItemSearchFilterPanel: React.FC<ItemSearchFilterPanelProps> = ({
  itemIds,
  onItemIdsChange,
  parentIds,
  onParentIdsChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  page,
  limit,
  onLimitChange,
  loading,
  itemCount,
  onApplyFilters,
}) => {
  const [showFilters, setShowFilters] = React.useState(false);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h4 className={styles.title}>Search & Filter</h4>
        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={styles.button}
          >
            {showFilters ? '▼ Hide Filters' : '▶ Show Filters'}
          </button>
          <button
            type="button"
            onClick={onApplyFilters}
            disabled={loading}
            className={`${styles.button} ${styles.buttonSuccess}`}
          >
            {loading ? 'Loading...' : '↻ Apply & Refresh'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={styles.filtersContainer}>
          {/* Item IDs Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>
              Item IDs (comma or newline separated)
            </label>
            <textarea
              value={itemIds || ''}
              onChange={(e) => onItemIdsChange(e.target.value)}
              placeholder="Enter item IDs, one per line or comma separated"
              className={styles.textarea}
            />
          </div>

          {/* Parent IDs Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>
              Parent IDs (comma or newline separated)
            </label>
            <textarea
              value={parentIds || ''}
              onChange={(e) => onParentIdsChange(e.target.value)}
              placeholder="Enter parent IDs, one per line or comma separated"
              className={styles.textarea}
            />
          </div>

          {/* Sort By */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className={styles.select}
            >
              <option value="createdAt">Created At</option>
              <option value="updatedAt">Updated At</option>
              <option value="_id">ID</option>
              <option value="extension">Extension</option>
              <option value="tilingStatus">Tiling Status</option>
              <option value="featureStatus">Feature Status</option>
              <option value="depthStatus">Depth Status</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>
              Sort Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
              className={styles.select}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Limit */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>
              Items Per Page
            </label>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className={styles.select}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && itemCount > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {itemCount} items (Page {page})
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemSearchFilterPanel;

