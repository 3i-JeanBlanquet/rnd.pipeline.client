import React, { useState } from 'react';
import styles from './ItemSearchFilterPanel.module.css';

interface BundleSearchFilterPanelProps {
  bundleIds?: string;
  onBundleIdsChange: (value: string) => void;
  sortBy: 'createdAt' | 'updatedAt' | '_id';
  onSortByChange: (value: 'createdAt' | 'updatedAt' | '_id') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  page: number;
  limit: number;
  onLimitChange: (value: number) => void;
  loading: boolean;
  itemCount: number;
  onApplyFilters: () => void;
}

const BundleSearchFilterPanel: React.FC<BundleSearchFilterPanelProps> = ({
  bundleIds,
  onBundleIdsChange,
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
  const [showFilters, setShowFilters] = useState(false);

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
          {/* Bundle IDs Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>
              Bundle IDs (comma or newline separated)
            </label>
            <textarea
              value={bundleIds || ''}
              onChange={(e) => onBundleIdsChange(e.target.value)}
              placeholder="Enter bundle IDs, one per line or comma separated"
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

export default BundleSearchFilterPanel;
