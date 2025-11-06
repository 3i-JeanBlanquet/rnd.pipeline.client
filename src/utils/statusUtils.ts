import { ProcessingStatus } from '../services';

export const getStatusColor = (status: ProcessingStatus): string => {
  switch (status) {
    case ProcessingStatus.COMPLETED:
      return '#d4edda';
    case ProcessingStatus.PROCESSING:
      return '#fff3cd';
    case ProcessingStatus.FAILED:
      return '#f8d7da';
    case ProcessingStatus.PENDING:
    default:
      return '#e2e3e5';
  }
};

export const getStatusTextColor = (status: ProcessingStatus): string => {
  switch (status) {
    case ProcessingStatus.COMPLETED:
      return '#155724';
    case ProcessingStatus.PROCESSING:
      return '#856404';
    case ProcessingStatus.FAILED:
      return '#721c24';
    case ProcessingStatus.PENDING:
    default:
      return '#383d41';
  }
};

