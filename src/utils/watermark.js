/**
 * Watermark Utility — CampusConnect
 * Applies a diagonal repeating "© CampusConnect" watermark to images using Canvas API.
 */

/**
 * Apply a semi-transparent diagonal watermark to an image file.
 * @param {File|Blob} imageFile — The source image file
 * @returns {Promise<Blob>} — Watermarked image as a Blob (image/png)
 */
export async function applyWatermark(imageFile) {
  const imageBitmap = await createImageBitmap(imageFile);

  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;

  const ctx = canvas.getContext('2d');

  /* Draw the original image */
  ctx.drawImage(imageBitmap, 0, 0);

  /* Watermark configuration */
  const text = '© CampusConnect';
  const fontSize = Math.max(16, Math.round(imageBitmap.width / 40));
  const font = `bold ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
  const angle = (-30 * Math.PI) / 180; // -30 degrees
  const opacity = 0.15;

  ctx.save();
  ctx.font = font;
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  /* Measure text to determine spacing */
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const spacingX = textWidth + 60;
  const spacingY = fontSize * 4;

  /* Translate to center, rotate, then draw a grid of watermarks */
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(angle);

  /* Calculate the diagonal length to cover the entire canvas when rotated */
  const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
  const startX = -diagonal;
  const endX = diagonal;
  const startY = -diagonal;
  const endY = diagonal;

  for (let y = startY; y < endY; y += spacingY) {
    for (let x = startX; x < endX; x += spacingX) {
      ctx.fillText(text, x, y);
    }
  }

  ctx.restore();

  /* Return as blob */
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create watermarked image blob'));
      },
      'image/png',
      0.92
    );
  });
}

/**
 * Get a data URL of the watermarked image (useful for previews).
 * @param {File|Blob} imageFile — The source image file
 * @returns {Promise<string>} — Watermarked image as a data URL
 */
export async function getWatermarkedUrl(imageFile) {
  const watermarkedBlob = await applyWatermark(imageFile);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read watermarked image'));
    reader.readAsDataURL(watermarkedBlob);
  });
}
