import { ProcessingStatus } from './ProcessingStatus';

export interface INearestItem {
  itemId: string;
  score: number;
}

export interface BundleData {
  _id: string;
  id: string;
  itemIds: string[];
  textureFilenames:string[];
  // itemId -> closest itemId -> score
  nearestItems: Map<string, INearestItem[]>;
  featureStatus: ProcessingStatus;
  matchStatus: ProcessingStatus;
  depthStatus: ProcessingStatus;
  reconstruction: ProcessingStatus;
  meshStatus: ProcessingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
