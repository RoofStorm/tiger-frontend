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
  imageUrl: string,
): OGImageConfig {
  // URL ảnh mặc định nếu không có ảnh
  // Sử dụng ảnh gốc nếu có, ngược lại dùng ảnh mặc định
  const finalImageUrl = imageUrl;

  return {
    url: finalImageUrl,
    width: 1200,
    height: 630,
    alt: 'TIGER Mood Corner - Bài viết nổi bật',
  };
}

/**
 * Kiểm tra xem ảnh có đúng chuẩn Open Graph không
 * @param imageUrl - URL ảnh cần kiểm tra
 * @returns boolean
 */
export function isValidOGImage(imageUrl: string): boolean {
  if (!imageUrl) return false;

  // Kiểm tra URL hợp lệ
  try {
    const url = new URL(imageUrl);
    // Kiểm tra HTTPS
    if (url.protocol !== 'https:') {
      return false;
    }

    // Kiểm tra định dạng ảnh được hỗ trợ (tìm trong pathname, không phải query params)
    const pathname = url.pathname.toLowerCase();
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp'];
    const hasValidFormat = supportedFormats.some(format =>
      pathname.includes(format)
    );

    return hasValidFormat;
  } catch {
    return false;
  }
}

/**
 * Tạo ảnh preview từ nhiều ảnh (chọn ảnh đầu tiên)
 * @param images - Array các URL ảnh
 * @param fallbackUrl - URL ảnh mặc định
 * @returns OGImageConfig object
 */
export function selectBestOGImage(
  images: string[],
): OGImageConfig {
  // Tìm ảnh đầu tiên hợp lệ
  const validImage = images.find(img => isValidOGImage(img));

  return createOGImage(validImage || '');
}

export function generatePostOGImage(
  post: {
    imageUrl: string;
    images?: string[];
    title: string;
  }
): OGImageConfig {
  // Ưu tiên ảnh chính
  if (post.imageUrl && isValidOGImage(post.imageUrl)) {
    return createOGImage(post.imageUrl);
  }

  // Nếu có nhiều ảnh, chọn ảnh đầu tiên
  if (post.images && post.images.length > 0) {
    return selectBestOGImage(post.images);
  }

  // Sử dụng ảnh mặc định
  return createOGImage('');
}
