import { ApiService } from './api';
import { BundleStorage } from '../common/bundle.storage';
import { config } from '../config/env';
import { BundleData } from '../models';

export class BundleService {
  constructor(private api: ApiService) {}

  // Helper method to get S3 URL for bundle features directory
  getFeaturesDirUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id);
    const featuresPath = bundleStorage.getFeaturesDir();
    return `${config.s3BucketUrl}/${featuresPath}`;
  }

  // Helper method to get S3 URL for mapped index file
  getMappedIndexUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id);
    const mappedIndexPath = bundleStorage.getMappedIndex();
    return `${config.s3BucketUrl}/${mappedIndexPath}`;
  }

  // Helper method to get S3 URL for nearest items file
  getNearestFileUrl(bundleData: BundleData, itemId: string): string {
    const bundleStorage = new BundleStorage(bundleData._id);
    const nearestPath = bundleStorage.getNearestFile(itemId);
    return `${config.s3BucketUrl}/${nearestPath}`;
  }

  // Helper method to get S3 URL for 3D database file
  get3DDatabaseUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id);
    const dbPath = bundleStorage.get3DDatabaseFile();
    return `${config.s3BucketUrl}/${dbPath}`;
  }

  // Helper method to get S3 URL for 3D points file
  get3DPointsUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id);
    const pointsPath = bundleStorage.get3DPointsFile();
    return `${config.s3BucketUrl}/${pointsPath}`;
  }

  // Helper method to get S3 URL for 3D images file
  get3DImagesUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id);
    const imagesPath = bundleStorage.get3DImagesFile();
    return `${config.s3BucketUrl}/${imagesPath}`;
  }

  // Helper method to get S3 URL for 3D cameras file
  get3DCamerasUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id);
    const camerasPath = bundleStorage.get3DCamerasFile();
    return `${config.s3BucketUrl}/${camerasPath}`;
  }

  // Helper method to get S3 URL for cameras JSON file
  getCamerasUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id);
    const camerasPath = bundleStorage.getCamerasFile();
    return `${config.s3BucketUrl}/${camerasPath}`;
  }

  // Helper method to get S3 URL for 3D mesh file
  get3DMeshUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id);
    const meshPath = bundleStorage.get3DMeshFile();
    return `${config.s3BucketUrl}/${meshPath}`;
  }

  // Helper method to get S3 URL for 3D mesh geometry file
  get3DMeshGeometryUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id);
    const geometryPath = bundleStorage.get3DMeshGeometryFile();
    return `${config.s3BucketUrl}/${geometryPath}`;
  }

  // Helper method to get S3 URL for 3D mesh material file
  get3DMeshMaterialUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id);
    const materialPath = bundleStorage.get3DMeshMaterialFile();
    return `${config.s3BucketUrl}/${materialPath}`;
  }

  // Helper method to get S3 URL for 3D textured mesh config file
  get3DTexturedConfUrl(bundleData: BundleData): string {
    const bundleStorage = new BundleStorage(bundleData._id);
    const confPath = bundleStorage.get3DTexturedConfFile();
    return `${config.s3BucketUrl}/${confPath}`;
  }

  async getBundles() {
    return this.api.get<BundleData[]>('/bundles');
  }

  async getBundle(id: string) {
    return this.api.get<BundleData>(`/bundles/${id}`, { timeout: 180000 });
  }

  async runFeature(bundleId: string) {
    return this.api.post(`/bundles/${bundleId}/features`, {}, { timeout: 180000 });
  }

  async runReconstruction(bundleId: string) {
    return this.api.post(`/bundles/${bundleId}/construction`, {}, { timeout: 180000 });
  }

  async runMesh(bundleId: string) {
    return this.api.post(`/bundles/${bundleId}/mesh`, {}, { timeout: 180000 });
  }

  async runMatches(bundleId: string) {
    return this.api.post(`/bundles/${bundleId}/matches`, {}, { timeout: 180000 });
  }

  async runAll(bundleId: string) {
    return this.api.post(`/bundles/${bundleId}/run-all`, {}, { timeout: 180000 });
  }

  async createBundle(itemIds: string[]) {
    return this.api.post<BundleData>('/bundles', { itemIds }, { timeout: 180000 });
  }

  async research(bundleId: string, imageId: string) {
    return this.api.get<{ data: Array<{ itemId: string; distance: number }>; msgCode: string; code: number }>(`/bundles/${bundleId}/search/${imageId}`, { timeout: 180000 });
  }
}
