import React from 'react';
import styles from './ImageFallback.module.css';

interface ImageFallbackProps {
  imageType: string;
  size?: string;
}

const ImageFallback: React.FC<ImageFallbackProps> = ({ imageType, size = '60px' }) => (
  <div className={styles.fallback} style={{ width: size, height: size }}>
    {imageType}<br/>Not Available
  </div>
);

export default ImageFallback;

