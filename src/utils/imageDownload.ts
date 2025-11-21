import JSZip from 'jszip';
import { ImageData, imageService } from '../services';
import { ProcessingStatus } from '../models/ProcessingStatus';
import { GetItemsRequest } from '../models';
import { ItemStorage } from '../common/item.storage';
import { config } from '../config/env';

/**
 * Downloads all image files as a ZIP archive
 * @param image - The image data to download
 * @param onDownloadingChange - Optional callback to track downloading state (imageId or null)
 * @returns Promise that resolves when download is complete
 */
export const downloadImageAsZip = async (
  image: ImageData,
  onDownloadingChange?: (imageId: string | null) => void
): Promise<void> => {
  onDownloadingChange?.(image._id);
  
  try {
    const zip = new JSZip();
    const itemStorage = image.parentId
      ? new ItemStorage(image._id, image.extension, image.parentId)
      : new ItemStorage(image._id, image.extension);

    // Create file list for main image files
    const files = createImageFileList(image, itemStorage);

    // Fetch all main files and add to zip
    let successCount = 0;
    let failCount = 0;

    const fileResults = await Promise.all(
      files.map(file => fetchFileAndAddToZip(file, zip))
    );
    
    fileResults.forEach(result => {
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    });

    // If this is a parent image, fetch and add all child images
    let imageSuccessCount = 0;
    let imageFailCount = 0;
    if (!image.parentId) {
      const result = await fetchAndAddChildImages(image, zip);
      imageSuccessCount = result.successCount;
      imageFailCount = result.failCount;
    }

    await generateAndDownloadZip(zip, image._id);
    showDownloadSummary(successCount, failCount, imageSuccessCount, imageFailCount);
  } catch (error) {
    console.error('Error creating zip:', error);
    alert('Failed to create zip file. Please try again.');
    throw error;
  } finally {
    onDownloadingChange?.(null);
  }
};

/**
 * Creates an array of file definitions for all image-related files
 * @param image - The image data
 * @param itemStorage - The ItemStorage instance for path generation
 * @returns Array of file objects with url, path, and name properties
 */
const createImageFileList = (
  image: ImageData,
  itemStorage: ItemStorage
): Array<{ url: string; path: string; name: string }> => {
  const files: Array<{ url: string; path: string; name: string }> = [];

  // Always include the main image
  const imageUrl = imageService.getImageUrl(image);
  files.push({
    url: imageUrl,
    path: itemStorage.getImageFile(),
    name: `image.${image.extension || 'jpg'}`
  });

  // Include depth image if processed
  if (image.depthStatus === ProcessingStatus.PROCESSED) {
    const depthUrl = imageService.getDepthUrl(image);
    files.push({
      url: depthUrl,
      path: itemStorage.getDepthFile(),
      name: 'depth.png'
    });
  }

  // Include feature image and feature files if processed
  if (image.featureStatus === ProcessingStatus.PROCESSED) {
    const featureUrl = imageService.getFeatureUrl(image);
    files.push({
      url: featureUrl,
      path: itemStorage.getFeatureFile(),
      name: 'features.png'
    });

    // Add feature descriptor file
    const featureDescriptorPath = itemStorage.getFeatureDescriptorFile();
    files.push({
      url: `${config.s3BucketUrl}/${featureDescriptorPath}`,
      path: featureDescriptorPath,
      name: 'descriptors.npy'
    });

    // Add feature keypoints file
    const featureKeyPath = itemStorage.getFeatureKeyFile();
    files.push({
      url: `${config.s3BucketUrl}/${featureKeyPath}`,
      path: featureKeyPath,
      name: 'keypoints.npy'
    });

    // Add feature image tensor file
    const featureImgPath = itemStorage.getFeatureImgFile();
    files.push({
      url: `${config.s3BucketUrl}/${featureImgPath}`,
      path: featureImgPath,
      name: 'image_tensor.npy'
    });

    // Add feature scores file
    const featureScorePath = itemStorage.getFeatureScoreFile();
    files.push({
      url: `${config.s3BucketUrl}/${featureScorePath}`,
      path: featureScorePath,
      name: 'scores.npy'
    });
  }

  // Include camera.json if available
  if (image.hasCameraInfo) {
    const cameraUrl = imageService.getCameraUrl(image);
    files.push({
      url: cameraUrl,
      path: itemStorage.getCameraFile(),
      name: 'camera.json'
    });
  }

  return files;
};

/**
 * Fetches a file and adds it to the ZIP archive
 * @param file - The file information (url, path, name)
 * @param zip - The JSZip instance to add the file to
 * @returns Promise that resolves to a result object indicating success or failure
 */
const fetchFileAndAddToZip = async (
  file: { url: string; path: string; name: string },
  zip: JSZip
): Promise<{ success: boolean }> => {
  try {
    // Set 10 minute timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000);
    
    try {
      // Explicitly set CORS mode to ensure proper handling
      const response = await fetch(file.url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit', // Don't send credentials to avoid preflight
        cache: 'no-cache',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const blob = await response.blob();
        zip.file(file.path, blob);
        return { success: true };
      } else {
        console.warn(`Failed to fetch ${file.name}: ${response.status}`);
        return { success: false };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`Timeout fetching ${file.name}`);
      } else {
        console.error(`Error fetching ${file.name}:`, error);
      }
      return { success: false };
    }
  } catch (error) {
    console.error(`Error fetching ${file.name}:`, error);
    return { success: false };
  }
};

