import React, { useState } from 'react';
import { BundleData, bundleService, imageService } from '../../services';
import { ImageData } from '../../models';
import ImageViewerModal from '../images/ImageViewerModal';
import BundleRow from './BundleRow';
import { getStatusColor, getStatusTextColor } from '../../utils/statusUtils';
import { downloadBundleAsZip } from '../../utils/bundleDownload';
import styles from './BundleGallery.module.css';

interface BundleGalleryProps {
  bundles: BundleData[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onDeleteBundle?: (id: string) => void;
  onShowProcessingNotification?: (bundleId: string) => void;
}

const BundleGallery: React.FC<BundleGalleryProps> = ({ 
  bundles, 
  loading, 
  error, 
  onRefresh,
  onDeleteBundle,
  onShowProcessingNotification
}) => {
  const [selectedBundle, setSelectedBundle] = useState<BundleData | null>(null);
  const [expandedBundles, setExpandedBundles] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const handleBundleClick = (bundle: BundleData) => {
    setSelectedBundle(bundle);
  };

  const closeBundleModal = () => {
    setSelectedBundle(null);
  };

  const handleImageClick = (imageUrl: string, imageId: string) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageId(imageId);
  };

  const closeImageModal = () => {
    setSelectedImageUrl(null);
    setSelectedImageId(null);
  };

  const toggleBundleExpansion = (bundleId: string) => {
    const newExpanded = new Set(expandedBundles);
    if (newExpanded.has(bundleId)) {
      newExpanded.delete(bundleId);
    } else {
      newExpanded.add(bundleId);
    }
    setExpandedBundles(newExpanded);
  };

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


