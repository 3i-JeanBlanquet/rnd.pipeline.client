import React, { useState, useEffect, useRef } from 'react';
import { BundleData, bundleService, ApiResponse } from '../../services';
import { getStatusColor, getStatusTextColor } from '../../utils/statusUtils';
import BundleDetails from './BundleDetails';
import BundleResearchModal from './BundleResearchModal';
import BundleMatchesGallery from './BundleMatchesGallery';

interface BundleRowProps {
  bundle: BundleData;
  isExpanded: boolean;
  onToggleExpansion: (bundleId: string) => void;
  onBundleClick: (bundle: BundleData) => void;
  onDeleteBundle?: (id: string) => void;
  onImageClick: (imageUrl: string, imageId: string) => void;
  onDownloadZip: (bundle: BundleData) => void;
  downloading: string | null;
  onRefresh: () => void;
  onShowProcessingNotification?: (bundleId: string) => void;
}

const BundleRow: React.FC<BundleRowProps> = ({
  bundle,
  isExpanded,
  onToggleExpansion,
  onBundleClick,
  onDeleteBundle,
  onImageClick,
  onDownloadZip,
  downloading,
  onRefresh,
  onShowProcessingNotification
}) => {
  const [featureLoading, setFeatureLoading] = useState(false);
  const [depthLoading, setDepthLoading] = useState(false);
  const [reconstructionLoading, setReconstructionLoading] = useState(false);
  const [meshLoading, setMeshLoading] = useState(false);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showRunButtons, setShowRunButtons] = useState(false);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  const formatDate = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to check if response indicates PROCESSING status
  const isProcessingResponse = (response: ApiResponse<any>): boolean => {
    // Check if response data contains msgCode field with "PROCESSING"
    // Response structure: {msgCode: "PROCESSING", data: {}, code: 200}
    if (response.data && typeof response.data === 'object') {
      const data = response.data as any;
      if (data.msgCode === 'PROCESSING' || data.msgCode === 'processing') {
        return true;
      }
    }
    
    // Also check HTTP status code 202 (Accepted) or 102 (Processing) - common for async processing
    if (response.status === 202 || response.status === 102) {
      return true;
    }
    
    // Check if message contains "PROCESSING"
    if (response.message && response.message.toUpperCase().includes('PROCESSING')) {
      return true;
    }
    
    // Check if response data contains other status fields with "PROCESSING"
    if (response.data && typeof response.data === 'object') {
      const data = response.data as any;
      if (data.status === 'PROCESSING' || data.status === 'processing') {
        return true;
      }
      if (data.message === 'PROCESSING' || data.message === 'processing') {
        return true;
      }
    }
    
    return false;
  };

  const handleRunFeature = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setFeatureLoading(true);
    try {
      const response = await bundleService.runFeature(bundle._id);
      if (isProcessingResponse(response)) {
        if (onShowProcessingNotification) {
          onShowProcessingNotification(bundle._id);
        }
      } else {
      console.log('Feature request submitted successfully');
      setTimeout(() => {
        onRefresh();
      }, 1000);
      }
    } catch (err) {
      console.error('Feature request failed:', err);
      alert('Failed to run feature processing. Please try again.');
    } finally {
      setFeatureLoading(false);
    }
  };

  const handleRunDepth = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDepthLoading(true);
    try {
      const response = await bundleService.runDepth(bundle._id);
      if (isProcessingResponse(response)) {
        if (onShowProcessingNotification) {
          onShowProcessingNotification(bundle._id);
        }
      } else {
        console.log('Depth request submitted successfully');
        setTimeout(() => {
          onRefresh();
        }, 1000);
      }
    } catch (err) {
      console.error('Depth request failed:', err);
      alert('Failed to run depth processing. Please try again.');
    } finally {
      setDepthLoading(false);
    }
  };

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefreshLoading(true);
    try {
      await bundleService.getBundle(bundle._id);
      onRefresh();
    } catch (err) {
      console.error('Failed to refresh bundle:', err);
      alert('Failed to refresh bundle status. Please try again.');
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleRunReconstruction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setReconstructionLoading(true);
    try {
      const response = await bundleService.runReconstruction(bundle._id);
      if (isProcessingResponse(response)) {
        if (onShowProcessingNotification) {
          onShowProcessingNotification(bundle._id);
        }
      } else {
      console.log('Reconstruction request submitted successfully');
      setTimeout(() => {
        onRefresh();
      }, 1000);
      }
    } catch (err) {
      console.error('Reconstruction request failed:', err);
      alert('Failed to run reconstruction. Please try again.');
    } finally {
      setReconstructionLoading(false);
    }
  };

  const handleRunMesh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMeshLoading(true);
    try {
      const response = await bundleService.runMesh(bundle._id);
      if (isProcessingResponse(response)) {
        if (onShowProcessingNotification) {
          onShowProcessingNotification(bundle._id);
        }
      } else {
      console.log('Mesh request submitted successfully');
      setTimeout(() => {
        onRefresh();
      }, 1000);
      }
    } catch (err) {
      console.error('Mesh request failed:', err);
      alert('Failed to run mesh processing. Please try again.');
    } finally {
      setMeshLoading(false);
    }
  };

  const handleRunMatches = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMatchesLoading(true);
    try {
      const response = await bundleService.runMatches(bundle._id);
      if (isProcessingResponse(response)) {
        if (onShowProcessingNotification) {
          onShowProcessingNotification(bundle._id);
        }
      } else {
      console.log('Matches request submitted successfully');
      setTimeout(() => {
        onRefresh();
      }, 1000);
      }
    } catch (err) {
      console.error('Matches request failed:', err);
      alert('Failed to run matches processing. Please try again.');
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleCopyItemIds = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const button = e.currentTarget;
    if (!button) return;
    
    try {
      const itemIdsString = bundle.itemIds.join(',');
      await navigator.clipboard.writeText(itemIdsString);
      console.log('Item IDs copied to clipboard');
      // Show a temporary success message
      const originalText = button.textContent || '';
      button.textContent = '✓ Copied!';
      setTimeout(() => {
        if (button) {
          button.textContent = originalText;
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy item IDs to clipboard. Please try again.');
    }
  };

  const handleOpenResearch = () => {
    setShowResearchModal(true);
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        width: '100%',
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
        borderBottom: '1px solid #e9ecef'
      }}
    >
      {/* Main bundle card */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          borderBottom: isExpanded ? '1px solid #e9ecef' : 'none',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Top section: Bundle ID, description, status badges, and action buttons */}
        <div
          style={{
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            transition: 'background-color 0.2s ease',
            width: '100%',
            boxSizing: 'border-box',
            gap: '16px'
          }}
          onClick={() => onToggleExpansion(bundle._id)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e9ecef';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Left side: Expand icon, Bundle info, and Status badges */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              width: '24px',
              height: '24px',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              <svg
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="#666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#333', fontWeight: '600', wordBreak: 'break-word' }}>
                {bundle._id}
              </h3>
              <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#666' }}>
                {bundle.itemIds.length} items • Created: {bundle.createdAt ? formatDate(bundle.createdAt) : 'N/A'}
              </p>
              {/* Status badges - more compact */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '9px',
                  fontWeight: '600',
                  backgroundColor: getStatusColor(bundle.featureStatus),
                  color: getStatusTextColor(bundle.featureStatus),
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}>
                  F: {bundle.featureStatus}
                </span>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '9px',
                  fontWeight: '600',
                  backgroundColor: getStatusColor(bundle.reconstruction),
                  color: getStatusTextColor(bundle.reconstruction),
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}>
                  R: {bundle.reconstruction}
                </span>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '9px',
                  fontWeight: '600',
                  backgroundColor: getStatusColor(bundle.meshStatus),
                  color: getStatusTextColor(bundle.meshStatus),
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}>
                  M: {bundle.meshStatus}
                </span>
                <button
                  onClick={handleRefresh}
                  disabled={refreshLoading}
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: refreshLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: refreshLoading ? 0.6 : 1,
                    transition: 'opacity 0.2s ease'
                  }}
                  title="Refresh bundle statuses"
                >
                  <span style={{
                    fontSize: '12px',
                    color: '#666',
                    transform: refreshLoading ? 'rotate(360deg)' : 'rotate(0deg)',
                    transition: refreshLoading ? 'transform 0.6s linear infinite' : 'transform 0.2s ease',
                    display: 'inline-block'
                  }}>
                    🔄
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Right side: Actions menu dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ position: 'relative' }} ref={actionsMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionsMenu(!showActionsMenu);
                }}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="More actions"
              >
                ⋯
              </button>
              {showActionsMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 100,
                    minWidth: '140px',
                    overflow: 'hidden'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyItemIds(e);
                      setShowActionsMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      color: '#495057',
                      border: 'none',
                      borderBottom: '1px solid #e9ecef',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    📋 Copy IDs
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadZip(bundle);
                      setShowActionsMenu(false);
                    }}
                    disabled={downloading === bundle._id}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      color: downloading === bundle._id ? '#6c757d' : '#17a2b8',
                      border: 'none',
                      borderBottom: '1px solid #e9ecef',
                      cursor: downloading === bundle._id ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: downloading === bundle._id ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (downloading !== bundle._id) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {downloading === bundle._id ? '⏳' : '📦'} Download ZIP
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBundleClick(bundle);
                      setShowActionsMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      color: '#007bff',
                      border: 'none',
                      borderBottom: '1px solid #e9ecef',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    📄 Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenResearch();
                      setShowActionsMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      color: '#28a745',
                      border: 'none',
                      borderBottom: onDeleteBundle ? '1px solid #e9ecef' : 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    🔍 Research
                  </button>
                  {onDeleteBundle && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBundle(bundle._id);
                        setShowActionsMenu(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: 'transparent',
                        color: '#dc3545',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff5f5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom section: Run buttons - Collapsible */}
        <div
          style={{
            borderTop: '1px solid #e9ecef',
            width: '100%',
            boxSizing: 'border-box'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowRunButtons(!showRunButtons);
            }}
            style={{
              width: '100%',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              color: '#6c757d',
              fontWeight: '500',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={{
              transform: showRunButtons ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              display: 'inline-block'
            }}>
              ▼
            </span>
            <span>Processing Actions</span>
          </button>
          {showRunButtons && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {/* Workflow group */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleRunFeature}
                  disabled={featureLoading}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: featureLoading ? '#6c757d' : '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: featureLoading ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontWeight: '500',
                    opacity: featureLoading ? 0.6 : 1,
                    whiteSpace: 'nowrap'
                  }}
                  title="Run feature processing"
                >
                  {featureLoading ? '⏳' : '▶'} Feature
                </button>
                <button
                  onClick={handleRunDepth}
                  disabled={depthLoading}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: depthLoading ? '#6c757d' : '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: depthLoading ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontWeight: '500',
                    opacity: depthLoading ? 0.6 : 1,
                    whiteSpace: 'nowrap'
                  }}
                  title="Run depth processing"
                >
                  {depthLoading ? '⏳' : '▶'} Depth
                </button>
                <button
                  onClick={handleRunMatches}
                  disabled={matchesLoading}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: matchesLoading ? '#6c757d' : '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: matchesLoading ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontWeight: '500',
                    opacity: matchesLoading ? 0.6 : 1,
                    whiteSpace: 'nowrap'
                  }}
                  title="Run matches processing"
                >
                  {matchesLoading ? '⏳' : '▶'} Matches
                </button>
                <button
                  onClick={handleRunReconstruction}
                  disabled={reconstructionLoading}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: reconstructionLoading ? '#6c757d' : '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: reconstructionLoading ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontWeight: '500',
                    opacity: reconstructionLoading ? 0.6 : 1,
                    whiteSpace: 'nowrap'
                  }}
                  title="Run reconstruction processing"
                >
                  {reconstructionLoading ? '⏳' : '▶'} Reconstruction
                </button>
                <button
                  onClick={handleRunMesh}
                  disabled={meshLoading}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: meshLoading ? '#6c757d' : '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: meshLoading ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontWeight: '500',
                    opacity: meshLoading ? 0.6 : 1,
                    whiteSpace: 'nowrap'
                  }}
                  title="Run mesh processing"
                >
                  {meshLoading ? '⏳' : '▶'} Mesh
                </button>
                {/* <button
                  onClick={handleRunAll}
                  disabled={runAllLoading}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: runAllLoading ? '#6c757d' : '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: runAllLoading ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontWeight: '600',
                    opacity: runAllLoading ? 0.6 : 1,
                    whiteSpace: 'nowrap'
                  }}
                  title="Run all processing steps"
                >
                  {runAllLoading ? '⏳' : '▶'} Run All
                </button> */}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Expandable items section */}
      {isExpanded && (
        <>
          <BundleDetails
            bundle={bundle}
            onImageClick={onImageClick}
          />
          <BundleMatchesGallery
            bundle={bundle}
            onMatchClick={(match) => {
              // Optional: handle match click if needed
              console.log('Match clicked:', match);
            }}
          />
        </>
      )}

      {/* Research Modal */}
      <BundleResearchModal
        bundle={bundle}
        isOpen={showResearchModal}
        onClose={() => setShowResearchModal(false)}
      />
    </div>
  );
};

export default BundleRow;

