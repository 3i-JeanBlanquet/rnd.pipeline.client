// Environment configuration
// Supports both build-time (Vite) and runtime (Docker) environment variables
// Runtime config is injected via window.__ENV__ at container startup
declare global {
  interface Window {
    __ENV__?: {
      VITE_API_BASE_URL?: string;
      VITE_S3_BUCKET_URL?: string;
    };
  }
}

const getRuntimeEnv = (key: string): string | undefined => {
  if (typeof window === 'undefined' || !window.__ENV__) {
    return undefined;
  }
  const value = window.__ENV__[key as keyof typeof window.__ENV__];
  return typeof value === 'string' && value !== '' ? value : undefined;
};

export const config = {
  apiBaseUrl: getRuntimeEnv('VITE_API_BASE_URL') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4999',
  s3BucketUrl: getRuntimeEnv('VITE_S3_BUCKET_URL') || import.meta.env.VITE_S3_BUCKET_URL || 'https://s3.ap-northeast-2.amazonaws.com/3i.beamo.tmp',
};
