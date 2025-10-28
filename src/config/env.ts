// Environment configuration
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4999',
  s3BucketUrl: import.meta.env.VITE_S3_BUCKET_URL || 'https://s3.ap-northeast-2.amazonaws.com/3i.beamo.tmp',
};
