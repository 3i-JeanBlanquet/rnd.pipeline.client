import React, { useState, useEffect } from 'react';
import { matchService, MatchData, ApiError } from '../../services';
import { GetMatchesRequest, MatchFilterRequest } from '../../models';
import MatchSearchFilterPanel from '../common/MatchSearchFilterPanel';

interface MatchGalleryProps {
  onDeleteMatch?: (id: string) => void;
}

const MatchGallery: React.FC<MatchGalleryProps> = ({ 
  onDeleteMatch
}) => {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);
  
  // Filter and sort state
  const [matchIds, setMatchIds] = useState<string>('');
  const [itemId0, setItemId0] = useState<string>('');
  const [itemId1, setItemId1] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | '_id' | 'itemId0' | 'itemId1'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const handleMatchClick = (match: MatchData) => {
    setSelectedMatch(match);
  };

  const closeMatchModal = () => {
    setSelectedMatch(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to parse IDs string into array
  const parseIdsString = (idsString: string): string[] => {
    if (!idsString || idsString.trim() === '') return [];
    return idsString
      .split(/[,\n]/)
      .map(id => id.trim())
      .filter(id => id.length > 0);
  };

  // Fetch matches with filters
  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parse matchIds
      const matchIdsList = parseIdsString(matchIds);
      
      // Build filter object
      const filter: MatchFilterRequest = {};
      if (matchIdsList.length > 0) {
        filter.ids = matchIdsList;
      }
      if (itemId0) {
        filter.itemId0 = itemId0.trim();
      }
      if (itemId1) {
        filter.itemId1 = itemId1.trim();
      }
      
      const request: GetMatchesRequest = {
        page,
        limit,
        sortBy,
        sortOrder,
        filter: Object.keys(filter).length > 0 ? filter : undefined
      };
      
      const response = await matchService.getMatches(limit, request);
      console.log('Matches API Response:', response);
      
      // Handle different response structures
      let matchesData = response.data;
      let matchesList: MatchData[] = [];
      
      if (Array.isArray(matchesData)) {
        matchesList = matchesData;
      } else if (matchesData && typeof matchesData === 'object' && 'items' in matchesData && Array.isArray((matchesData as any).items)) {
        matchesList = (matchesData as any).items;
      } else if (matchesData && typeof matchesData === 'object' && 'data' in matchesData && Array.isArray((matchesData as any).data)) {
        matchesList = (matchesData as any).data;
      } else {
        console.warn('Unexpected response structure:', matchesData);
        matchesList = [];
      }
      
      setMatches(matchesList);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
      const apiError = err as ApiError;
      setError(`Failed to fetch matches: ${apiError.message}`);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch matches on mount and when filters/sort change
  useEffect(() => {
    fetchMatches();
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
        <MatchSearchFilterPanel
          matchIds={matchIds}
          onMatchIdsChange={(value) => { setMatchIds(value); setPage(1); }}
          itemId0={itemId0}
          onItemId0Change={(value) => { setItemId0(value); setPage(1); }}
          itemId1={itemId1}
          onItemId1Change={(value) => { setItemId1(value); setPage(1); }}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          page={page}
          limit={limit}
          onLimitChange={handleLimitChange}
          loading={loading}
          itemCount={matches.length}
          onApplyFilters={() => { setPage(1); fetchMatches(); }}
        />

        {/* Pagination Controls */}
        {!loading && matches.length > 0 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center',
            marginBottom: '20px',
            gap: '10px'
          }}>
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
              style={{
                padding: '6px 12px',
                backgroundColor: page === 1 ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                opacity: page === 1 ? 0.6 : 1
              }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={matches.length < limit || loading}
              style={{
                padding: '6px 12px',
                backgroundColor: matches.length < limit ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: matches.length < limit ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                opacity: matches.length < limit ? 0.6 : 1
              }}
            >
              Next
            </button>
          </div>
        )}

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

        {loading && (!Array.isArray(matches) || matches.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading matches...
          </div>
        ) : !Array.isArray(matches) || matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No matches found.
          </div>
        ) : (
          <div style={{ 
            backgroundColor: '#fff',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Match Image</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Match ID</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Item ID 0</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Item ID 1</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Created</th>
                  {onDeleteMatch && (
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                    <td style={{ padding: '8px' }}>
                      <img
                        src={matchService.getMatchImageUrl(match)}
                        alt={`Match ${match._id}`}
                        onClick={() => handleMatchClick(match)}
                        style={{
                          width: '80px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        onError={(e) => {
                          // Handle image load error
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </td>
                    <td style={{ padding: '4px', fontSize: '12px', color: '#333', fontFamily: 'monospace' }}>
                      {match._id}
                    </td>
                    <td style={{ padding: '4px', fontSize: '12px', color: '#333' }}>
                      {match.itemId0}
                    </td>
                    <td style={{ padding: '4px', fontSize: '12px', color: '#333' }}>
                      {match.itemId1}
                    </td>
                    <td style={{ padding: '4px', fontSize: '12px', color: '#666' }}>
                      {formatDate(match.createdAt)}
                    </td>
                    {onDeleteMatch && (
                      <td style={{ padding: '8px' }}>
                        <button
                          onClick={() => onDeleteMatch(match._id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Match Modal */}
      {selectedMatch && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            cursor: 'pointer'
          }}
          onClick={closeMatchModal}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '20px',
              cursor: 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeMatchModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            <img
              src={matchService.getMatchImageUrl(selectedMatch)}
              alt={`Match ${selectedMatch._id}`}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.textContent = 'Image not available';
                errorDiv.style.textAlign = 'center';
                errorDiv.style.padding = '40px';
                errorDiv.style.color = '#666';
                e.currentTarget.parentNode?.insertBefore(errorDiv, e.currentTarget);
              }}
            />
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#333' }}>
                <strong>Match ID:</strong> {selectedMatch._id}
              </p>
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                <strong>Item ID 0:</strong> {selectedMatch.itemId0}
              </p>
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                <strong>Item ID 1:</strong> {selectedMatch.itemId1}
              </p>
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                <strong>Status:</strong> {selectedMatch.status}
              </p>
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                <strong>Created:</strong> {formatDate(selectedMatch.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MatchGallery;
