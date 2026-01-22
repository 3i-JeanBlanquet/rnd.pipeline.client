import { ApiService } from './api';
import { BundleStorage } from '../common/bundle.storage';
import { config } from '../config/env';
import { BundleData } from '../models';

export class BundleService {
  constructor(private api: ApiService) {}

  // Helper method to get S3 URL for bundle features directory
  getFeaturesDirUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id,bundleData.textureFilenames);
    const featuresPath = bundleStorage.getFeaturesDir();
    return `${config.s3BucketUrl}/${featuresPath}`;
  }

  // Helper method to get S3 URL for mapped index file
  getMappedIndexUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id,bundleData.textureFilenames);
    const mappedIndexPath = bundleStorage.getMappedIndex();
    return `${config.s3BucketUrl}/${mappedIndexPath}`;
  }

  // Helper method to get S3 URL for nearest items file
  getNearestFileUrl(bundleData: BundleData, itemId: string): string {
    const bundleStorage = new BundleStorage(bundleData._id,bundleData.textureFilenames);
    const nearestPath = bundleStorage.getNearestFile(itemId);
    return `${config.s3BucketUrl}/${nearestPath}`;
  }

  // Helper method to get S3 URL for 3D database file
  get3DDatabaseUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id,bundleData.textureFilenames);
    const dbPath = bundleStorage.get3DDatabaseFile();
    return `${config.s3BucketUrl}/${dbPath}`;
  }

  // Helper method to get S3 URL for 3D points file
  get3DPointsUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id,bundleData.textureFilenames);
    const pointsPath = bundleStorage.get3DPointsFile();
    return `${config.s3BucketUrl}/${pointsPath}`;
  }

  // Helper method to get S3 URL for 3D images file
  get3DImagesUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id,bundleData.textureFilenames);
    const imagesPath = bundleStorage.get3DImagesFile();
    return `${config.s3BucketUrl}/${imagesPath}`;
  }

  // Helper method to get S3 URL for 3D cameras file
  get3DCamerasUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id,bundleData.textureFilenames);
    const camerasPath = bundleStorage.get3DCamerasFile();
    return `${config.s3BucketUrl}/${camerasPath}`;
  }

  // Helper method to get S3 URL for cameras JSON file
  getCamerasUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id,bundleData.textureFilenames);
    const camerasPath = bundleStorage.getCamerasFile();
    return `${config.s3BucketUrl}/${camerasPath}`;
  }

  // Helper method to get S3 URL for 3D mesh file
  get3DMeshUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id,bundleData.textureFilenames);
    const meshPath = bundleStorage.get3DMeshFile();
    return `${config.s3BucketUrl}/${meshPath}`;
  }

  // Helper method to get S3 URL for 3D mesh geometry file
  get3DMeshGeometryUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id,bundleData.textureFilenames);
    const geometryPath = bundleStorage.get3DMeshGeometryFile();
    return `${config.s3BucketUrl}/${geometryPath}`;
  }

  // Helper method to get S3 URL for 3D mesh material file
  getPointCloudFileUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id,bundleData.textureFilenames);
    const materialPath = bundleStorage.getPointCloudFile();
    return `${config.s3BucketUrl}/${materialPath}`;
  }

  // Helper method to get S3 URL for 3D mesh material file
  get3DMeshMaterialUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id,bundleData.textureFilenames);
    const materialPath = bundleStorage.get3DMeshMaterialFile();
    return `${config.s3BucketUrl}/${materialPath}`;
  }

  // Helper method to get S3 URL for 3D textured mesh config file
  get3DTexturedConfUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id,bundleData.textureFilenames);
    const confPath = bundleStorage.get3DTexturedConfFile();
    return `${config.s3BucketUrl}/${confPath}`;
  }

  get3DTextures(bundleData: BundleData): {url:string,path:string,name:string}[] {
    if (!bundleData.textureFilenames || bundleData.textureFilenames.length === 0) {
      return [];
    }
    const bundleStorage = new BundleStorage(bundleData._id, bundleData.textureFilenames);
    return bundleData.textureFilenames.map(textureFile => ({
      url: `${config.s3BucketUrl}/${bundleStorage.get3DDir()}/${textureFile}`,
      path: `3d/${textureFile}`,
      name: textureFile,
    }));
  }

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
    return this.api.post(`/bundles/${bundleId}/floorplan`, {});
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
    return this.api.get<{ data: Array<{ itemId: string; distance: number }>; msgCode: string; code: number }>(`/bundles/${bundleId}/search/${imageId}`);
  }
}
