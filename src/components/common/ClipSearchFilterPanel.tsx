import React from 'react';
import styles from './ItemSearchFilterPanel.module.css';

interface ClipSearchFilterPanelProps {
  clipIds?: string;
  onClipIdsChange: (value: string) => void;
  extension?: string;
  onExtensionChange: (value: string) => void;
  isProcessed?: string;
  onIsProcessedChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  page: number;
  limit: number;
  onLimitChange: (value: number) => void;
  loading: boolean;
  clipCount: number;
  onApplyFilters: () => void;
}

const ClipSearchFilterPanel: React.FC<ClipSearchFilterPanelProps> = ({
  clipIds,
  onClipIdsChange,
  extension,
  onExtensionChange,
  isProcessed,
  onIsProcessedChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  page,
  limit,
  onLimitChange,
  loading,
  clipCount,
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
          {/* Clip IDs Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>
              Clip IDs (comma-separated)
            </label>
            <textarea
              value={clipIds || ''}
              onChange={(e) => onClipIdsChange(e.target.value)}
              placeholder="Enter clip IDs, comma separated"
              className={styles.textarea}
            />
          </div>

          {/* Extension Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>
              Extension
            </label>
            <input
              type="text"
              value={extension || ''}
              onChange={(e) => onExtensionChange(e.target.value)}
              placeholder="e.g., mp4, mov"
              className={styles.input}
            />
          </div>

          {/* Is Processed Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>
              Processed Status
            </label>
            <select
              value={isProcessed || ''}
              onChange={(e) => onIsProcessedChange(e.target.value)}
              className={styles.select}
            >
              <option value="">All</option>
              <option value="true">Processed</option>
              <option value="false">Not Processed</option>
            </select>
          </div>

          {/* Sort By */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className={styles.select}
            >
              <option value="createdAt">Created At</option>
              <option value="updatedAt">Updated At</option>
              <option value="_id">ID</option>
              <option value="extension">Extension</option>
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
              Clips Per Page
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
      {!loading && clipCount > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {clipCount} clips (Page {page})
          </div>
        </div>
      )}
    </div>
  );
};

export default ClipSearchFilterPanel;

