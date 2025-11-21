import React, { useState, useEffect } from 'react';
import { BundleData, matchService, ApiError } from '../../services';
import { MatchData } from '../../models';
import { MatchStorage } from '../../common/matches.storage';
import { config } from '../../config/env';

interface BundleMatchesGalleryProps {
  bundle: BundleData;
  onMatchClick?: (match: MatchData) => void;
}

const BundleMatchesGallery: React.FC<BundleMatchesGalleryProps> = ({
  bundle,
  onMatchClick
}) => {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await matchService.getMatchesByBundleId(
        bundle._id,
        page,
        limit,
        'createdAt',
        'desc'
      );
      
      console.log('Matches API Response:', response);
      
      // Handle the API response structure: { resultCd, resultMsg, data: [...], pagination: {...} }
      // The API service wraps it, so response.data is the entire response object
      const responseData = response.data as any;
      
      if (responseData) {
        // Check if responseData has the nested structure with data array and pagination
        if (Array.isArray(responseData.data) && responseData.pagination) {
          // Structure: { resultCd, resultMsg, data: [...], pagination: {...} }
          setMatches(responseData.data);
          setPagination(responseData.pagination);
        } else if (responseData && 'items' in responseData && 'pagination' in responseData) {
          // Structure: { items: [...], pagination: {...} }
          setMatches(responseData.items);
          setPagination(responseData.pagination);
        } else if (Array.isArray(responseData)) {
          // Just an array, no pagination
          setMatches(responseData);
          setPagination(null);
        } else {
          console.warn('Unexpected response structure:', responseData);
          setMatches([]);
          setPagination(null);
        }
      } else {
        console.warn('No data in response:', response);
        setMatches([]);
        setPagination(null);
      }
    } catch (err) {
      console.error('Failed to fetch matches:', err);
      const apiError = err as ApiError;
      setError(`Failed to fetch matches: ${apiError.message}`);
      setMatches([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [bundle._id, page, limit]);

  const getMatchImageUrl = (matchId: string): string => {
    const matchStorage = new MatchStorage(matchId);
    const imagePath = matchStorage.getImageFile();
    return `${config.s3BucketUrl}/${imagePath}`;
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

  const handleMatchClick = (match: MatchData) => {
    setSelectedMatch(match);
    if (onMatchClick) {
      onMatchClick(match);
    }
  };

  const closeMatchModal = () => {
    setSelectedMatch(null);
  };

  if (loading && matches.length === 0) {
    return (
      <div style={{ padding: '16px', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          Loading matches...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '16px', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' }}>
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '4px',
          border: '1px solid #fcc'
        }}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div style={{ padding: '16px', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          No matches found for this bundle.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '14px', color: '#495057' }}>
          Matches ({pagination?.total || matches.length}):
        </strong>
        {pagination && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrevPage || loading}
              style={{
                padding: '4px 8px',
                backgroundColor: !pagination.hasPrevPage ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: !pagination.hasPrevPage ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                opacity: !pagination.hasPrevPage ? 0.6 : 1
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: '11px', color: '#666' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={!pagination.hasNextPage || loading}
              style={{
                padding: '4px 8px',
                backgroundColor: !pagination.hasNextPage ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: !pagination.hasNextPage ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                opacity: !pagination.hasNextPage ? 0.6 : 1
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #dee2e6',
        maxHeight: '500px',
        overflowY: 'auto'
      }}>
        {matches.map((match) => {
          const imageUrl = getMatchImageUrl(match._id);
          
          return (
            <div
              key={match._id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '8px',
                backgroundColor: '#fff',
                borderRadius: '6px',
                border: '1px solid #ced4da',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onClick={() => handleMatchClick(match)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              <img
                src={imageUrl}
                alt={`Match ${match._id}`}
                style={{
                  width: '100%',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div style={{ fontSize: '10px', color: '#495057' }}>
                <div style={{ fontFamily: 'monospace', marginBottom: '4px', wordBreak: 'break-all' }}>
                  {match._id}
                </div>
                <div style={{ color: '#666', marginBottom: '2px' }}>
                  Items: {match.itemId0} / {match.itemId1}
                </div>
                <div style={{ color: '#666', fontSize: '9px' }}>
                  {formatDate(match.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Match Zoom Modal */}
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
                justifyContent: 'center',
                zIndex: 1001
              }}
            >
              ×
            </button>
            <img
              src={getMatchImageUrl(selectedMatch._id)}
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
              {selectedMatch.status && (
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                  <strong>Status:</strong> {selectedMatch.status}
                </p>
              )}
              {(selectedMatch as any).matchesCount0 !== undefined && (
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                  <strong>Matches Count:</strong> {(selectedMatch as any).matchesCount0} / {(selectedMatch as any).matchesCount1}
                </p>
              )}
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                <strong>Created:</strong> {formatDate(selectedMatch.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BundleMatchesGallery;

