import React, { useState } from 'react';
import { BundleData, ProcessingStatus, imageService, bundleService } from '../services';
import { ImageData } from '../models';
import JSZip from 'jszip';
import ImageViewerModal from './ImageViewerModal';

interface BundleGalleryProps {
  bundles: BundleData[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onDeleteBundle?: (id: string) => void;
}

const BundleGallery: React.FC<BundleGalleryProps> = ({ 
  bundles, 
  loading, 
  error, 
  onRefresh,
  onDeleteBundle
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

  const getStatusColor = (status: ProcessingStatus): string => {
    switch (status) {
      case ProcessingStatus.PROCESSED:
        return '#d4edda';
      case ProcessingStatus.PROCESSING:
        return '#fff3cd';
      case ProcessingStatus.FAILED:
        return '#f8d7da';
      case ProcessingStatus.PENDING:
      default:
        return '#e2e3e5';
    }
  };

  const getStatusTextColor = (status: ProcessingStatus): string => {
    switch (status) {
      case ProcessingStatus.PROCESSED:
        return '#155724';
      case ProcessingStatus.PROCESSING:
        return '#856404';
      case ProcessingStatus.FAILED:
        return '#721c24';
      case ProcessingStatus.PENDING:
      default:
        return '#383d41';
    }
  };

  // Download a single file
  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
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
      console.error(`Error downloading ${filename}:`, error);
      alert(`Failed to download ${filename}. Please check if the file exists.`);
    }
  };

