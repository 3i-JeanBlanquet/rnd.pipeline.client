import { ProcessingStatus } from './ProcessingStatus';

export interface ImageData {
  _id: string;
  parentId?:string;
  extension:string;
  
  deleted:boolean;
  hasCameraInfo:boolean;
  
  tilingStatus:ProcessingStatus;
  featureStatus:ProcessingStatus;
  depthStatus:ProcessingStatus;
  
  createdAt?: Date;
  updatedAt?: Date;
}


