import { ApiService } from './api';
import { ItemStorage } from '../common/item.storage';
import { config } from '../config/env';
import { ImageData, GetItemsRequest } from '../models';

export class ImageService {
  constructor(private api: ApiService) {}

  // Helper method to get S3 URL for an image
  getImageUrl(imageData: ImageData): string {
    const itemStorage = imageData.parentId ? 
      new ItemStorage(imageData._id, imageData.extension, imageData.parentId) 
      : new ItemStorage(imageData._id, imageData.extension);
    const imagePath = itemStorage.getImageFile();
    return `${config.s3BucketUrl}/${imagePath}`;
  }

  // Helper method to get S3 URL for depth image
  getDepthUrl(imageData: ImageData): string {
    const itemStorage = imageData.parentId ? 
      new ItemStorage(imageData._id, imageData.extension, imageData.parentId) 
      : new ItemStorage(imageData._id, imageData.extension);
    const depthPath = itemStorage.getDepthFile();
    return `${config.s3BucketUrl}/${depthPath}`;
  }

  // Helper method to get S3 URL for camera data
  getCameraUrl(imageData: ImageData): string {
    const itemStorage = imageData.parentId ? 
      new ItemStorage(imageData._id, imageData.extension, imageData.parentId) 
      : new ItemStorage(imageData._id, imageData.extension);
    const cameraPath = itemStorage.getCameraFile();
    return `${config.s3BucketUrl}/${cameraPath}`;
  }

  // Helper method to get S3 URL for feature image
  getFeatureUrl(imageData: ImageData): string {
    const itemStorage = imageData.parentId ? 
      new ItemStorage(imageData._id, imageData.extension, imageData.parentId) 
      : new ItemStorage(imageData._id, imageData.extension);
    const featurePath = itemStorage.getFeatureFile();
    return `${config.s3BucketUrl}/${featurePath}`;
  }

  async getImages(limit: number = 20, request?: GetItemsRequest) {
    if (request) {
      // Build query string from request parameters
      const params = new URLSearchParams();
      
      if (request.page !== undefined) params.append('page', request.page.toString());
      if (request.limit !== undefined) params.append('limit', request.limit.toString());
      else if (limit) params.append('limit', limit.toString());
      
      if (request.sortBy) params.append('sortBy', request.sortBy);
      if (request.sortOrder) params.append('sortOrder', request.sortOrder);
      
      if (request.filter) {
        if (request.filter._id) params.append('filter[_id]', request.filter._id);
        if (request.filter.parentId) params.append('filter[parentId]', request.filter.parentId);
        if (request.filter.extension) params.append('filter[extension]', request.filter.extension);
        if (request.filter.tilingStatus) params.append('filter[tilingStatus]', request.filter.tilingStatus);
        if (request.filter.featureStatus) params.append('filter[featureStatus]', request.filter.featureStatus);
        if (request.filter.depthStatus) params.append('filter[depthStatus]', request.filter.depthStatus);
        if (request.filter.hasCameraInfo !== undefined) params.append('filter[hasCameraInfo]', request.filter.hasCameraInfo.toString());
      }
      
      const queryString = params.toString();
      return this.api.get<ImageData[]>(`/items${queryString ? `?${queryString}` : ''}`);
    }
    
    return this.api.get<ImageData[]>(`/items?limit=${limit}`);
  }

  async getImage(id: string) {
    return this.api.get<ImageData>(`/items/${id}`);
  }

  async uploadImage(file: File, itemId: string) {
    return this.api.uploadFile<ImageData>(`/items/${itemId}`, file);
  }

  async createIntent(itemId: string, extension: string) {
    return this.api.post<{ data:{url: string; id: string} }>(`/items/${itemId}/intent`, {
      id: itemId,
      extension
    });
  }

  async confirmUpload(itemId: string) {
    return this.api.post<ImageData>(`/items/${itemId}/confirm`, {
      id: itemId
    });
  }

  async uploadToS3Url(url: string, file: File): Promise<void> {
    
    let body: File | ArrayBuffer = file;
    let headers: Record<string, string> | undefined = undefined;
    
    const response = await fetch(url, {
      method: 'PUT',
      body: body,
      headers: headers
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw {
        message: `Failed to upload to S3: ${response.status} ${errorText}`,
        status: response.status,
        code: 'S3_UPLOAD_ERROR'
      };
    }
  }

  async updateImage(id: string, imageData: Partial<ImageData>) {
    return this.api.put<ImageData>(`/items/${id}`, imageData);
  }

  async deleteImage(id: string) {
    return this.api.delete(`/items/${id}`);
  }

  async runPano(itemId: string, requestId: string, force: boolean = true) {
    const requestBody = {
      itemId,
      requestId,
      force
    };
    
    console.log('Pano request details:', {
      endpoint: `/items/${itemId}/pano`,
      method: 'POST',
      body: requestBody
    });
    
    return this.api.post(`/items/${itemId}/pano`, requestBody);
  }

  async runFeature(itemId: string, requestId: string, force: boolean = true) {
    const requestBody = {
      itemId,
      requestId,
      force
    };
    
    console.log('Feature request details:', {
      endpoint: `/items/${itemId}/feature`,
      method: 'POST',
      body: requestBody
    });
    
    return this.api.post(`/items/${itemId}/feature`, requestBody);
  }

  async runDepth(itemId: string, requestId: string, force: boolean = true) {
    const requestBody = {
      itemId,
      requestId,
      force
    };
    
    console.log('Depth request details:', {
      endpoint: `/items/${itemId}/deep`,
      method: 'POST',
      body: requestBody
    });
    
    return this.api.post(`/items/${itemId}/deep`, requestBody);
  }
}