  // Download all bundle files as a zip
  const downloadBundleAsZip = async (bundle: BundleData) => {
    setDownloading(bundle._id);
    try {
      const zip = new JSZip();
      const files: Array<{ url: string; path: string; name: string }> = [];

      // Add all 3D database files (attempt all regardless of status)
      files.push({
        url: bundleService.get3DDatabaseUrl(bundle),
        path: '3d/data.db',
        name: 'data.db'
      });
      files.push({
        url: bundleService.get3DPointsUrl(bundle),
        path: '3d/points3D.bin',
        name: 'points3D.bin'
      });
      files.push({
        url: bundleService.get3DImagesUrl(bundle),
        path: '3d/images.bin',
        name: 'images.bin'
      });
      files.push({
        url: bundleService.get3DCamerasUrl(bundle),
        path: '3d/cameras.bin',
        name: 'cameras.bin'
      });
      files.push({
        url: bundleService.getCamerasUrl(bundle),
        path: '3d/cameras.json',
        name: 'cameras.json'
      });

      // Add all mesh files (attempt all regardless of status)
      files.push({
        url: bundleService.get3DMeshUrl(bundle),
        path: '3d/mesh.ply',
        name: 'mesh.ply'
      });
      files.push({
        url: bundleService.get3DMeshGeometryUrl(bundle),
        path: '3d/textured_mesh.obj',
        name: 'textured_mesh.obj'
      });
      files.push({
        url: bundleService.get3DMeshMaterialUrl(bundle),
        path: '3d/textured_mesh.mtl',
        name: 'textured_mesh.mtl'
      });
      files.push({
        url: bundleService.get3DTexturedConfUrl(bundle),
        path: '3d/textured_mesh.conf',
        name: 'textured_mesh.conf'
      });

      // Fetch all files and add to zip
      let successCount = 0;
      let failCount = 0;

      for (const file of files) {
        try {
          const response = await fetch(file.url);
          if (response.ok) {
            const blob = await response.blob();
            zip.file(file.path, blob);
            successCount++;
          } else {
            console.warn(`Failed to fetch ${file.name}: ${response.status}`);
            failCount++;
          }
        } catch (error) {
          console.error(`Error fetching ${file.name}:`, error);
          failCount++;
        }
      }

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `bundle_${bundle._id}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      if (failCount > 0) {
        alert(`Downloaded ${successCount} files. ${failCount} files could not be downloaded (may not exist yet).`);
      }
    } catch (error) {
      console.error('Error creating zip:', error);
      alert('Failed to create zip file. Please try again.');
    } finally {
      setDownloading(null);
    }
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

        {loading && (!Array.isArray(bundles) || bundles.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading bundles...
          </div>
        ) : !Array.isArray(bundles) || bundles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No bundles found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bundles.map((bundle) => {
              const isExpanded = expandedBundles.has(bundle._id);
              return (
                <div
                  key={bundle.id}
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Main bundle card */}
                  <div
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#f8f9fa',
                      borderBottom: isExpanded ? '1px solid #e9ecef' : 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                    onClick={() => toggleBundleExpansion(bundle._id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e9ecef';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        fontSize: '20px',
                        color: '#666',
                        transition: 'transform 0.3s ease',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                      }}>
                        ▶
                      </div>
                      <div>
                        <h3 style={{ margin: '0', fontSize: '16px', color: '#333', fontWeight: '600' }}>
                          {bundle._id}
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                          {bundle.itemIds.length} items • Created: {bundle.createdAt ? formatDate(bundle.createdAt) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Status badges */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '500',
                          backgroundColor: getStatusColor(bundle.featureStatus),
                          color: getStatusTextColor(bundle.featureStatus)
                        }}>
                          Features: {bundle.featureStatus}
                        </span>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '500',
                          backgroundColor: getStatusColor(bundle.reconstruction),
                          color: getStatusTextColor(bundle.reconstruction)
                        }}>
                          Reconstruction: {bundle.reconstruction}
                        </span>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '500',
                          backgroundColor: getStatusColor(bundle.meshStatus),
                          color: getStatusTextColor(bundle.meshStatus)
                        }}>
                          Mesh: {bundle.meshStatus}
                        </span>
                      </div>
                      
                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadBundleAsZip(bundle);
                          }}
                          disabled={downloading === bundle._id}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: downloading === bundle._id ? '#6c757d' : '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: downloading === bundle._id ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            opacity: downloading === bundle._id ? 0.6 : 1
                          }}
                          title="Download all bundle files as ZIP"
                        >
                          {downloading === bundle._id ? '⏳ Downloading...' : '📦 Download ZIP'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBundleClick(bundle);
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Details
                        </button>
                        {onDeleteBundle && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteBundle(bundle._id);
                            }}
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
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expandable items section */}
                  {isExpanded && (
                    <div style={{ padding: '16px', backgroundColor: '#fff' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <strong style={{ fontSize: '14px', color: '#495057' }}>
                          Items ({bundle.itemIds.length}):
                        </strong>
                      </div>
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        border: '1px solid #dee2e6',
                        maxHeight: '400px',
                        overflowY: 'auto'
                      }}>
                        {bundle.itemIds.map((itemId, index) => {
                          // Create minimal ImageData for getting image URL
                          const imageData: Partial<ImageData> = { _id: itemId, extension: 'jpg' };
                          const imageUrl = imageService.getImageUrl(imageData as ImageData);
                          
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
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                color: '#495057',
                                border: '1px solid #ced4da',
                                cursor: 'default',
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
                  )}
                </div>
              );
            })}
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
                  onClick={() => downloadBundleAsZip(selectedBundle)}
                  disabled={downloading === selectedBundle._id}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: downloading === selectedBundle._id ? '#6c757d' : '#17a2b8',
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
                        backgroundColor: '#28a745',
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
                        backgroundColor: '#28a745',
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
                        backgroundColor: '#28a745',
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
                        backgroundColor: '#28a745',
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
                        backgroundColor: '#28a745',
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
                        backgroundColor: '#28a745',
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
                        backgroundColor: '#28a745',
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
                        backgroundColor: '#28a745',
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
                        backgroundColor: '#28a745',
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
                      const imageData: Partial<ImageData> = { _id: itemId, extension: 'jpg' };
                      const imageUrl = imageService.getImageUrl(imageData as ImageData);
                      
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
