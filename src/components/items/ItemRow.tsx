import React, { useState, useEffect, useRef, useMemo } from 'react';
import { imageService, ImageData } from '../../services';
import { ProcessingStatus } from '../../models/ProcessingStatus';
import { ItemStorage } from '../../common/item.storage';
import { getStatusColor, getStatusTextColor } from '../../utils/statusUtils';
import styles from './ItemRow.module.css';

export interface ItemRowProps {
  item: ImageData;
}

const ItemRow: React.FC<ItemRowProps> = ({ item: initialItem }) => {
  const [item, setItem] = useState<ImageData>(initialItem);
  const [panoLoading, setPanoLoading] = useState(false);
  const [autolevelLoading, setAutolevelLoading] = useState(false);
  const [featureLoading, setFeatureLoading] = useState(false);
  const [depthLoading, setDepthLoading] = useState(false);
  const itemRef = useRef<ImageData>(initialItem);
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate((n) => n + 1);

  useEffect(() => {
    setItem(initialItem);
    itemRef.current = initialItem;
  }, [initialItem]);

  useEffect(() => {
    itemRef.current = item;
  }, [item]);

  const handleRunPano = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setPanoLoading(true);
    try {
      const current = itemRef.current;
      console.log('Running pano for item:', {
        itemId: current._id,
        requestId: current._id,
      });

      await imageService.runPano(current._id, current._id, true);
      console.log('Pano request submitted successfully');

      refresh();
    } catch (err) {
      console.error('Pano request failed:', err);
      alert('Failed to run pano processing. Please try again.');
    } finally {
      setPanoLoading(false);
    }
  };

  const handleRunAutolevel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAutolevelLoading(true);
    try {
      const current = itemRef.current;
      await imageService.runAutoleveling(current._id, current._id, true);
      refresh();
    } catch (err) {
      console.error('Autolevel request failed:', err);
      alert('Failed to run autolevel. Please try again.');
    } finally {
      setAutolevelLoading(false);
    }
  };

  const handleRunFeature = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setFeatureLoading(true);
    try {
      const current = itemRef.current;
      console.log('Running feature for item:', {
        itemId: current._id,
        requestId: current._id,
      });

      await imageService.runFeature(current._id, current._id, true);
      item.featureStatus = ProcessingStatus.PROCESSED;
      console.log('Feature request submitted successfully');

      refresh();
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
      const current = itemRef.current;
      console.log('Running depth for item:', {
        itemId: current._id,
        requestId: current._id,
      });

      await imageService.runDepth(current._id, current._id, true);
      item.depthStatus = ProcessingStatus.PROCESSED;
      console.log('Depth request submitted successfully');

      refresh();
    } catch (err) {
      console.error('Depth request failed:', err);
      alert('Failed to run depth processing. Please try again.');
    } finally {
      setDepthLoading(false);
    }
  };

  const storageDir = useMemo(() => {
    const ext = item.extension || 'jpg';
    const storage = item.parentId
      ? new ItemStorage(item._id, ext, item.parentId)
      : new ItemStorage(item._id, ext);
    return storage.getImageDir();
  }, [item._id, item.extension, item.parentId]);

  return (
    <div className={styles.itemRow}>
      <div className={styles.itemCard}>
        <div className={styles.topSection}>
          <div className={styles.leftContent}>
            <div className={styles.itemInfo}>
              <h3 className={styles.itemId}>
                {item.parentId ? (
                  <>
                    {item.parentId}
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: '400' }}> / {item._id}</span>
                  </>
                ) : (
                  item._id
                )}
              </h3>
              <p className={styles.storagePath} title="ItemStorage.getImageDir()">
                {storageDir}
              </p>
              <div className={styles.statusBadges}>
                {item.parentId && (
                  <>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: getStatusColor(item.featureStatus),
                        color: getStatusTextColor(item.featureStatus),
                      }}
                    >
                      F: {item.featureStatus}
                    </span>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: getStatusColor(item.depthStatus),
                        color: getStatusTextColor(item.depthStatus),
                      }}
                    >
                      D: {item.depthStatus}
                    </span>
                  </>
                )}
                {!item.parentId && (
                  <span
                    className={styles.statusBadge}
                    style={{
                      backgroundColor: getStatusColor(item.tilingStatus),
                      color: getStatusTextColor(item.tilingStatus),
                    }}
                  >
                    T: {item.tilingStatus}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.rightActions}>
            <div className={styles.buttonGroup}>
              {item.parentId && (
                <>
                  <button
                    onClick={handleRunFeature}
                    disabled={featureLoading}
                    className={`${styles.actionButton} ${featureLoading ? styles.actionButtonDisabled : styles.actionButtonSuccess}`}
                    title="Run feature processing"
                  >
                    {featureLoading ? '⏳' : '▶'} Feature
                  </button>
                  <button
                    onClick={handleRunDepth}
                    disabled={depthLoading}
                    className={`${styles.actionButton} ${depthLoading ? styles.actionButtonDisabled : styles.actionButtonInfo}`}
                    title="Run depth processing"
                  >
                    {depthLoading ? '⏳' : '▶'} Depth
                  </button>
                </>
              )}
              {!item.parentId && (
                <>
                  <button
                    onClick={handleRunPano}
                    disabled={panoLoading || autolevelLoading}
                    className={`${styles.actionButton} ${panoLoading || autolevelLoading ? styles.actionButtonDisabled : styles.actionButtonPrimary}`}
                    title="Run pano processing"
                  >
                    {panoLoading ? '⏳' : '▶'} Pano
                  </button>
                  <button
                    onClick={handleRunAutolevel}
                    disabled={autolevelLoading || panoLoading}
                    className={`${styles.actionButton} ${autolevelLoading || panoLoading ? styles.actionButtonDisabled : styles.actionButtonInfo}`}
                    title="Run autolevel processing"
                  >
                    {autolevelLoading ? '⏳' : '▶'} Autolevel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemRow;
