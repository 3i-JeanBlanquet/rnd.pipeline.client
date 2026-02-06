import { ApiService } from './api';
import { ClipData, GetClipsRequest } from '../models';

// Intent request: extension required; parts (1–10000) and expiresIn (60–604800s) optional
export interface CreateIntentBody {
  extension: string;
  parts?: number;
  expiresIn?: number;
}

// Intent response: single PUT (url) or multipart (urls array)
export interface CreateIntentResponseSingle {
  url: string;
  id: string;
}

export interface CreateIntentResponseMultipart {
  id: string;
  uploadId?: string;
  urls: string[];
}

export type CreateIntentResponse = CreateIntentResponseSingle | CreateIntentResponseMultipart;

export function isMultipartIntent(
  data: CreateIntentResponse
): data is CreateIntentResponseMultipart {
  return 'urls' in data && Array.isArray((data as CreateIntentResponseMultipart).urls);
}

// Confirm request: uploadId and parts optional (used for multipart)
export interface ConfirmUploadPart {
  PartNumber: number;
  ETag: string;
}

export interface ConfirmUploadBody {
  uploadId?: string;
  parts?: ConfirmUploadPart[];
}

export class ClipService {
  constructor(private api: ApiService) {}

  async uploadClip(file: File, clipId: string) {
    return this.api.uploadClipFile<ClipData>(`/clips/${clipId}`, file);
  }

  async createIntent(clipId: string, body: CreateIntentBody) {
    return this.api.post<{ data: CreateIntentResponse }>(`/clips/${clipId}/intent`, body);
  }

  async confirmUpload(clipId: string, body?: ConfirmUploadBody) {
    return this.api.post<ClipData>(`/clips/${clipId}/confirm`, body ?? {});
  }

  async uploadToS3Url(url: string, file: File): Promise<void> {
    const response = await fetch(url, {
      method: 'PUT',
      body: file,
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

  /**
   * Upload file in parts to S3 presigned URLs (order = part 1, 2, ...). Returns parts for confirm (PartNumber, ETag).
   * Expects the intent to have been requested with parts = ceil(file.size / 5MB) so the backend returns that many URLs and each part is >= S3 minimum 5MB.
   */
  async uploadMultipartToS3(urls: string[], file: File): Promise<ConfirmUploadPart[]> {
    const partSize = Math.ceil(file.size / urls.length);
    const results: ConfirmUploadPart[] = [];

    for (let i = 0; i < urls.length; i++) {
      const partNumber = i + 1;
      const start = i * partSize;
      const end = i === urls.length - 1 ? file.size : (i + 1) * partSize;
      const blob = file.slice(start, end);

      const response = await fetch(urls[i], {
        method: 'PUT',
        body: blob,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw {
          message: `Failed to upload part ${partNumber}: ${response.status} ${errorText}`,
          status: response.status,
          code: 'S3_MULTIPART_UPLOAD_ERROR',
        };
      }

      const etag = response.headers.get('ETag')?.trim() ?? '';
      results.push({ PartNumber: partNumber, ETag: etag });
    }

    return results;
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

