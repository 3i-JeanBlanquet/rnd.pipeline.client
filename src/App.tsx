import React, { useState, useEffect, useRef } from 'react';
import { imageService, ApiError, ImageData } from './services';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [itemId, setItemId] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [showDepthImage, setShowDepthImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await imageService.getImages();
      console.log('API Response:', response);
      
      // Handle different response structures
      let imagesData = response.data;
      if (Array.isArray(imagesData)) {
        setImages(imagesData);
      } else if (imagesData && Array.isArray(imagesData.items)) {
        setImages(imagesData.items);
      } else if (imagesData && Array.isArray(imagesData.data)) {
        setImages(imagesData.data);
      } else {
        console.warn('Unexpected response structure:', imagesData);
        setImages([]);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(`Failed to fetch images: ${apiError.message}`);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !itemId) return;

    setUploading(true);
    setError(null);
    try {
      await imageService.uploadImage(selectedFile, itemId);
      setSelectedFile(null);
      setItemId('');
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await fetchImages(); // Refresh the list
    } catch (err) {
      const apiError = err as ApiError;
      setError(`Failed to upload image: ${apiError.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await imageService.deleteImage(id);
      await fetchImages(); // Refresh the list
    } catch (err) {
      const apiError = err as ApiError;
      setError(`Failed to delete image: ${apiError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const handleImageClick = (image: ImageData) => {
    setSelectedImage(image);
    setShowDepthImage(false);
  };

  const handleDepthImageClick = (image: ImageData) => {
    setSelectedImage(image);
    setShowDepthImage(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setShowDepthImage(false);
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <h1 style={{ color: '#333', margin: '0' }}>
          Pipeline Management App
        </h1>
        <p style={{ color: '#666', margin: '10px 0 0 0' }}>
          Upload, view, and manage your images
        </p>
      </header>

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

      <div style={{ display: 'grid', gap: '30px' }}>
        {/* Image Upload Form */}
        <section style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: '0', color: '#333' }}>Upload New Image</h2>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: '100%'
                }}
              />
              <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
                Supported formats: JPG, PNG, GIF, WebP (Max size: 10MB)
              </p>
            </div>
            
            {previewUrl && (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
                  {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
                </p>
              </div>
            )}
            
            <input
              type="text"
              placeholder="Item ID (required)"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '100%'
              }}
            />
            
            <button
              type="submit"
              disabled={uploading || !selectedFile || !itemId}
              style={{
                padding: '10px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: uploading || !selectedFile || !itemId ? 'not-allowed' : 'pointer',
                opacity: uploading || !selectedFile || !itemId ? 0.6 : 1,
                fontSize: '16px'
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>
        </section>

        {/* Images Gallery */}
        <section style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: '0', color: '#333' }}>Images</h2>
            <button
              onClick={fetchImages}
              disabled={loading}
              style={{
                padding: '6px 12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading && (!Array.isArray(images) || images.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading images...
            </div>
          ) : !Array.isArray(images) || images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No images found. Upload your first image above!
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
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Image</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Depth</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {images.map((image) => (
                    <tr key={image.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ padding: '4px' }}>
                        <img
                          src={imageService.getImageUrl(image)}
                          alt={image.originalName}
                          onClick={() => handleImageClick(image)}
                          style={{
                            width: '30px',
                            height: '30px',
                            objectFit: 'cover',
                            borderRadius: '2px',
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
                        />
                      </td>
                      <td style={{ padding: '4px' }}>
                        <img
                          src={imageService.getDepthUrl(image)}
                          alt={`${image.originalName} - Depth`}
                          onClick={() => handleDepthImageClick(image)}
                          style={{
                            width: '30px',
                            height: '30px',
                            objectFit: 'cover',
                            borderRadius: '2px',
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
                        />
                      </td>
                      <td style={{ padding: '4px', fontSize: '12px', color: '#333' }}>
                        {image._id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>

      {/* Image Modal */}
      {selectedImage && (
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
          onClick={closeImageModal}
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
              onClick={closeImageModal}
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
              src={showDepthImage ? imageService.getDepthUrl(selectedImage) : imageService.getImageUrl(selectedImage)}
              alt={showDepthImage ? `${selectedImage.originalName} - Depth` : selectedImage.originalName}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#333' }}>
                <strong>ID:</strong> {selectedImage._id}
              </p>
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                {showDepthImage ? `${selectedImage.originalName} - Depth Image` : selectedImage.originalName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
