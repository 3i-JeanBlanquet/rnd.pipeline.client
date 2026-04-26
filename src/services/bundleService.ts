import { ApiService } from './api';
import { BundleData } from '../models';

export class BundleService {
  constructor(private api: ApiService) {}

  async getBundles(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());

    const queryString = params.toString();
    return this.api.get<BundleData[]>(`/bundles${queryString ? `?${queryString}` : ''}`);
  }

  async getBundle(id: string) {
    return this.api.get<BundleData>(`/bundles/${id}`);
  }

  async runFeature(bundleId: string) {
    return this.api.post(`/bundles/${bundleId}/features`, {});
  }

  async runDepth(bundleId: string) {
    return this.api.post(`/bundles/${bundleId}/depth`, {});
  }

  async runReconstruction(bundleId: string) {
    return this.api.post(`/bundles/${bundleId}/construction`, {});
  }

  async runMesh(bundleId: string) {
    return this.api.post(`/bundles/${bundleId}/mesh`, {});
  }

  async runFloorplan(bundleId: string) {
    return this.api.post(`/bundles/${bundleId}/floorplan`, { isForce: true });
  }

  async runAutoleveling(bundleId: string) {
    return this.api.post(`/bundles/${bundleId}/autoleveling`, {
      isForce: true,
      hasCallback: false,
    });
  }

  async runMatches(bundleId: string) {
    return this.api.post(`/bundles/${bundleId}/matches`, {});
  }

  async runAll(bundleId: string) {
    return this.api.post(`/bundles/${bundleId}/run-all`, {});
  }

  async createBundle(itemIds: string[]) {
    return this.api.post<BundleData>('/bundles', { itemIds });
  }

  async research(bundleId: string, imageId: string) {
    return this.api.get<{
      data: Array<{ itemId: string; distance: number }>;
      msgCode: string;
      code: number;
    }>(`/bundles/${bundleId}/search/${imageId}`);
  }
}
