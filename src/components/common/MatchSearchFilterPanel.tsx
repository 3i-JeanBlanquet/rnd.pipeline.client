import React from 'react';
import styles from './MatchSearchFilterPanel.module.css';

interface MatchSearchFilterPanelProps {
  matchIds?: string;
  onMatchIdsChange: (value: string) => void;
  itemId0?: string;
  onItemId0Change: (value: string) => void;
  itemId1?: string;
  onItemId1Change: (value: string) => void;
  sortBy: 'createdAt' | 'updatedAt' | '_id' | 'itemId0' | 'itemId1';
  onSortByChange: (value: 'createdAt' | 'updatedAt' | '_id' | 'itemId0' | 'itemId1') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  page: number;
  limit: number;
  onLimitChange: (value: number) => void;
  loading: boolean;
  itemCount: number;
  onApplyFilters: () => void;
}

const MatchSearchFilterPanel: React.FC<MatchSearchFilterPanelProps> = ({
  matchIds,
  onMatchIdsChange,
  itemId0,
  onItemId0Change,
  itemId1,
  onItemId1Change,
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
            onClick={() => setShowFilters(!showFilters)}
            className={styles.button}
          >
            {showFilters ? '▼ Hide Filters' : '▶ Show Filters'}
          </button>
          <button
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
          {/* Match IDs Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>
              Match IDs (comma or newline separated)
            </label>
            <textarea
              value={matchIds || ''}
              onChange={(e) => onMatchIdsChange(e.target.value)}
              placeholder="Enter match IDs, one per line or comma separated"
              className={styles.textarea}
            />
          </div>

          {/* Item ID 0 Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>
              Item ID 0
            </label>
            <input
              type="text"
              value={itemId0 || ''}
              onChange={(e) => onItemId0Change(e.target.value)}
              placeholder="Enter item ID 0"
              className={styles.input}
            />
          </div>

          {/* Item ID 1 Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>
              Item ID 1
            </label>
            <input
              type="text"
              value={itemId1 || ''}
              onChange={(e) => onItemId1Change(e.target.value)}
              placeholder="Enter item ID 1"
              className={styles.input}
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
              <option value="itemId0">Item ID 0</option>
              <option value="itemId1">Item ID 1</option>
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

export default MatchSearchFilterPanel;

