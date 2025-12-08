import React, { useState, useEffect } from 'react';
import { ClipData, ApiError, clipService } from '../../services';
import { GetClipsRequest } from '../../models';
import ClipRow from './ClipRow';
import ClipSearchFilterPanel from '../common/ClipSearchFilterPanel';
import styles from './ClipGallery.module.css';

interface ClipGalleryProps {
  // Component is now self-contained and manages its own data
}

const ClipGallery: React.FC<ClipGalleryProps> = () => {
  const [clips, setClips] = useState<ClipData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClip, setSelectedClip] = useState<ClipData | null>(null);
  const [expandedClips, setExpandedClips] = useState<Set<string>>(new Set());
  
  // Filter and sort state
  const [clipIds, setClipIds] = useState<string>('');
  const [extension, setExtension] = useState<string>('');
  const [isProcessed, setIsProcessed] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const handleClipClick = (clip: ClipData) => {
    setSelectedClip(clip);
  };

  const closeClipModal = () => {
    setSelectedClip(null);
  };

  const toggleClipExpansion = (clipId: string) => {
    const newExpanded = new Set(expandedClips);
    if (newExpanded.has(clipId)) {
      newExpanded.delete(clipId);
    } else {
      newExpanded.add(clipId);
    }
    setExpandedClips(newExpanded);
  };

  // Helper function to parse IDs string
  const parseIdsString = (idsString: string): string => {
    if (!idsString || idsString.trim() === '') return '';
    return idsString
      .split(/[,\n]/)
      .map(id => id.trim())
      .filter(id => id.length > 0)
      .join(',');
  };

  // Fetch clips with filters
  const fetchClips = async () => {
    setLoading(true);
    setError(null);
    try {
      const clipIdsList = parseIdsString(clipIds);
      
      const request: GetClipsRequest = {
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        id: clipIdsList || undefined,
        extension: extension || undefined,
        isProcessed: isProcessed || undefined,
      };
      
      const response = await clipService.getClips(request);
      console.log('Clips API Response:', response);
      
      // Handle different response structures
      let clipsData = response.data;
      let clipsList: ClipData[] = [];
      
      if (Array.isArray(clipsData)) {
        clipsList = clipsData;
      } else if (clipsData && typeof clipsData === 'object' && 'items' in clipsData && Array.isArray((clipsData as any).items)) {
        clipsList = (clipsData as any).items;
      } else if (clipsData && typeof clipsData === 'object' && 'data' in clipsData && Array.isArray((clipsData as any).data)) {
        clipsList = (clipsData as any).data;
      } else {
        console.warn('Unexpected response structure:', clipsData);
        clipsList = [];
      }
      
      setClips(clipsList);
    } catch (err) {
      console.error('Failed to fetch clips:', err);
      const apiError = err as ApiError;
      setError(`Failed to fetch clips: ${apiError.message}`);
      setClips([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch clips on mount and when filters/sort change
  useEffect(() => {
    fetchClips();
  }, [page, limit, sortBy, sortOrder]);

  // Handle limit change
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <>
      <div className={styles.container}>
        {/* Search and Filter Panel */}
        <ClipSearchFilterPanel
          clipIds={clipIds}
          onClipIdsChange={(value) => { setClipIds(value); setPage(1); }}
          extension={extension}
          onExtensionChange={(value) => { setExtension(value); setPage(1); }}
          isProcessed={isProcessed}
          onIsProcessedChange={(value) => { setIsProcessed(value); setPage(1); }}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          page={page}
          limit={limit}
          onLimitChange={handleLimitChange}
          loading={loading}
          clipCount={clips.length}
          onApplyFilters={() => { setPage(1); fetchClips(); }}
        />

        {/* Pagination Controls */}
        {!loading && clips.length > 0 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
              className={styles.paginationButton}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={clips.length < limit || loading}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (!Array.isArray(clips) || clips.length === 0) ? (
          <div className={styles.loadingMessage}>
            Loading clips...
          </div>
        ) : !Array.isArray(clips) || clips.length === 0 ? (
          <div className={styles.emptyMessage}>
            No clips found. Upload your first clip above!
          </div>
        ) : (
          <div className={styles.clipList}>
            {clips.map((clip) => (
              <ClipRow
                key={clip._id}
                clip={clip}
                isExpanded={expandedClips.has(clip._id)}
                onToggleExpansion={toggleClipExpansion}
                onClipClick={handleClipClick}
                onRefresh={fetchClips}
              />
            ))}
          </div>
        )}
      </div>

      {selectedClip && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={closeClipModal}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '90%',
            maxHeight: '90%',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedClip._id}</h3>
            <p>Extension: {selectedClip.extension || 'N/A'}</p>
            <p>Size: {selectedClip.size || 'N/A'}</p>
            <p>Status: {selectedClip.status || 'N/A'}</p>
            <p>Created: {selectedClip.createdAt ? new Date(selectedClip.createdAt).toLocaleString() : 'N/A'}</p>
            {selectedClip.itemIds && selectedClip.itemIds.length > 0 && (
              <p>Items: {selectedClip.itemIds.length}</p>
            )}
            <button onClick={closeClipModal} style={{ marginTop: '10px' }}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ClipGallery;

