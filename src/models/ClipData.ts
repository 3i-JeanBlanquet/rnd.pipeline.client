import { ProcessingStatus } from "./ProcessingStatus";

export interface ClipData {
  _id: string;
  extension?: string;
  size:string;
  status?: ProcessingStatus;
  itemIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