  // Download a single file
  const downloadFile = async (url: string, filename: string) => {
    try {
      // Set 10 minute timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000);
      
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`Failed to download ${filename}`);
        }
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Timeout downloading ${filename}`);
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error);
      alert(`Failed to download ${filename}. Please check if the file exists.`);
    }
  };

  // Wrapper function to handle downloading state
  const handleDownloadBundleAsZip = async (bundle: BundleData) => {
    await downloadBundleAsZip(bundle, setDownloading);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.refreshButton}>
          <button
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (!Array.isArray(bundles) || bundles.length === 0) ? (
          <div className={styles.loadingMessage}>
            Loading bundles...
          </div>
        ) : !Array.isArray(bundles) || bundles.length === 0 ? (
          <div className={styles.emptyMessage}>
            No bundles found.
          </div>
        ) : (
          <div className={styles.bundleList}>
            {bundles.map((bundle) => (
              <BundleRow
                key={bundle._id}
                bundle={bundle}
                isExpanded={expandedBundles.has(bundle._id)}
                onToggleExpansion={toggleBundleExpansion}
                onBundleClick={handleBundleClick}
                onDeleteBundle={onDeleteBundle}
                onImageClick={handleImageClick}
                onDownloadZip={handleDownloadBundleAsZip}
                downloading={downloading}
                onRefresh={onRefresh}
                onShowProcessingNotification={onShowProcessingNotification}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bundle Modal */}
      {selectedBundle && (
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
          onClick={closeBundleModal}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '20px',
              cursor: 'default',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeBundleModal}
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
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: '0', color: '#333' }}>Bundle Details</h3>
                <button
                  onClick={() => handleDownloadBundleAsZip(selectedBundle)}
                  disabled={downloading === selectedBundle._id}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: downloading === selectedBundle._id ? '#6c757d' : '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: downloading === selectedBundle._id ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    opacity: downloading === selectedBundle._id ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Download all bundle files as ZIP"
                >
                  {downloading === selectedBundle._id ? '⏳ Downloading...' : '📦 Download All as ZIP'}
                </button>
              </div>
              <div style={{ display: 'grid', gap: '10px' }}>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#333' }}>
                  <strong>Bundle ID:</strong> {selectedBundle._id}
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                  <strong>Items Count:</strong> {selectedBundle.itemIds.length}
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                  <strong>Feature Status:</strong> 
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: '500',
                    backgroundColor: getStatusColor(selectedBundle.featureStatus),
                    color: getStatusTextColor(selectedBundle.featureStatus)
                  }}>
                    {selectedBundle.featureStatus}
                  </span>
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                  <strong>Reconstruction Status:</strong> 
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: '500',
                    backgroundColor: getStatusColor(selectedBundle.reconstruction),
                    color: getStatusTextColor(selectedBundle.reconstruction)
                  }}>
                    {selectedBundle.reconstruction}
                  </span>
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                  <strong>Mesh Status:</strong> 
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: '500',
                    backgroundColor: getStatusColor(selectedBundle.meshStatus),
                    color: getStatusTextColor(selectedBundle.meshStatus)
                  }}>
                    {selectedBundle.meshStatus}
                  </span>
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                  <strong>Created:</strong> {selectedBundle.createdAt ? formatDate(selectedBundle.createdAt) : 'N/A'}
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                  <strong>Updated:</strong> {selectedBundle.updatedAt ? formatDate(selectedBundle.updatedAt) : 'N/A'}
                </p>
                
                {/* Download Individual Files Section */}
                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #dee2e6' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#333', fontWeight: 'bold' }}>
                    Download Individual Files:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button
                      onClick={() => downloadFile(bundleService.get3DDatabaseUrl(selectedBundle), `bundle_${selectedBundle._id}_data.db`)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      📄 3D Database
                    </button>
                    <button
                      onClick={() => downloadFile(bundleService.get3DPointsUrl(selectedBundle), `bundle_${selectedBundle._id}_points3D.bin`)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      📄 3D Points
                    </button>
                    <button
                      onClick={() => downloadFile(bundleService.get3DImagesUrl(selectedBundle), `bundle_${selectedBundle._id}_images.bin`)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      📄 3D Images
                    </button>
                    <button
                      onClick={() => downloadFile(bundleService.get3DCamerasUrl(selectedBundle), `bundle_${selectedBundle._id}_cameras.bin`)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      📄 3D Cameras Bin
                    </button>
                    <button
                      onClick={() => downloadFile(bundleService.getCamerasUrl(selectedBundle), `bundle_${selectedBundle._id}_cameras.json`)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      📄 Cameras JSON
                    </button>
                    <button
                      onClick={() => downloadFile(bundleService.get3DMeshUrl(selectedBundle), `bundle_${selectedBundle._id}_mesh.ply`)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      📄 Mesh PLY
                    </button>
                    <button
                      onClick={() => downloadFile(bundleService.get3DMeshGeometryUrl(selectedBundle), `bundle_${selectedBundle._id}_textured_mesh.obj`)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      📄 Mesh OBJ
                    </button>
                    <button
                      onClick={() => downloadFile(bundleService.get3DMeshMaterialUrl(selectedBundle), `bundle_${selectedBundle._id}_textured_mesh.mtl`)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      📄 Mesh MTL
                    </button>
                    <button
                      onClick={() => downloadFile(bundleService.get3DTexturedConfUrl(selectedBundle), `bundle_${selectedBundle._id}_textured_mesh.conf`)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      📄 Mesh Conf
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>
                    Items ({selectedBundle.itemIds.length}):
                  </p>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}>
                    {selectedBundle.itemIds.map((itemId, index) => {
                      // Create minimal ImageData for getting image URL
                      const imageData = { _id: itemId, extension: 'jpg' } as ImageData;
                      const imageUrl = imageService.getImageUrl(imageData);
                      
                      return (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            backgroundColor: '#fff',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            color: '#495057',
                            border: '1px solid #ced4da',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          title={`Item ID: ${itemId}`}
                        >
                          <img
                            src={imageUrl}
                            alt={`Item ${itemId}`}
                            onClick={() => handleImageClick(imageUrl, itemId)}
                            style={{
                              width: '60px',
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
                              // Hide image if it fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                            {itemId}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {selectedImageUrl && selectedImageId && (
        <ImageViewerModal
          imageUrl={selectedImageUrl}
          imageId={selectedImageId}
          onClose={closeImageModal}
        />
      )}
    </>
  );
};

export default BundleGallery;
