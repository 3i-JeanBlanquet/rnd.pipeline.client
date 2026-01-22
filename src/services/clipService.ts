import { ApiService } from './api';
import { ClipData, GetClipsRequest } from '../models';

export class ClipService {
  constructor(private api: ApiService) {}

  async uploadClip(file: File, clipId: string) {
    return this.api.uploadClipFile<ClipData>(`/clips/${clipId}`, file);
  }

  async createIntent(clipId: string, extension: string) {
    return this.api.post<{ data: { url: string; id: string } }>(`/clips/${clipId}/intent`, {
      id: clipId,
      extension
    });
  }

  async confirmUpload(clipId: string) {
    return this.api.post<ClipData>(`/clips/${clipId}/confirm`, {
      id: clipId
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

  async getClips(request?: GetClipsRequest) {
    // Build query string from request parameters
    const params = new URLSearchParams();
    
    if (request) {
      if (request.page !== undefined) params.append('page', request.page.toString());
      if (request.limit !== undefined) params.append('limit', request.limit.toString());
      if (request.sortBy) params.append('sortBy', request.sortBy);
      if (request.sortOrder) params.append('sortOrder', request.sortOrder);
      if (request.id) params.append('id', request.id);
      if (request.extension) params.append('extension', request.extension);
      if (request.isProcessed !== undefined) params.append('isProcessed', request.isProcessed);
    }
    
    const queryString = params.toString();
    return this.api.get<ClipData[]>(`/clips${queryString ? `?${queryString}` : ''}`);
  }

  async getClip(id: string) {
    return this.api.get<ClipData>(`/clips/${id}`);
  }

  async runProcess(clipId: string, force: boolean = true) {
    const requestBody = {
      itemId: clipId,
      force
    };
    
    console.log('Process request details:', {
      endpoint: `/clips/${clipId}/process`,
      method: 'POST',
      body: requestBody
    });
    
    return this.api.post(`/clips/${clipId}/process`, requestBody);
  }
}

