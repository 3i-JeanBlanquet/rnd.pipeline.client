import { ApiService } from './api';
import { MatchStorage } from '../common/matches.storage';
import { config } from '../config/env';
import { MatchData, MatchDetails } from '../models';

export class MatchService {
  constructor(private api: ApiService) {}

  // Helper method to get S3 URL for a match image
  getMatchImageUrl(matchData: MatchData): string {
    const matchStorage = new MatchStorage(matchData._id);
    const imagePath = matchStorage.getImageFile();
    return `${config.s3BucketUrl}/${imagePath}`;
  }

  // Helper method to get S3 URL for matches0 file
  getMatches0Url(matchData: MatchData): string {
    const matchStorage = new MatchStorage(matchData._id);
    const matchesPath = matchStorage.getMatches0File();
    return `${config.s3BucketUrl}/${matchesPath}`;
  }

  // Helper method to get S3 URL for matches1 file
  getMatches1Url(matchData: MatchData): string {
    const matchStorage = new MatchStorage(matchData._id);
    const matchesPath = matchStorage.getMatches1File();
    return `${config.s3BucketUrl}/${matchesPath}`;
  }

  // Helper method to get S3 URL for valid matches file
  getValidMatchesUrl(matchData: MatchData): string {
    const matchStorage = new MatchStorage(matchData._id);
    const validMatchesPath = matchStorage.getValidMatchesFile();
    return `${config.s3BucketUrl}/${validMatchesPath}`;
  }

  // Helper method to get S3 URL for pose estimation file
  getPoseEstimationUrl(matchData: MatchData): string {
    const matchStorage = new MatchStorage(matchData._id);
    const posePath = matchStorage.getPoseEstimation();
    return `${config.s3BucketUrl}/${posePath}`;
  }

  async getMatches() {
    return this.api.get<MatchData[]>('/matches');
  }

  async getMatch(id: string) {
    return this.api.get<MatchDetails>(`/matches/${id}`);
  }

  async createMatch(itemId: string, itemId2: string, requestId?: string, force: boolean = true) {
    // Use itemId as requestId if not provided
    const finalRequestId = requestId || itemId;
    
    const requestBody = {
      itemId,
      itemId2,
      requestId: finalRequestId,
      force
    };
    
    console.log('Create match request details:', {
      endpoint: `/matches/${itemId}`,
      method: 'POST',
      body: requestBody
    });
    
    return this.api.post<MatchData>(`/matches/${itemId}`, requestBody);
  }
}
