import { ProcessingStatus } from './ProcessingStatus';

export interface INearestItem {
  itemId: string;
  score: number;
}

export interface BundleData {
  _id: string;
  id: string;
  itemIds: string[];
  // itemId -> closest itemId -> score
  nearestItems: Map<string, INearestItem[]>;
  featureStatus: ProcessingStatus;
  // todo: rename to positioningStatus
  reconstruction: ProcessingStatus;
  meshStatus: ProcessingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
