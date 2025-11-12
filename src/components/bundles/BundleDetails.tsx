import React from 'react';
import { BundleData, imageService } from '../../services';
import { ImageData } from '../../models';

interface BundleDetailsProps {
  bundle: BundleData;
  onImageClick: (imageUrl: string, imageId: string) => void;
}

const BundleDetails: React.FC<BundleDetailsProps> = ({
  bundle,
  onImageClick
}) => {
  return (
    <div style={{ padding: '16px', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' }}>
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
                onClick={() => onImageClick(imageUrl, itemId)}
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
  );
};

export default BundleDetails;

