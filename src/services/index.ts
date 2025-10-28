import { apiService } from './api';
import { ImageService } from './imageService';

// Export image service instance
export const imageService = new ImageService(apiService);