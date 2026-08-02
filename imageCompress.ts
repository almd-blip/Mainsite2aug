/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Compresses/resizes an uploaded image file before it is stored, so a large
 * landscape photo (5–20 MB) never has to be saved as a full base64 string.
 * Large base64 images easily exceed the ~5 MB localStorage limit and fail
 * silently. This returns a small JPEG data URL instead.
 *
 * Use it before writing any user image to localStorage:
 *
 *   const dataUrl = await compressImageFile(file);
 *   if (dataUrl) storage.setItem('st_user_photo', dataUrl);
 *
 * @param file      The File/Blob selected by the user.
 * @param maxDim    Longest side in pixels to downscale to (default 1600).
 * @param quality   JPEG quality 0–1 (default 0.8).
 * @returns A JPEG data URL, or null if the image could not be processed.
 */
export async function compressImageFile(
  file: File | Blob,
  maxDim = 1600,
  quality = 0.8
): Promise<string | null> {
  try {
    const url = URL.createObjectURL(file);
    const image = new Image();

    const loaded: Promise<HTMLImageElement> = new Promise((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Could not read image'));
      image.src = url;
    });

    const img = await loaded;
    URL.revokeObjectURL(url);

    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // JPEG keeps photos small; orientation is baked in by the browser.
    return canvas.toDataURL('image/jpeg', quality);
  } catch (err) {
    console.warn('[imageCompress] Could not compress image:', err);
    return null;
  }
}

/**
 * Convenience check: estimates whether a data URL will fit in localStorage.
 * Returns true when it is safe to write, false when it would likely exceed the
 * available quota (so the caller can show a clear message instead of failing
 * silently).
 */
export function wouldFitInLocalStorage(dataUrl: string, key: string): boolean {
  try {
    // Base64 data URLs inflate ~33% vs raw bytes; include the key + JSON wrapper.
    const estimatedBytes = Math.ceil((dataUrl.length * 3) / 4) + key.length + 512;
    const quota = 5 * 1024 * 1024;
    return estimatedBytes < quota;
  } catch {
    return true;
  }
}
