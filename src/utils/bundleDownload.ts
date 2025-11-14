import JSZip from 'jszip';
import { BundleData, bundleService, imageService } from '../services';
import { ImageData, GetItemsRequest } from '../models';

/**
 * Downloads all bundle files as a ZIP archive
 * @param bundle - The bundle data to download
 * @param onDownloadingChange - Optional callback to track downloading state (bundleId or null)
 * @returns Promise that resolves when download is complete
 */
export const downloadBundleAsZip = async (
  bundle: BundleData,
  onDownloadingChange?: (bundleId: string | null) => void
): Promise<void> => {
  onDownloadingChange?.(bundle._id);
  
  try {
    const zip = new JSZip();
    const files = createBundleFileList(bundle);

    // Fetch all 3D and mesh files and add to zip
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

    // Fetch all bundle images and add to images/ folder
    const { successCount: imageSuccessCount, failCount: imageFailCount } = await fetchAndAddBundleImages(bundle, zip);
    await generateAndDownloadZip(zip, bundle._id);
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
 * Fetches child items for a given parent ID
 * @param parentId - The parent item ID
 * @returns Promise that resolves to an array of child ImageData items
 */
const fetchChildItemsForParent = async (parentId: string): Promise<ImageData[]> => {
  try {
    const request: GetItemsRequest = {
      limit: 1000, // Large limit to get all children
      filter: {
        parentId: parentId
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
    
    return childItems;
  } catch (error) {
    console.warn(`Failed to fetch child items for parent ${parentId}:`, error);
    return [];
  }
};

/**
 * Determines the file extension for an image based on content type or image data
 * @param imageData - The image data
 * @param contentType - The content type from the HTTP response
 * @returns The file extension (jpg, png, or webp)
 */
const determineImageExtension = (imageData: ImageData, contentType: string | null): string => {
  let extension = imageData.extension || 'jpg';
  
  if (contentType) {
    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      extension = 'jpg';
    } else if (contentType.includes('png')) {
      extension = 'png';
    } else if (contentType.includes('webp')) {
      extension = 'webp';
    }
  }
  
  return extension;
};

/**
 * Fetches an image and adds it to the ZIP archive
 * @param imageData - The image data to fetch
 * @param zip - The JSZip instance to add the image to
 * @returns Promise that resolves to a result object indicating success or failure
 */
const fetchAndAddImageToZip = async (
  imageData: ImageData,
  zip: JSZip
): Promise<{ success: boolean }> => {
  try {
    // Ensure we have required fields
    if (!imageData.extension) {
      imageData.extension = 'jpg';
    }
    
    const imageUrl = imageService.getImageUrl(imageData);
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
        const extension = determineImageExtension(imageData, response.headers.get('content-type'));
        
        // Use itemId as the filename: {id}.{extension}
        const fileName = `${imageData._id}.${extension}`;
        zip.file(`images/${fileName}`, blob);
        return { success: true };
      } else {
        console.warn(`Failed to fetch image ${imageData._id}: ${response.status}`);
        return { success: false };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`Timeout fetching image ${imageData._id}`);
      } else {
        console.error(`Error fetching image ${imageData._id}:`, error);
      }
      return { success: false };
    }
  } catch (error) {
    console.error(`Error fetching image ${imageData._id}:`, error);
    return { success: false };
  }
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
 * Fetches all child items for bundle parents and adds their images to the ZIP
 * @param bundle - The bundle data
 * @param zip - The JSZip instance to add images to
 * @returns Promise that resolves to an object with success and failure counts
 */
const fetchAndAddBundleImages = async (
  bundle: BundleData,
  zip: JSZip
): Promise<{ successCount: number; failCount: number }> => {
  let imageSuccessCount = 0;
  let imageFailCount = 0;

  if (bundle.itemIds && bundle.itemIds.length > 0) {
    // Fetch all child items for each parent item in bundle.itemIds
    const childItemsPromises = bundle.itemIds.map(parentId => 
      fetchChildItemsForParent(parentId)
    );

    const allChildItemsArrays = await Promise.all(childItemsPromises);
    // Flatten the array of arrays into a single array of child items
    const allChildItems = allChildItemsArrays.flat();

    // Fetch all child images and add to zip, using itemId as filename
    const imageResults = await Promise.all(
      allChildItems.map(imageData => fetchAndAddImageToZip(imageData, zip))
    );
    
    imageResults.forEach(result => {
      if (result.success) {
        imageSuccessCount++;
      } else {
        imageFailCount++;
      }
    });
  }

  return { successCount: imageSuccessCount, failCount: imageFailCount };
};

/**
 * Shows a summary of download results to the user
 * @param successCount - Number of successfully downloaded 3D/mesh files
 * @param failCount - Number of failed 3D/mesh file downloads
 * @param imageSuccessCount - Number of successfully downloaded images
 * @param imageFailCount - Number of failed image downloads
 */
const showDownloadSummary = (
  successCount: number,
  failCount: number,
  imageSuccessCount: number,
  imageFailCount: number
): void => {
  const messages: string[] = [];
  if (successCount > 0 || failCount > 0) {
    messages.push(`3D/Mesh files: ${successCount} downloaded${failCount > 0 ? `, ${failCount} failed` : ''}`);
  }
  if (imageSuccessCount > 0 || imageFailCount > 0) {
    messages.push(`Images: ${imageSuccessCount} downloaded${imageFailCount > 0 ? `, ${imageFailCount} failed` : ''}`);
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
 * @param bundleId - The bundle ID to use in the filename
 */
const generateAndDownloadZip = async (zip: JSZip, bundleId: string): Promise<void> => {
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = window.URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `bundle_${bundleId}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

/**
 * Creates an array of file definitions for all 3D and mesh files in a bundle
 * @param bundle - The bundle data
 * @returns Array of file objects with url, path, and name properties
 */
const createBundleFileList = (bundle: BundleData): Array<{ url: string; path: string; name: string }> => {
  const files: Array<{ url: string; path: string; name: string }> = [];

  // Add all 3D database files (attempt all regardless of status)
  files.push({
    url: bundleService.get3DDatabaseUrl(bundle),
    path: '3d/data.db',
    name: 'data.db'
  });
  files.push({
    url: bundleService.get3DPointsUrl(bundle),
    path: '3d/points3D.bin',
    name: 'points3D.bin'
  });
  files.push({
    url: bundleService.get3DImagesUrl(bundle),
    path: '3d/images.bin',
    name: 'images.bin'
  });
  files.push({
    url: bundleService.get3DCamerasUrl(bundle),
    path: '3d/cameras.bin',
    name: 'cameras.bin'
  });
  files.push({
    url: bundleService.getCamerasUrl(bundle),
    path: '3d/cameras.json',
    name: 'cameras.json'
  });

  // Add all mesh files (attempt all regardless of status)
  files.push({
    url: bundleService.get3DMeshUrl(bundle),
    path: '3d/mesh.ply',
    name: 'mesh.ply'
  });
  files.push({
    url: bundleService.get3DMeshGeometryUrl(bundle),
    path: '3d/textured_mesh.obj',
    name: 'textured_mesh.obj'
  });
  files.push({
    url: bundleService.get3DMeshMaterialUrl(bundle),
    path: '3d/textured_mesh.mtl',
    name: 'textured_mesh.mtl'
  });
  files.push({
    url: bundleService.get3DTexturedConfUrl(bundle),
    path: '3d/textured_mesh.conf',
    name: 'textured_mesh.conf'
  });

  return files;
};


