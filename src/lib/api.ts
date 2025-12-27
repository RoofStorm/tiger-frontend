/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';
// Note: Auth types are now handled by NextAuth.js

// Global loading state management
let globalLoadingState: {
  setLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
} | null = null;

export function setGlobalLoadingState(state: {
  setLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}) {
  globalLoadingState = state;
}

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async config => {
        // Show loading for non-GET requests or important endpoints
        if (config.method !== 'get' || config.url?.includes('/auth/')) {
          globalLoadingState?.setLoading(true);
          globalLoadingState?.setLoadingMessage('Đang xử lý...');
        }

        // Add auth header for all protected endpoints
        const protectedEndpoints = [
          '/auth/me',
          '/posts',
          '/actions',
          '/redeems',
          '/analytics',
          '/admin',
          '/points',
          '/users',
          '/wishes',
          '/referral',
          '/rewards',
          '/storage',
          '/mood-cards',
        ];

        // Public endpoints that don't need authentication
        const publicEndpoints = [
          '/wishes/highlighted',
          '/rewards', // rewards is hybrid - works with or without auth
          '/storage/video', // video streaming endpoints are public
        ];

        // Optional auth endpoints - send token if authenticated, but allow without auth
        const optionalAuthEndpoints = [
          '/posts/highlighted',
        ];

        const isPublicEndpoint = publicEndpoints.some(endpoint =>
          config.url?.includes(endpoint)
        );

        const isOptionalAuthEndpoint = optionalAuthEndpoints.some(endpoint =>
          config.url?.includes(endpoint)
        );

        const needsAuth =
          !isPublicEndpoint &&
          protectedEndpoints.some(endpoint => config.url?.includes(endpoint));

        // For optional auth endpoints, send token if available but don't require it
        const shouldAddAuth = needsAuth || isOptionalAuthEndpoint;

        if (shouldAddAuth) {
          // Only get session on client side
          if (typeof window !== 'undefined') {
            // Use JWT access token from NextAuth session for all endpoints
            const session = await getSession();
            if (session?.user) {
              // Get accessToken from session (JWT token)
              const accessToken = (session as any).accessToken;
              if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
              } else {
                // Fallback to user ID if accessToken not available
                config.headers.Authorization = `Bearer ${session.user.id}`;
              }
            } else {
              // Try to get from localStorage as fallback
              const storedAccessToken = localStorage.getItem('accessToken');
              const storedUserId = localStorage.getItem('userId');

              if (storedAccessToken) {
                config.headers.Authorization = `Bearer ${storedAccessToken}`;
              } else if (storedUserId) {
                config.headers.Authorization = `Bearer ${storedUserId}`;
              }
              // For optional auth endpoints, if no token found, continue without auth
            }
          }
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor to handle auth errors and automatic token refresh
    this.client.interceptors.response.use(
      response => {
        // Hide loading on successful response
        globalLoadingState?.setLoading(false);
        return response;
      },
      async error => {
        // Hide loading on error
        globalLoadingState?.setLoading(false);

        const originalRequest = error.config;

        // Handle 401 errors with automatic token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token automatically
            const newToken = await this.handleTokenRefresh();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client.request(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear all tokens on refresh failure
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            // If refresh fails, check if we have a session
            const session = await getSession();
            if (!session?.user && typeof window !== 'undefined') {
              // Clear NextAuth session but don't auto redirect
              // Let the user stay on the current page (e.g., homepage)
              try {
                await fetch('/api/auth/signout', { method: 'POST' });
              } catch (signoutError) {
                console.error('Error signing out from NextAuth:', signoutError);
              }

              // Note: Login is now handled via modal, no need to redirect
              // Protected pages will show login prompt via modal when needed
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token refresh methods
  private async handleTokenRefresh() {
    // Only refresh on client side
    if (typeof window === 'undefined') {
      return null;
    }

    // Prevent multiple simultaneous refresh calls
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.refreshToken();
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async refreshToken() {
    // Only refresh on client side
    if (typeof window === 'undefined') {
      throw new Error('Refresh token only available on client side');
    }

    // Try to get refresh token from localStorage first
    let refreshToken = localStorage.getItem('refreshToken');

    // If not in localStorage, try to get from NextAuth session
    if (!refreshToken) {
      try {
        const session = await getSession();
        const sessionRefreshToken = (session as any).refreshToken;
        if (sessionRefreshToken) {
          refreshToken = sessionRefreshToken;
          // Store in localStorage for future use
          localStorage.setItem('refreshToken', sessionRefreshToken);
        }
      } catch (error) {
        console.error('Error getting refresh token from session:', error);
      }
    }

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        `${this.client.defaults.baseURL}/auth/refresh`,
        {
          refreshToken,
        }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Update tokens in storage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Update NextAuth session with new tokens
      try {
        const session = await getSession();
        if (session) {
          // Trigger session update to include new tokens
          await fetch('/api/auth/update-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken,
              refreshToken: newRefreshToken,
            }),
          });
        }
      } catch (error) {
        console.error('Error updating NextAuth session:', error);
      }

      return accessToken;
    } catch (error) {
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Clear NextAuth session on refresh failure
      try {
        await fetch('/api/auth/signout', { method: 'POST' });
      } catch (signoutError) {
        console.error('Error signing out from NextAuth:', signoutError);
      }

      throw error;
    }
  }

  // Note: Auth methods are now handled by NextAuth.js
  // Use useNextAuth hook instead of these methods

  // User endpoints
  async getCurrentUser(): Promise<any> {
    const response = await this.client.get('/auth/me');
    return response.data?.data || null;
  }

  // Posts endpoints
  async getPosts(page = 1, limit = 10): Promise<any> {
    const response = await this.client.get(
      `/posts?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async getHighlightedPosts(page = 1, limit = 10): Promise<any> {
    const response = await this.client.get(
      `/posts/highlighted?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async getPost(id: string): Promise<any> {
    const response = await this.client.get(`/posts/${id}`);
    return response.data;
  }

  async createPost(data: any): Promise<any> {
    const response = await this.client.post('/posts', data);
    return response.data;
  }

  async likePost(postId: string): Promise<any> {
    const response = await this.client.post(`/posts/${postId}/like`);
    return response.data;
  }

  async sharePost(postId: string, platform?: string): Promise<any> {
    const response = await this.client.post(`/posts/${postId}/share`, {
      ...(platform && { platform }),
    });
    return response.data;
  }

  async shareWish(wishId: string, platform?: string): Promise<any> {
    const response = await this.client.post(`/wishes/${wishId}/share`, {
      ...(platform && { platform }),
    });
    return response.data;
  }

  // Mood cards endpoints
  async createMoodCard(data: any): Promise<any> {
    const response = await this.client.post('/mood-cards', data);
    return response.data;
  }

  async shareMoodCard(cardId: string, shareData: any): Promise<any> {
    const response = await this.client.post(
      `/mood-cards/${cardId}/share`,
      shareData
    );
    return response.data;
  }

  // Rewards endpoints
  async getRewards(page = 1, limit = 20): Promise<any> {
    const response = await this.client.get(
      `/rewards?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async getRewardById(id: string): Promise<any> {
    const response = await this.client.get(`/rewards/${id}`);
    return response.data;
  }

  async createReward(data: any): Promise<any> {
    const response = await this.client.post('/rewards', data);
    return response.data;
  }

  async updateReward(id: string, data: any): Promise<any> {
    const response = await this.client.patch(`/rewards/${id}`, data);
    return response.data;
  }

  async deleteReward(id: string): Promise<any> {
    const response = await this.client.delete(`/rewards/${id}`);
    return response.data;
  }

  async createRedeemRequest(data: any): Promise<any> {
    const response = await this.client.post('/redeems', data);
    return response.data;
  }

  async getRedeemHistory(): Promise<any> {
    const response = await this.client.get('/redeems');
    return response.data;
  }

  async getPointHistory(): Promise<any> {
    const response = await this.client.get('/points/history');
    return response.data;
  }

  // Wishes endpoints
  async createWish(content: string): Promise<any> {
    const response = await this.client.post('/wishes', { content });
    return response.data;
  }

  async getAllWishes(
    page = 1,
    limit = 20,
    isHighlighted?: boolean
  ): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (isHighlighted !== undefined) {
      params.append('isHighlighted', isHighlighted.toString());
    }
    const response = await this.client.get(`/wishes?${params}`);
    return response.data;
  }

  async getHighlightedWishes(page = 1, limit = 20): Promise<any> {
    // Use Next.js API route instead of direct backend call
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    // Call Next.js API route (works on both client and server)
    const apiUrl = typeof window !== 'undefined' 
      ? `/api/wishes/highlighted?${queryParams.toString()}`
      : `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/wishes/highlighted?${queryParams.toString()}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Failed to fetch highlighted wishes',
      }));
      throw new Error(errorData.error || 'Failed to fetch highlighted wishes');
    }

    const data = await response.json();
    return data;
  }

  async getUserWishes(page = 1, limit = 20): Promise<any> {
    const response = await this.client.get(
      `/wishes/user?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async toggleWishHighlight(wishId: string): Promise<any> {
    const response = await this.client.post(
      `/wishes/${wishId}/toggle-highlight`
    );
    return response.data;
  }

  async deleteWish(wishId: string): Promise<any> {
    const response = await this.client.delete(`/wishes/${wishId}`);
    return response.data;
  }

  // Upload endpoints
  async uploadFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getSignedUploadUrl(
    filename: string,
    contentType: string
  ): Promise<any> {
    const response = await this.client.post('/storage/sign', {
      filename,
      contentType,
    });
    return response.data;
  }

  // Analytics endpoints
  async trackCornerAnalytics(data: any[]): Promise<void> {
    await this.client.post('/analytics/corners', { events: data });
  }

  async getCornerAnalytics(): Promise<any> {
    const response = await this.client.get('/analytics/corners');
    return response.data;
  }

  async getAdminStats(): Promise<any> {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }

  async pinPost(postId: string): Promise<any> {
    const response = await this.client.post(`/admin/posts/${postId}/pin`);
    return response.data;
  }

  async highlightPost(postId: string): Promise<any> {
    const response = await this.client.post(`/admin/posts/${postId}/highlight`);
    return response.data;
  }

  async unhighlightPost(postId: string): Promise<any> {
    const response = await this.client.post(
      `/admin/posts/${postId}/unhighlight`
    );
    return response.data;
  }

  async getRedeemLogs(page = 1, limit = 10, status?: string): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) params.append('status', status);

    const response = await this.client.get(
      `/admin/redeems?${params.toString()}`
    );
    return response.data;
  }

  async getAdminPosts(
    page = 1,
    limit = 10,
    options?: {
      highlighted?: boolean;
      month?: number;
      year?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (options?.highlighted !== undefined)
      params.append('isHighlighted', options.highlighted.toString());
    
    if (options?.month) params.append('month', options.month.toString());
    if (options?.year) params.append('year', options.year.toString());
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);

    const response = await this.client.get(`/admin/posts?${params.toString()}`);
    return response.data;
  }

  async getAdminWishes(
    page = 1,
    limit = 10,
    highlighted?: boolean
  ): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (highlighted !== undefined)
      params.append('highlighted', highlighted.toString());

    const response = await this.client.get(
      `/admin/wishes?${params.toString()}`
    );
    return response.data;
  }

  async getUserActions(): Promise<any> {
    const response = await this.client.get('/actions/user');
    return response.data;
  }

  // Admin methods
  async getUsers(
    page = 1,
    limit = 10,
    role?: string,
    status?: string
  ): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (role) params.append('role', role);
    if (status) params.append('status', status);

    const response = await this.client.get(`/admin/users?${params.toString()}`);
    return response.data;
  }

  async getAllRedeems(page = 1, limit = 20, status?: string): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append('status', status);
    }
    const response = await this.client.get(`/redeems/admin?${params}`);
    return response.data;
  }

  async updateRedeemStatus(
    redeemId: string,
    status: string,
    rejectionReason?: string
  ): Promise<any> {
    const response = await this.client.patch(`/redeems/${redeemId}/status`, {
      status,
      rejectionReason,
    });
    return response.data;
  }

  // Referral methods
  async getReferralCode(): Promise<any> {
    const response = await this.client.get('/users/referral/code');
    return response.data;
  }

  async getReferralStats(): Promise<any> {
    const response = await this.client.get('/users/referral/stats');
    return response.data;
  }

  async processReferral(userId: string, referralCode: string): Promise<any> {
    const response = await this.client.post('/referral/process', {
      userId,
      referralCode,
    });
    return response.data;
  }

  // Utility method for direct API calls
  async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.request<T>(config);
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
