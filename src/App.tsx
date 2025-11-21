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
import logoImage from './assets/3i.png';
import ItemListIcon from './components/icons/ItemListIcon';
import MatchAddIcon from './components/icons/MatchAddIcon';
import MatchListIcon from './components/icons/MatchListIcon';
import BundleListIcon from './components/icons/BundleListIcon';

const App: React.FC = () => {
  const [_images, setImages] = useState<ImageData[]>([]);
  const [bundles, setBundles] = useState<BundleData[]>([]);
  const [_loading, setLoading] = useState(false);
  const [bundlesLoading, setBundlesLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [bundlesError, setBundlesError] = useState<string | null>(null);

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

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{ 
        textAlign: 'center', 
        padding: '20px',
        backgroundColor: 'rgb(0,89,255)',
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
          style={{
            height: '40px',
            width: 'auto'
          }}
        />
      </header>

      <div style={{ 
        width: '100%',
        boxSizing: 'border-box',
        flex: 1,
        margin: 0,
        padding: 0
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 0,
          width: '100%'
        }}>
          <Expandable 
            title="ITEM › ADD"
            icon={<ItemListIcon />}
          >
            <ImageCreate onUploadSuccess={fetchImages} />
          </Expandable>
          
          <Expandable 
            title="ITEM › LIST"
            icon={<ItemListIcon />}
          >
            <ImageGallery />
          </Expandable>
          
          <Expandable 
            title="MATCH › ADD"
            icon={<MatchAddIcon />}
          >
            <MatchCreate />
          </Expandable>
          
          <Expandable 
            title="MATCH › LIST" 
            icon={<MatchListIcon />}
          >
            <MatchGallery />
          </Expandable>
          
          <Expandable 
            title="BUNDLE › ADD"
            icon={<BundleListIcon />}
          >
            <BundleCreate 
              onCreateSuccess={fetchBundles}
            />
          </Expandable>
          
          <Expandable 
            title="BUNDLE › LIST" 
            badge={bundles.length}
            icon={<BundleListIcon />}
          >
            <BundleGallery 
              bundles={bundles}
              loading={bundlesLoading}
              error={bundlesError}
              onRefresh={fetchBundles}
            />
          </Expandable>
        </div>
      </div>

      <footer style={{
        textAlign: 'center',
        padding: '20px',
        backgroundColor: 'rgb(0,89,255)',
        width: '100%',
        boxSizing: 'border-box',
        color: '#fff',
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
