import { apiService, ApiError, ApiResponse } from './api';
import { ImageService } from './imageService';
import { MatchService } from './matchService';
import { BundleService } from './bundleService';
import { ImageData, MatchData, MatchDetails, MatchesListResponse, BundleData, ProcessingStatus } from '../models';

// Export service instances
export const imageService = new ImageService(apiService);
export const matchService = new MatchService(apiService);
export const bundleService = new BundleService(apiService);

// Export types and enums
export type { ApiError, ApiResponse, ImageData, MatchData, MatchDetails, MatchesListResponse, BundleData };
export { ProcessingStatus };