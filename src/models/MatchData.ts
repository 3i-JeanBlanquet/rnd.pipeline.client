export interface MatchData {
  _id: string;
  id: string;
  itemId0: string;
  itemId1: string;
  createdAt: string;
  status: string;
  imageCount?: number;
  validMatchesCount?: number;
}

export interface MatchDetails extends MatchData {
  pose?: {
    R: number[][];
    t: number[][];
  };
  validMatches?: {
    valid_matches0_count: number;
    valid_matches1_count: number;
  };
}

export interface MatchesListResponse {
  items: MatchData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
