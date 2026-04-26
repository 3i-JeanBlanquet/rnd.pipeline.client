import { ApiService } from './api';
import { ImageData, GetItemsRequest } from '../models';

export class ImageService {
  constructor(private api: ApiService) {}

  async getImages(limit: number = 20, request?: GetItemsRequest) {
    if (request) {
      const params = new URLSearchParams();

      if (request.page !== undefined) params.append('page', request.page.toString());
      if (request.limit !== undefined) params.append('limit', request.limit.toString());
      else if (limit) params.append('limit', limit.toString());

      if (request.sortBy) params.append('sortBy', request.sortBy);
      if (request.sortOrder) params.append('sortOrder', request.sortOrder);

      if (request.filter) {
        if (request.filter._id) params.append('filter[_id]', request.filter._id);
        if (request.filter.ids && request.filter.ids.length > 0) {
          request.filter.ids.forEach((id) => {
            params.append('filter[ids][]', id);
          });
        }
        if (request.filter.parentId) params.append('filter[parentId]', request.filter.parentId);
        if (request.filter.extension) params.append('filter[extension]', request.filter.extension);
        if (request.filter.tilingStatus) params.append('filter[tilingStatus]', request.filter.tilingStatus);
        if (request.filter.featureStatus) params.append('filter[featureStatus]', request.filter.featureStatus);
        if (request.filter.depthStatus) params.append('filter[depthStatus]', request.filter.depthStatus);
        if (request.filter.hasCameraInfo !== undefined)
          params.append('filter[hasCameraInfo]', request.filter.hasCameraInfo.toString());
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

  /** API returns { resultCd, resultMsg, data: { id, urls: string[] } } */
  async createIntent(itemId: string, extension: string) {
    return this.api.post<{
      resultCd: number;
      resultMsg: string;
      data: { id: string; urls: string[] };
    }>(`/items/${itemId}/intent`, {
      id: itemId,
      extension,
    });
  }

  async confirmUpload(itemId: string) {
    return this.api.post<ImageData>(`/items/${itemId}/confirm`, {
      id: itemId,
    });
  }

  async uploadToS3Url(url: string, file: File): Promise<void> {
    const body: File | ArrayBuffer = file;
    const headers: Record<string, string> | undefined = undefined;

    const response = await fetch(url, {
      method: 'PUT',
      body,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw {
        message: `Failed to upload to S3: ${response.status} ${errorText}`,
        status: response.status,
        code: 'S3_UPLOAD_ERROR',
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
      force,
    };

    console.log('Pano request details:', {
      endpoint: `/items/${itemId}/pano`,
      method: 'POST',
      body: requestBody,
    });

    return this.api.post(`/items/${itemId}/pano`, requestBody);
  }

  async runFeature(itemId: string, requestId: string, force: boolean = true) {
    const requestBody = {
      itemId,
      requestId,
      force,
    };

    console.log('Feature request details:', {
      endpoint: `/items/${itemId}/feature`,
      method: 'POST',
      body: requestBody,
    });

    return this.api.post(`/items/${itemId}/feature`, requestBody);
  }

  async runDepth(itemId: string, requestId: string, force: boolean = true) {
    const requestBody = {
      itemId,
      requestId,
      force,
    };

    console.log('Depth request details:', {
      endpoint: `/items/${itemId}/deep`,
      method: 'POST',
      body: requestBody,
    });

    return this.api.post(`/items/${itemId}/deep`, requestBody);
  }

  async runAutoleveling(itemId: string, requestId: string, force: boolean = true) {
    const requestBody = {
      itemId,
      requestId,
      force,
    };

    console.log('Autoleveling request details:', {
      endpoint: `/items/${itemId}/autoleveling`,
      method: 'POST',
      body: requestBody,
    });

    return this.api.post(`/items/${itemId}/autoleveling`, requestBody);
  }
}
