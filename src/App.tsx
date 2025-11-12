import React, { useState, useEffect } from 'react';
import { imageService, matchService, bundleService, ApiError, ImageData, MatchData, BundleData } from './services';
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
  const [images, setImages] = useState<ImageData[]>([]);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [bundles, setBundles] = useState<BundleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [bundlesLoading, setBundlesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [bundlesError, setBundlesError] = useState<string | null>(null);

  // Fetch images, matches, and bundles on component mount
  useEffect(() => {
    fetchImages();
    fetchMatches();
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

  const fetchMatches = async () => {
    setMatchesLoading(true);
    setMatchesError(null);
    try {
      const response = await matchService.getMatches();
      console.log('Matches API Response:', response);
      
      // Handle different response structures
      let matchesData = response.data;
      if (Array.isArray(matchesData)) {
        setMatches(matchesData);
      } else if (matchesData && typeof matchesData === 'object' && 'items' in matchesData && Array.isArray((matchesData as any).items)) {
        setMatches((matchesData as any).items);
      } else if (matchesData && typeof matchesData === 'object' && 'data' in matchesData && Array.isArray((matchesData as any).data)) {
        setMatches((matchesData as any).data);
      } else {
        console.warn('Unexpected matches response structure:', matchesData);
        setMatches([]);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setMatchesError(`Failed to fetch matches: ${apiError.message}`);
      setMatches([]);
    } finally {
      setMatchesLoading(false);
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
            <MatchCreate 
              onCreateSuccess={fetchMatches}
            />
          </Expandable>
          
          <Expandable 
            title="MATCH › LIST" 
            badge={matches.length}
            icon={<MatchListIcon />}
          >
            <MatchGallery 
              matches={matches}
              loading={matchesLoading}
              error={matchesError}
              onRefresh={fetchMatches}
            />
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
