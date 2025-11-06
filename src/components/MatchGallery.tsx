import React, { useState } from 'react';
import { matchService, MatchData } from '../services';

interface MatchGalleryProps {
  matches: MatchData[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onDeleteMatch?: (id: string) => void;
}

const MatchGallery: React.FC<MatchGalleryProps> = ({ 
  matches, 
  loading, 
  error, 
  onRefresh,
  onDeleteMatch
}) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);

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

  return (
    <>
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
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
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

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
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Item ID 0</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Item ID 1</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Status</th>
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
                    <td style={{ padding: '4px', fontSize: '12px', color: '#333' }}>
                      {match.itemId0}
                    </td>
                    <td style={{ padding: '4px', fontSize: '12px', color: '#333' }}>
                      {match.itemId1}
                    </td>
                    <td style={{ padding: '4px', fontSize: '12px', color: '#333' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontWeight: '500',
                        backgroundColor: match.status === 'completed' ? '#d4edda' : '#fff3cd',
                        color: match.status === 'completed' ? '#155724' : '#856404'
                      }}>
                        {match.status}
                      </span>
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
                <strong>Item ID 1:</strong> {selectedMatch.itemId0}
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
