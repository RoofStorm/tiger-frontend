/**
 * Utility functions for Open Graph image handling
 */

export interface OGImageConfig {
  width: number;
  height: number;
  alt: string;
  url: string;
}

/**
 * Tạo URL ảnh preview chuẩn cho Open Graph
 * @param imageUrl - URL ảnh gốc
 * @param fallbackUrl - URL ảnh mặc định nếu không có ảnh
 * @returns OGImageConfig object
 */
export function createOGImage(
  imageUrl?: string,
  fallbackUrl?: string
): OGImageConfig {
  // URL ảnh mặc định nếu không có ảnh
  const defaultImage =
    fallbackUrl || `${process.env.NEXTAUTH_URL}/default-post-image.jpg`;

  // Sử dụng ảnh gốc nếu có, ngược lại dùng ảnh mặc định
  const finalImageUrl = imageUrl || defaultImage;

  return {
    url: finalImageUrl,
    width: 1200,
    height: 630,
    alt: 'Tiger Mood Corner - Bài viết nổi bật',
  };
}

/**
 * Kiểm tra xem ảnh có đúng chuẩn Open Graph không
 * @param imageUrl - URL ảnh cần kiểm tra
 * @returns boolean
 */
export function isValidOGImage(imageUrl: string): boolean {
  // Kiểm tra URL hợp lệ
  try {
    new URL(imageUrl);
  } catch {
    return false;
  }

  // Kiểm tra HTTPS
  if (!imageUrl.startsWith('https://')) {
    return false;
  }

  // Kiểm tra định dạng ảnh được hỗ trợ
  const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp'];
  const hasValidFormat = supportedFormats.some(format =>
    imageUrl.toLowerCase().includes(format)
  );

  return hasValidFormat;
}

/**
 * Tạo ảnh preview từ nhiều ảnh (chọn ảnh đầu tiên)
 * @param images - Array các URL ảnh
 * @param fallbackUrl - URL ảnh mặc định
 * @returns OGImageConfig object
 */
export function selectBestOGImage(
  images: string[],
  fallbackUrl?: string
): OGImageConfig {
  // Tìm ảnh đầu tiên hợp lệ
  const validImage = images.find(img => isValidOGImage(img));

  return createOGImage(validImage, fallbackUrl);
}

/**
 * Tạo ảnh preview từ bài viết
 * @param post - Object bài viết
 * @returns OGImageConfig object
 */
export function generatePostOGImage(post: {
  imageUrl?: string;
  images?: string[];
  title: string;
}): OGImageConfig {
  // Ưu tiên ảnh chính
  if (post.imageUrl && isValidOGImage(post.imageUrl)) {
    return createOGImage(post.imageUrl);
  }

  // Nếu có nhiều ảnh, chọn ảnh đầu tiên
  if (post.images && post.images.length > 0) {
    return selectBestOGImage(post.images);
  }

  // Sử dụng ảnh mặc định
  return createOGImage();
}
