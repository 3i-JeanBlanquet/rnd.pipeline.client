import React from 'react';

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
            onClick={onApplyFilters}
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
            {loading ? 'Loading...' : '↻ Apply & Refresh'}
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
          {/* Match IDs Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '500', color: '#333' }}>
              Match IDs (comma or newline separated)
            </label>
            <textarea
              value={matchIds || ''}
              onChange={(e) => onMatchIdsChange(e.target.value)}
              placeholder="Enter match IDs, one per line or comma separated"
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

          {/* Item ID 0 Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '500', color: '#333' }}>
              Item ID 0
            </label>
            <input
              type="text"
              value={itemId0 || ''}
              onChange={(e) => onItemId0Change(e.target.value)}
              placeholder="Enter item ID 0"
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Item ID 1 Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '500', color: '#333' }}>
              Item ID 1
            </label>
            <input
              type="text"
              value={itemId1 || ''}
              onChange={(e) => onItemId1Change(e.target.value)}
              placeholder="Enter item ID 1"
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
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
              <option value="itemId0">Item ID 0</option>
              <option value="itemId1">Item ID 1</option>
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

export default MatchSearchFilterPanel;

