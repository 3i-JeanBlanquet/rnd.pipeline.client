import React from 'react';

interface SearchFilterPanelProps {
  itemIds?: string;
  onItemIdsChange: (value: string) => void;
  parentIds?: string;
  onParentIdsChange: (value: string) => void;
  onClearFilters: () => void;
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
  onRefresh: () => void;
}

const SearchFilterPanel: React.FC<SearchFilterPanelProps> = ({
  itemIds,
  onItemIdsChange,
  parentIds,
  onParentIdsChange,
  onClearFilters,
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
  onRefresh,
}) => {
  const [showFilters, setShowFilters] = React.useState(false);

  return (
    <div style={{ 
      marginBottom: '20px', 
      backgroundColor: '#f8f9fa', 
      padding: '15px', 
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4 style={{ margin: 0, color: '#333' }}>Search & Filter</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {showFilters ? '▼ Hide Filters' : '▶ Show Filters'}
          </button>
          <button
            onClick={onClearFilters}
            style={{
              padding: '6px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear All
          </button>
          <button
            onClick={onApplyFilters}
            disabled={loading}
            style={{
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontSize: '12px'
            }}
          >
            Apply Filters
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              padding: '6px 12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontSize: '12px'
            }}
          >
            {loading ? 'Loading...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '15px',
          paddingTop: '15px',
          borderTop: '1px solid #dee2e6'
        }}>
          {/* Item IDs Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '500', color: '#333' }}>
              Item IDs (comma or newline separated)
            </label>
            <textarea
              value={itemIds || ''}
              onChange={(e) => onItemIdsChange(e.target.value)}
              placeholder="Enter item IDs, one per line or comma separated"
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                minHeight: '80px',
                resize: 'vertical',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Parent IDs Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '500', color: '#333' }}>
              Parent IDs (comma or newline separated)
            </label>
            <textarea
              value={parentIds || ''}
              onChange={(e) => onParentIdsChange(e.target.value)}
              placeholder="Enter parent IDs, one per line or comma separated"
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                minHeight: '80px',
                resize: 'vertical',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Sort By */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '500', color: '#333' }}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px'
              }}
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
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '500', color: '#333' }}>
              Sort Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Limit */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '500', color: '#333' }}>
              Items Per Page
            </label>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px'
              }}
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '15px',
          paddingTop: '15px',
          borderTop: '1px solid #dee2e6'
        }}>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Showing {itemCount} items (Page {page})
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilterPanel;

