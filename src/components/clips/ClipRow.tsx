import React, { useState, useEffect, useRef } from 'react';
import { clipService, ClipData, ProcessingStatus } from '../../services';
import { getStatusColor, getStatusTextColor } from '../../utils/statusUtils';
import styles from './ClipRow.module.css';

export interface ClipRowProps {
  clip: ClipData;
  isExpanded?: boolean;
  onToggleExpansion?: (clipId: string) => void;
  onClipClick?: (clip: ClipData) => void;
  onRefresh?: () => void;
}

const ClipRow: React.FC<ClipRowProps> = ({
  clip: initialClip,
  isExpanded = false,
  onToggleExpansion,
  onClipClick,
  onRefresh,
}) => {
  const [clip, setClip] = useState<ClipData>(initialClip);
  const [processLoading, setProcessLoading] = useState(false);
  const clipRef = useRef<ClipData>(initialClip);
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  // Update clip when initialClip prop changes
  useEffect(() => {
    setClip(initialClip);
    clipRef.current = initialClip;
  }, [initialClip]);

  // Keep ref in sync with state
  useEffect(() => {
    clipRef.current = clip;
  }, [clip]);

  const handleRunProcess = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setProcessLoading(true);
    try {
      const currentClip = clipRef.current;
      console.log('Running process for clip:', {
        clipId: currentClip._id,
        requestId: currentClip._id
      });
      
      await clipService.runProcess(currentClip._id, currentClip._id, true);
      console.log('Process request submitted successfully');
      
      // Update clip status optimistically
      setClip(prev => ({ ...prev, status: ProcessingStatus.PROCESSING }));
      
      // Trigger parent component refresh
      if (onRefresh) {
        setTimeout(() => {
          onRefresh();
        }, 1000);
      }
      refresh();
    } catch (err) {
      console.error('Process request failed:', err);
      alert('Failed to run clip processing. Please try again.');
    } finally {
      setProcessLoading(false);
    }
  };

  const formatDate = (dateString: string | Date): string => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status?: ProcessingStatus): string => {
    if (!status) return 'Pending';
    switch (status) {
      case ProcessingStatus.PROCESSED:
        return '✓ Processed';
      case ProcessingStatus.PROCESSING:
        return '⏳ Processing';
      case ProcessingStatus.FAILED:
        return '✗ Failed';
      case ProcessingStatus.PENDING:
      default:
        return '⏸ Pending';
    }
  };

  const handleCopyItemIds = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!clip.itemIds || clip.itemIds.length === 0) {
      alert('No item IDs to copy');
      return;
    }
    
    const button = e.currentTarget;
    try {
      const itemIdsString = clip.itemIds.join(',');
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

  return (
    <div className={styles.clipRow}>
      <div className={styles.clipCard}>
        <div 
          className={styles.topSection}
          onClick={() => onToggleExpansion?.(clip._id)}
        >
          <div className={styles.leftContent}>
            {/* Expand icon */}
            {clip.itemIds && clip.itemIds.length > 0 && (
              <div className={styles.expandIcon}>
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
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
            )}
            
            {/* Video thumbnail placeholder */}
            <div className={styles.thumbnailPlaceholder}>
              🎬
            </div>

            {/* Clip info */}
            <div className={styles.clipInfo} onClick={(e) => {
              e.stopPropagation();
              onClipClick?.(clip);
            }}>
              <h3 className={styles.clipId}>
                {clip._id}
              </h3>
              <p className={styles.clipMeta}>
                {clip.itemIds && clip.itemIds.length > 0 && `${clip.itemIds.length} items • `}
                {clip.extension && `Extension: ${clip.extension} • `}
                {clip.size && `Size: ${clip.size} • `}
                {clip.createdAt ? `Created: ${formatDate(clip.createdAt)}` : 'N/A'}
                {clip.updatedAt && ` • Updated: ${formatDate(clip.updatedAt)}`}
              </p>
              {/* Status badge */}
              <div className={styles.statusBadges}>
                <span
                  className={styles.statusBadge}
                  style={{
                    backgroundColor: getStatusColor(clip.status || ProcessingStatus.PENDING),
                    color: getStatusTextColor(clip.status || ProcessingStatus.PENDING)
                  }}
                >
                  {getStatusText(clip.status)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Right side: Process button */}
          <div className={styles.rightActions} onClick={(e) => e.stopPropagation()}>
            <div className={styles.buttonGroup}>
              <button
                onClick={handleRunProcess}
                disabled={processLoading}
                className={`${styles.actionButton} ${processLoading ? styles.actionButtonDisabled : styles.actionButtonPrimary}`}
                title="Run clip processing"
              >
                {processLoading ? '⏳' : '▶'} Process
              </button>
            </div>
          </div>
        </div>

        {/* Expandable items section */}
        {isExpanded && clip.itemIds && clip.itemIds.length > 0 && (
          <div className={styles.itemsSection}>
            <div className={styles.itemsHeader}>
              <strong className={styles.itemsTitle}>
                Items ({clip.itemIds.length}):
              </strong>
              <button
                onClick={handleCopyItemIds}
                className={styles.copyButton}
                title="Copy all item IDs to clipboard"
              >
                📋 Copy IDs
              </button>
            </div>
            <div className={styles.itemsList}>
              {clip.itemIds.map((itemId, index) => (
                <div
                  key={index}
                  className={styles.itemCard}
                  title={`Item ID: ${itemId}`}
                >
                  <span className={styles.itemId}>{itemId}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClipRow;