/**
 * Fetches all child items for a parent image and adds their images to the ZIP
 * @param parentImage - The parent image data
 * @param zip - The JSZip instance to add images to
 * @returns Promise that resolves to an object with success and failure counts
 */
const fetchAndAddChildImages = async (
  parentImage: ImageData,
  zip: JSZip
): Promise<{ successCount: number; failCount: number }> => {
  let imageSuccessCount = 0;
  let imageFailCount = 0;

  try {
    // Fetch all child items for the parent
    const request: GetItemsRequest = {
      limit: 1000, // Large limit to get all children
      filter: {
        parentId: parentImage._id
      }
    };
    
    const response = await imageService.getImages(1000, request);
    
    // Handle different response structures
    let imagesData = response.data;
    let childItems: ImageData[] = [];
    
    if (Array.isArray(imagesData)) {
      childItems = imagesData;
    } else if (imagesData && typeof imagesData === 'object' && 'items' in imagesData && Array.isArray((imagesData as any).items)) {
      childItems = (imagesData as any).items;
    } else if (imagesData && typeof imagesData === 'object' && 'data' in imagesData && Array.isArray((imagesData as any).data)) {
      childItems = (imagesData as any).data;
    }

    if (childItems.length === 0) {
      return { successCount: 0, failCount: 0 };
    }

    // Fetch all child images and add to zip
    const imageResults = await Promise.all(
      childItems.map(childImage => fetchAndAddChildImageToZip(childImage, zip))
    );
    
    imageResults.forEach(result => {
      if (result.success) {
        imageSuccessCount++;
      } else {
        imageFailCount++;
      }
    });
  } catch (error) {
    console.warn(`Failed to fetch child items for parent ${parentImage._id}:`, error);
  }

  return { successCount: imageSuccessCount, failCount: imageFailCount };
};

/**
 * Fetches a child image and adds it to the ZIP archive
 * @param childImage - The child image data to fetch
 * @param zip - The JSZip instance to add the image to
 * @returns Promise that resolves to a result object indicating success or failure
 */
const fetchAndAddChildImageToZip = async (
  childImage: ImageData,
  zip: JSZip
): Promise<{ success: boolean }> => {
  try {
    // Ensure we have required fields
    if (!childImage.extension) {
      childImage.extension = 'jpg';
    }
    
    const itemStorage = new ItemStorage(childImage._id, childImage.extension, childImage.parentId);
    const imageUrl = imageService.getImageUrl(childImage);
    
    // Set 10 minute timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000);
    
    try {
      // Explicitly set CORS mode to ensure proper handling
      const response = await fetch(imageUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit', // Don't send credentials to avoid preflight
        cache: 'no-cache',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const blob = await response.blob();
        const imagePath = itemStorage.getImageFile();
        zip.file(imagePath, blob);
        return { success: true };
      } else {
        console.warn(`Failed to fetch child image ${childImage._id}: ${response.status}`);
        return { success: false };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`Timeout fetching child image ${childImage._id}`);
      } else {
        console.error(`Error fetching child image ${childImage._id}:`, error);
      }
      return { success: false };
    }
  } catch (error) {
    console.error(`Error fetching child image ${childImage._id}:`, error);
    return { success: false };
  }
};

/**
 * Shows a summary of download results to the user
 * @param successCount - Number of successfully downloaded main files
 * @param failCount - Number of failed main file downloads
 * @param imageSuccessCount - Number of successfully downloaded child images
 * @param imageFailCount - Number of failed child image downloads
 */
const showDownloadSummary = (
  successCount: number,
  failCount: number,
  imageSuccessCount: number,
  imageFailCount: number
): void => {
  const messages: string[] = [];
  if (successCount > 0 || failCount > 0) {
    messages.push(`Main files: ${successCount} downloaded${failCount > 0 ? `, ${failCount} failed` : ''}`);
  }
  if (imageSuccessCount > 0 || imageFailCount > 0) {
    messages.push(`Child images: ${imageSuccessCount} downloaded${imageFailCount > 0 ? `, ${imageFailCount} failed` : ''}`);
  }
  
  if (failCount > 0 || imageFailCount > 0) {
    alert(messages.join('\n') + '\n\nSome files could not be downloaded (may not exist yet).');
  } else if (messages.length > 0) {
    // Optional: show success message if all files downloaded
    console.log('Download complete:', messages.join(', '));
  }
};

/**
 * Generates a ZIP blob and triggers the browser download
 * @param zip - The JSZip instance to generate the blob from
 * @param imageId - The image ID to use in the filename
 */
const generateAndDownloadZip = async (zip: JSZip, imageId: string): Promise<void> => {
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = window.URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `image_${imageId}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};


