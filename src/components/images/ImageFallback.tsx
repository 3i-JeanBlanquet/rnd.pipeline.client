import React from 'react';

interface ImageFallbackProps {
  imageType: string;
  size?: string;
}

const ImageFallback: React.FC<ImageFallbackProps> = ({ imageType, size = '60px' }) => (
  <div style={{
    width: size,
    height: size,
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: '#6c757d',
    textAlign: 'center',
    padding: '4px'
  }}>
    {imageType}<br/>Not Available
  </div>
);

export default ImageFallback;

