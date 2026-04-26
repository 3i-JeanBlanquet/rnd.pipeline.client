import { ApiService } from './api';
import { MatchData, MatchDetails, GetMatchesRequest, MatchesListResponse } from '../models';

export class MatchService {
  constructor(private api: ApiService) {}

  async getMatches(limit: number = 20, request?: GetMatchesRequest) {
    if (request) {
      const params = new URLSearchParams();

      if (request.page !== undefined) params.append('page', request.page.toString());
      if (request.limit !== undefined) params.append('limit', request.limit.toString());
      else if (limit) params.append('limit', limit.toString());

      if (request.sortBy) params.append('sortBy', request.sortBy);
      if (request.sortOrder) params.append('sortOrder', request.sortOrder);

      if (request.filter) {
        if (request.filter.ids && request.filter.ids.length > 0) {
          request.filter.ids.forEach((id) => {
            params.append('filter[ids][]', id);
          });
        }
        if (request.filter.itemId0) params.append('filter[itemId0]', request.filter.itemId0);
        if (request.filter.itemId1) params.append('filter[itemId1]', request.filter.itemId1);
      }

      const queryString = params.toString();
      return this.api.get<MatchData[]>(`/matches${queryString ? `?${queryString}` : ''}`);
    }

    return this.api.get<MatchData[]>(`/matches?limit=${limit}`);
  }

  async getMatch(id: string) {
    return this.api.get<MatchDetails>(`/matches/${id}`);
  }

  async getMatchesByBundleId(
    bundleId: string,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ) {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);

    const queryString = params.toString();
    return this.api.get<MatchesListResponse>(
      `/matches/bundle/${bundleId}${queryString ? `?${queryString}` : ''}`
    );
  }

  async createMatch(itemId: string, itemId2: string, requestId?: string, force: boolean = true) {
    const finalRequestId = requestId || itemId;

    const requestBody = {
      itemId,
      itemId2,
      requestId: finalRequestId,
      force,
    };

    console.log('Create match request details:', {
      endpoint: `/matches/${itemId}`,
      method: 'POST',
      body: requestBody,
    });

    return this.api.post<MatchData>(`/matches/${itemId}`, requestBody);
  }
}
