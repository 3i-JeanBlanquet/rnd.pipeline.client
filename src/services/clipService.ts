import { ApiService } from './api';
import { ClipData, GetClipsRequest } from '../models';

export class ClipService {
  constructor(private api: ApiService) {}

  async uploadClip(file: File, clipId: string) {
    return this.api.uploadClipFile<ClipData>(`/clips/${clipId}`, file);
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

  async runProcess(clipId: string, requestId: string, force: boolean = true) {
    const requestBody = {
      itemId: clipId,
      requestId,
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

