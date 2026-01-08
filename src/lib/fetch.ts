/**
 * Global fetch utility với credentials mặc định
 * Đảm bảo tất cả API calls đến backend đều gửi cookies để track user
 */

/**
 * Wrapper cho fetch với credentials: 'include' mặc định
 * Sử dụng cho tất cả các API calls đến backend
 * 
 * @param url - URL hoặc Request object
 * @param init - Fetch options (credentials sẽ được override thành 'include')
 * @returns Promise<Response>
 */
export async function fetchWithCredentials(
  url: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  return fetch(url, {
    ...init,
    credentials: 'include', // Luôn gửi cookies để track user
  });
}

/**
 * Fetch utility cho server-side (Next.js API routes)
 * Có thể forward cookies từ request headers nếu cần
 * 
 * @param url - URL
 * @param init - Fetch options
 * @param requestHeaders - Optional request headers từ Next.js request để forward cookies
 * @returns Promise<Response>
 */
export async function fetchFromServer(
  url: string | URL | Request,
  init?: RequestInit,
  requestHeaders?: Headers
): Promise<Response> {
  const headers = new Headers(init?.headers);
  
  // Forward cookies từ client request nếu có
  if (requestHeaders) {
    const cookie = requestHeaders.get('cookie');
    if (cookie) {
      headers.set('cookie', cookie);
    }
  }
  
  return fetch(url, {
    ...init,
    headers,
    credentials: 'include', // Đảm bảo gửi cookies
  });
}

