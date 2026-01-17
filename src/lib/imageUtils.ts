/**
 * Utility function to crop an image using canvas
 * @param imageSrc - Source image URL or data URL
 * @param pixelCrop - Crop area in pixels
 * @returns Promise<Blob> - Cropped image as Blob
 */
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  // Chặn crop khi ảnh quá nhỏ (giảm threshold xuống 200x200 để linh hoạt hơn)
  if (image.width < 200 || image.height < 200) {
    throw new Error('Ảnh quá nhỏ để crop. Vui lòng chọn ảnh có kích thước tối thiểu 200x200 pixels.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context error');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      'image/jpeg',
      0.9
    );
  });
}

