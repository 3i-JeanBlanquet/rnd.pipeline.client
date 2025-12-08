export interface ClipFilterRequest {
  id?: string; // Filter by clip IDs (comma-separated)
  extension?: string;
  isProcessed?: string; // "true" or "false" as string
}

export interface GetClipsRequest {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  id?: string; // Filter by clip IDs (comma-separated)
  extension?: string;
  isProcessed?: string; // "true" or "false" as string
}

