import React, { useState, useEffect } from 'react';
import { imageService, bundleService, ApiError, ImageData, BundleData } from './services';
import { GetItemsRequest } from './models';
import Expandable from './components/common/Expandable';
import ImageCreate from './components/images/ImageCreate';
import ImageGallery from './components/images/ImageGallery';
import MatchCreate from './components/matches/MatchCreate';
import MatchGallery from './components/matches/MatchGallery';
import BundleGallery from './components/bundles/BundleGallery';
import BundleCreate from './components/bundles/BundleCreate';
import ClipCreate from './components/clips/ClipCreate';
import ClipGallery from './components/clips/ClipGallery';
import Notification from './components/common/Notification';
import logoImage from './assets/3i.png';
import ItemListIcon from './components/icons/ItemListIcon';
import MatchAddIcon from './components/icons/MatchAddIcon';
import BundleListIcon from './components/icons/BundleListIcon';
import styles from './App.module.css';

const App: React.FC = () => {
  const [_images, setImages] = useState<ImageData[]>([]);
  const [bundles, setBundles] = useState<BundleData[]>([]);
  const [_loading, setLoading] = useState(false);
  const [bundlesLoading, setBundlesLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [bundlesError, setBundlesError] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Fetch images and bundles on component mount
  useEffect(() => {
    fetchImages();
    fetchBundles();
  }, []);

  const fetchImages = async (request?: GetItemsRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await imageService.getImages(20, request);
      console.log('API Response:', response);
      
      // Handle different response structures
      let imagesData = response.data;
      if (Array.isArray(imagesData)) {
        setImages(imagesData);
      } else if (imagesData && typeof imagesData === 'object' && 'items' in imagesData && Array.isArray((imagesData as any).items)) {
        setImages((imagesData as any).items);
      } else if (imagesData && typeof imagesData === 'object' && 'data' in imagesData && Array.isArray((imagesData as any).data)) {
        setImages((imagesData as any).data);
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

  const fetchBundles = async () => {
    setBundlesLoading(true);
    setBundlesError(null);
    try {
      const response = await bundleService.getBundles();
      console.log('Bundles API Response:', response);
      
      // Handle different response structures
      let bundlesData = response.data;
      if (Array.isArray(bundlesData)) {
        setBundles(bundlesData);
      } else if (bundlesData && typeof bundlesData === 'object' && 'items' in bundlesData && Array.isArray((bundlesData as any).items)) {
        setBundles((bundlesData as any).items);
      } else if (bundlesData && typeof bundlesData === 'object' && 'data' in bundlesData && Array.isArray((bundlesData as any).data)) {
        setBundles((bundlesData as any).data);
      } else {
        console.warn('Unexpected bundles response structure:', bundlesData);
        setBundles([]);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setBundlesError(`Failed to fetch bundles: ${apiError.message}`);
      setBundles([]);
    } finally {
      setBundlesLoading(false);
    }
  };

  const showProcessingNotification = (bundleId: string) => {
    setNotificationMessage(`Bundle ${bundleId} is already being processed`);
    setShowNotification(true);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'rgb(243,243,243)'
    }}>
      <header style={{ 
        textAlign: 'center', 
        padding: '20px',
        backgroundColor: 'rgb(243,243,243)',
        width: '100%',
        boxSizing: 'border-box',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          src={logoImage} 
          alt="3i Logo" 
          className={styles.logo}
        />
      </header>

      <div style={{ 
        width: '100%',
        boxSizing: 'border-box',
        flex: 1,
        margin: 0,
        padding: '8px'
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 0,
          width: '100%'
        }}>
          {/* CLIP Section */}
          <Expandable 
            title="CLIP"
            icon={<BundleListIcon color="#333" />}
          >
            <Expandable 
              title="NEW"
              icon={<MatchAddIcon color="#333" />}
          >
            <ClipCreate onUploadSuccess={() => {}} />
          </Expandable>
          
          <Expandable 
              title="LIST" 
              icon={<ItemListIcon color="#333" />}
          >
            <ClipGallery />
            </Expandable>
          </Expandable>
          {/* ITEM Section */}
          <Expandable 
            title="ITEM"
            icon={<BundleListIcon color="#333" />}
          >
            <Expandable 
              title="NEW"
              icon={<MatchAddIcon color="#333" />}
          >
            <ImageCreate onUploadSuccess={fetchImages} />
          </Expandable>
          
          <Expandable 
              title="LIST"
              icon={<ItemListIcon color="#333" />}
          >
            <ImageGallery />
            </Expandable>
          </Expandable>
          
          {/* MATCH Section */}
          <Expandable 
            title="MATCH"
            icon={<BundleListIcon color="#333" />}
          >
            <Expandable 
              title="NEW"
              icon={<MatchAddIcon color="#333" />}
          >
            <MatchCreate />
          </Expandable>
          
          <Expandable 
              title="LIST" 
              icon={<ItemListIcon color="#333" />}
          >
            <MatchGallery />
            </Expandable>
          </Expandable>
          
          {/* BUNDLE Section */}
          <Expandable 
            title="BUNDLE"
            badge={bundles.length}
            icon={<BundleListIcon color="#333" />}
          >
            <Expandable 
              title="NEW"
              icon={<MatchAddIcon color="#333" />}
          >
            <BundleCreate 
              onCreateSuccess={fetchBundles}
            />
          </Expandable>
          
          <Expandable 
              title="LIST" 
              icon={<ItemListIcon color="#333" />}
          >
            <BundleGallery 
              bundles={bundles}
              loading={bundlesLoading}
              error={bundlesError}
              onRefresh={fetchBundles}
                onShowProcessingNotification={showProcessingNotification}
            />
            </Expandable>
          </Expandable>
        </div>
      </div>

      <Notification
        message={notificationMessage || ''}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        duration={5000}
      />

      <footer style={{
        textAlign: 'center',
        padding: '20px',
        backgroundColor: 'rgb(243,243,243)',
        width: '100%',
        boxSizing: 'border-box',
        color: '#333',
        marginTop: 'auto',
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 0
      }}>
        <p style={{ margin: '0', fontSize: '14px' }}>
          © 2025 3i - Pipeline Management App
        </p>
      </footer>
    </div>
  );
};

export default App;
