/**
 * Image Service — CampusConnect
 * Mock image service that simulates S3 upload/delete with progress callbacks.
 */

const SIMULATED_UPLOAD_MS = 1800;
const PROGRESS_INTERVAL_MS = 100;

/**
 * Simulate uploading an image file.
 * @param {File|Blob} file — The image file to upload
 * @param {function} [onProgress] — Callback receiving progress 0-100
 * @returns {Promise<string>} — Mock URL of the uploaded image
 */
export async function uploadImage(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    let progress = 0;
    const totalSteps = SIMULATED_UPLOAD_MS / PROGRESS_INTERVAL_MS;
    const increment = 100 / totalSteps;

    const interval = setInterval(() => {
      progress = Math.min(progress + increment + Math.random() * 3, 99);
      if (onProgress) onProgress(Math.round(progress));
    }, PROGRESS_INTERVAL_MS);

    setTimeout(() => {
      clearInterval(interval);
      if (onProgress) onProgress(100);

      /* Generate a mock URL based on file name */
      const timestamp = Date.now();
      const safeName = (file.name || 'image').replace(/[^a-zA-Z0-9.]/g, '-');
      const mockUrl = `https://campusconnect-uploads.s3.amazonaws.com/images/${timestamp}-${safeName}`;

      resolve(mockUrl);
    }, SIMULATED_UPLOAD_MS);
  });
}

/**
 * Simulate deleting an image by URL.
 * @param {string} url — The image URL to delete
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteImage(url) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 400);
  });
}

/**
 * Simulate getting a pre-signed upload URL.
 * @param {string} filename — The filename to generate a URL for
 * @returns {Promise<{ uploadUrl: string, publicUrl: string }>}
 */
export async function getPresignedUrl(filename) {
  return new Promise((resolve) => {
    const timestamp = Date.now();
    const safeName = filename.replace(/[^a-zA-Z0-9.]/g, '-');
    setTimeout(() => {
      resolve({
        uploadUrl: `https://campusconnect-uploads.s3.amazonaws.com/presigned/${timestamp}/${safeName}`,
        publicUrl: `https://campusconnect-uploads.s3.amazonaws.com/images/${timestamp}-${safeName}`,
      });
    }, 300);
  });
}
