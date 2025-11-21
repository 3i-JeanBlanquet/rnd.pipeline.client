export interface MatchFilterRequest {
  ids?: string[];
  itemId0?: string;
  itemId1?: string;
}

export interface GetMatchesRequest {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | '_id' | 'itemId0' | 'itemId1';
  sortOrder?: 'asc' | 'desc';
  filter?: MatchFilterRequest;
}

