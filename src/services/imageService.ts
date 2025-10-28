import { ApiService } from './api';
import { ItemStorage } from '../common/item.storage';
import { config } from '../config/env';

export interface ImageData {
  _id: string;
  filename: string;
  originalName: string;
  extension: string;
  parentId?: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

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

  async getImages() {
    return this.api.get<ImageData[]>('/items');
  }

  async getImage(id: string) {
    return this.api.get<ImageData>(`/items/${id}`);
  }

  async uploadImage(file: File, itemId: string) {
    return this.api.uploadFile<ImageData>(`/items/${itemId}`, file);
  }

  async updateImage(id: string, imageData: Partial<ImageData>) {
    return this.api.put<ImageData>(`/items/${id}`, imageData);
  }

  async deleteImage(id: string) {
    return this.api.delete(`/items/${id}`);
  }
}