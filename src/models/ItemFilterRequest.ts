import { ProcessingStatus } from './ProcessingStatus';

export interface ItemFilterRequest {
  _id?: string;
  parentId?: string;
  extension?: string;
  tilingStatus?: ProcessingStatus;
  featureStatus?: ProcessingStatus;
  depthStatus?: ProcessingStatus;
  hasCameraInfo?: boolean;
}

export interface GetItemsRequest {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | '_id' | 'extension' | 'tilingStatus' | 'featureStatus' | 'depthStatus';
  sortOrder?: 'asc' | 'desc';
  filter?: ItemFilterRequest;
}

