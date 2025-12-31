import React, { useState } from 'react';
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
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const showProcessingNotification = (_bundleId: string) => {
    setNotificationMessage(`The request is already being processed`);
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
            <ImageCreate onUploadSuccess={() => {}} />
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
            icon={<BundleListIcon color="#333" />}
          >
            <Expandable 
              title="NEW"
              icon={<MatchAddIcon color="#333" />}
          >
            <BundleCreate 
              onCreateSuccess={() => {}}
            />
          </Expandable>
          
          <Expandable 
              title="LIST" 
              icon={<ItemListIcon color="#333" />}
          >
            <BundleGallery 
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
