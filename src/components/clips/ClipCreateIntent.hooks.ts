import { useState, useRef, useEffect } from 'react';
import { clipService, ApiError, isMultipartIntent } from '../../services';

export interface FileWithId {
  file: File;
  id: string;
  previewUrl: string;
  status: 'pending' | 'intent' | 'uploading' | 'confirming' | 'success' | 'error';
  error?: string;
  uploadUrl?: string;
}

export interface UseClipCreateIntentOptions {
  onUploadSuccess: () => void;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'mp4';
}

// S3 multipart: minimum 5MB per part (except the last). We request this many parts so the backend returns exactly that many presigned URLs.
const S3_MIN_PART_BYTES = 6 * 1024 * 1024; // 5MB
const MAX_PARTS = 10000;

function buildIntentBody(file: File): { parts?: number; expiresIn?: number } {
  if (file.size <= S3_MIN_PART_BYTES) {
    return {}; // single PUT, no parts
  }
  // Request parts = ceil(size/5MB) so each part is >= 5MB and backend returns that many URLs
  const parts = Math.min(MAX_PARTS, Math.ceil(file.size / S3_MIN_PART_BYTES));
  return { parts, expiresIn: 3600 };
}

export function getStatusText(status: FileWithId['status']): string {
  switch (status) {
    case 'intent':
      return 'Creating intent...';
    case 'uploading':
      return 'Uploading to S3...';
    case 'confirming':
      return 'Confirming...';
    case 'success':
      return 'Success';
    case 'error':
      return 'Error';
    default:
      return 'Pending';
  }
}

export function useClipCreateIntent({ onUploadSuccess }: UseClipCreateIntentOptions) {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithId[]>([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: FileWithId[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (!file.type.startsWith('video/')) {
        errors.push(`${file.name}: Please select a valid video file`);
        return;
      }

      const id = generateUUID();
      const previewUrl = URL.createObjectURL(file);
      validFiles.push({
        file,
        id,
        previewUrl,
        status: 'pending',
      });
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setError(null);
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    for (let i = 0; i < selectedFiles.length; i++) {
      const fileWithId = selectedFiles[i];

      try {
        setCurrentUploadIndex(i);
        setSelectedFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'intent' as const } : f))
        );

        const extension = getFileExtension(fileWithId.file.name);
        const intentBody = buildIntentBody(fileWithId.file);
        const intentResponse = await clipService.createIntent(fileWithId.id, {
          extension,
          ...intentBody,
        });
        const intentData = intentResponse.data.data;
        const singleUrl = 'url' in intentData ? intentData.url : undefined;

        setSelectedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: 'uploading' as const, uploadUrl: singleUrl }
              : f
          )
        );

        if (isMultipartIntent(intentData)) {
          const confirmParts = await clipService.uploadMultipartToS3(intentData.urls, fileWithId.file);
          setSelectedFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, status: 'confirming' as const } : f))
          );
          await clipService.confirmUpload(fileWithId.id, {
            ...(intentData.uploadId && { uploadId: intentData.uploadId }),
            parts: confirmParts,
          });
        } else {
          await clipService.uploadToS3Url(singleUrl!, fileWithId.file);
          setSelectedFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, status: 'confirming' as const } : f))
          );
          await clipService.confirmUpload(fileWithId.id);
        }

        setSelectedFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'success' as const } : f))
        );
      } catch (err) {
        const apiError = err as ApiError;
        const errorMessage = `Failed to upload ${fileWithId.file.name}: ${apiError.message}`;

        setSelectedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'error' as const, error: apiError.message } : f
          )
        );

        setError((prev) => (prev ? `${prev}\n${errorMessage}` : errorMessage));
      }
    }

    setCurrentUploadIndex(null);
    setUploading(false);
  };

  // When uploads finish, clear and notify if all succeeded (state updates are async, so we react in useEffect)
  const prevUploadingRef = useRef(false);
  useEffect(() => {
    const wasUploading = prevUploadingRef.current;
    prevUploadingRef.current = uploading;
    if (wasUploading && !uploading && selectedFiles.length > 0) {
      const allSucceeded = selectedFiles.every((f) => f.status === 'success');
      if (allSucceeded) {
        const urls = selectedFiles.map((f) => f.previewUrl);
        setTimeout(() => {
          urls.forEach((url) => URL.revokeObjectURL(url));
          setSelectedFiles([]);
          onUploadSuccess();
        }, 1000);
      }
    }
  }, [uploading, selectedFiles, onUploadSuccess]);

  const handleRemoveFile = (index: number) => {
    const fileWithId = selectedFiles[index];
    URL.revokeObjectURL(fileWithId.previewUrl);
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleClearAll = () => {
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setSelectedFiles([]);
    setError(null);
  };

  const handleCopyAllIds = async () => {
    if (selectedFiles.length === 0) {
      alert('No clips selected to copy IDs');
      return;
    }

    try {
      const allIds = selectedFiles.map((f) => f.id).join(',');
      await navigator.clipboard.writeText(allIds);
      setSuccessMessage('✓ All IDs copied to clipboard!');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 2000);
    } catch {
      alert('Failed to copy IDs to clipboard. Please try again.');
    }
  };

  return {
    uploading,
    selectedFiles,
    currentUploadIndex,
    error,
    successMessage,
    fileInputRef,
    handleFileSelect,
    handleUpload,
    handleRemoveFile,
    handleClearAll,
    handleCopyAllIds,
  };
}
