/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';
import { AnalyticsSummaryResponse } from '@/types';
import { fetchWithCredentials } from './fetch';
import { MAX_UPLOAD_TIMEOUT } from '@/constants/upload';
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
  private sessionCache: { session: any; timestamp: number } | null = null;
  private tempAccessToken: string | null = null;
  private tempRefreshToken: string | null = null;
  private readonly SESSION_CACHE_TTL = 30 * 1000; // Cache session for 30 seconds

  constructor() {
    this.client = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async config => {
        // Silent endpoints that should not show loading (background API calls)
        const silentEndpoints = [
          '/auth/session', // Session check is a background call
          '/analytics/events', // Analytics events are background calls
          '/analytics/corners', // Corner analytics are background calls
          '/like', // Liking a post is a background action
          '/notifications', // Notifications are background calls
          '/points/product-card-click', // Product card click is a background action
        ];

        const isSilentEndpoint = silentEndpoints.some(endpoint =>
          config.url?.includes(endpoint)
        );

        // Show loading for non-GET requests or important endpoints, but skip silent endpoints
        if (!isSilentEndpoint && (config.method !== 'get' || config.url?.includes('/auth/'))) {
          globalLoadingState?.setLoading(true);
          globalLoadingState?.setLoadingMessage('Đang xử lý...');
        }

        // Add auth header for all protected endpoints
        const protectedEndpoints = [
          '/auth/me',
          '/auth/session',
          '/auth/change-password',
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
          '/notifications',
        ];

        // Public endpoints that don't need authentication
        const publicEndpoints = [
          '/wishes/highlighted',
          '/storage/video', // video streaming endpoints are public
        ];

        // Optional auth endpoints - send token if authenticated, but allow without auth
        const optionalAuthEndpoints = [
          '/posts/highlighted',
          '/rewards', // rewards is hybrid - works with or without auth
          '/analytics/events', // analytics events: send token if logged in, but allow anonymous
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
            let session = null;
            
            // Check cache first to avoid unnecessary API calls
            const now = Date.now();
            if (
              this.sessionCache &&
              now - this.sessionCache.timestamp < this.SESSION_CACHE_TTL
            ) {
              session = this.sessionCache.session;
            } else {
              // Cache miss or expired - fetch fresh session
              session = await getSession();
              this.sessionCache = { session, timestamp: now };
            }
            
            if (session?.user) {
              // Get accessToken from NextAuth session only (no localStorage)
              // Prefer tempAccessToken if available (set after a token refresh)
              const accessToken = this.tempAccessToken || session.accessToken;
              if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
              } else {
                // Fallback to user ID if accessToken not available (for backward compatibility)
                config.headers.Authorization = `Bearer ${session.user.id}`;
              }
            }
            // For optional auth endpoints, if no session/token found, continue without auth
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
            // Clear session cache to force fresh fetch
            this.sessionCache = null;

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

    // Get refresh token from NextAuth session only (no localStorage)
    const session = await getSession();
    const refreshToken = this.tempRefreshToken || session?.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token available in session');
    }

    try {
      // Sử dụng this.client thay vì axios.post trực tiếp để đảm bảo có withCredentials
      const response = await this.client.post('/auth/refresh', {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Update NextAuth session with new tokens
      // Note: NextAuth JWT callback only runs on signIn, so we need to trigger
      // a session update. The tokens will be used immediately for the retried request.
      // For future requests, we'll get tokens from the session which should be updated
      // by the backend session endpoint or on next signIn.
      
      // Clear session cache to force fresh fetch on next request
      this.sessionCache = null;

      // Store new tokens temporarily in memory for immediate use
      // These will be used by the retried request
      // Note: This is a workaround - ideally tokens should be in NextAuth JWT
      // but NextAuth doesn't provide a direct way to update JWT tokens after refresh
      this.tempAccessToken = accessToken;
      this.tempRefreshToken = newRefreshToken;

      return accessToken;
    } catch (error) {
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

  // Session endpoint - Get current session with user info and tokens
  async getSession(): Promise<{
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      username: string;
      avatarUrl: string | null;
      points: number;
      referralCode: string;
    };
    expires: string;
    accessToken: string;
    refreshToken: string;
    pointsAwarded: boolean;
    isFirstLogin: boolean;
  } | null> {
    const response = await this.client.get('/auth/session');
    // Backend returns: { success: true, data: { user, expires, accessToken, refreshToken, pointsAwarded, isFirstLogin } }
    // Return the data object from the response
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

  async getPostsFeed(params: {
    cursor?: string;
    direction?: 'next' | 'prev';
    limit?: number;
    type?: string;
  }): Promise<{
    success: boolean;
    data: {
      posts: Array<{
        id: string;
        caption?: string;
        imageUrl?: string;
        likeCount?: number;
        isLiked?: boolean;
        user?: {
          name?: string;
          avatarUrl?: string;
        };
      }>;
      pagination: {
        hasNext: boolean;
        hasPrev: boolean;
        nextCursor?: string;
        prevCursor?: string;
      };
    };
    message: string;
  }> {
    const queryParams = new URLSearchParams();
    if (params.cursor) queryParams.append('cursor', params.cursor);
    if (params.direction) queryParams.append('direction', params.direction);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.type) queryParams.append('type', params.type);

    const response = await this.client.get(
      `/posts/feed?${queryParams.toString()}`
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

  async getUserPointHistory(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<any> {
    const response = await this.client.get(
      `/points/history/${userId}?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async awardProductCardClick(clickCount: number): Promise<{
    awardedClicks: number;
    totalPoints: number;
    remainingClicks: number;
    currentTotalClicks: number;
    maxClicks: number;
  }> {
    const response = await this.client.post('/points/product-card-click', {
      clickCount,
    });
    return response.data?.data || response.data;
  }

  async changePassword(data: any): Promise<any> {
    const response = await this.client.post('/auth/change-password', data);
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

  async getHighlightedWishes(cursor: string | null = null, limit = 15): Promise<any> {
    // Use Next.js API route instead of direct backend call
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
    });
    
    if (cursor) {
      queryParams.append('cursor', cursor);
    }
    
    // Call Next.js API route (works on both client and server)
    const apiUrl = typeof window !== 'undefined' 
      ? `/api/wishes/highlighted?${queryParams.toString()}`
      : `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/wishes/highlighted?${queryParams.toString()}`;
    
    const response = await fetchWithCredentials(apiUrl, {
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
      timeout: MAX_UPLOAD_TIMEOUT, // 60 seconds timeout for file uploads
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

  // New analytics endpoints
  async trackAnalyticsEvents(payload: {
    sessionId: string;
    events: any[];
  }): Promise<{ message: string; count: number }> {
    const response = await this.client.post('/analytics/events', payload);
    return response.data;
  }

  async getAnalyticsAvailableData(): Promise<{
    pages: string[];
    zonesByPage: Record<string, string[]>; // page -> zones[]
    commonFunnelSteps?: string[];
    actions?: Array<{ action: string; count: number }>;
    components?: string[];
    totalRecords?: number;
    dateRange?: {
      from: string;
      to: string;
    };
  }> {
    const response = await this.client.get('/analytics/available-data');
    return response.data?.data || response.data;
  }

  async getAnalyticsSummary(params: {
    page?: string;
    zone?: string;
    from?: string;
    to?: string;
  }): Promise<AnalyticsSummaryResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.zone) queryParams.append('zone', params.zone);
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);

    const response = await this.client.get(
      `/analytics/summary?${queryParams.toString()}`
    );
    return response.data?.data || response.data;
  }

  async getAnalyticsAnalysis(params: {
    from: string;
    to: string;
    page?: string;
    zone?: string;
    action?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{
    columns: string[];
    rows: Array<{
      date: string;
      page: string;
      zone: string | null;
      action: string;
      component: string | null;
      value: number;
      unit: string;
      metadata?: Record<string, unknown>;
    }>;
    nextCursor?: string;
    count: number;
    hasMore: boolean;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('from', params.from);
    queryParams.append('to', params.to);
    if (params.page) queryParams.append('page', params.page);
    if (params.zone) queryParams.append('zone', params.zone);
    if (params.action) queryParams.append('action', params.action);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.cursor) queryParams.append('cursor', params.cursor);

    const response = await this.client.get(
      `/analytics/analysis?${queryParams.toString()}`
    );
    return response.data?.data || response.data;
  }

  async exportAnalyticsExcel(params: {
    from?: string;
    to?: string;
    page?: string;
    zone?: string;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.page) queryParams.append('page', params.page);
    if (params.zone) queryParams.append('zone', params.zone);

    const response = await this.client.get(
      `/analytics/export-excel?${queryParams.toString()}`,
      {
        responseType: 'blob',
      }
    );
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

  async getMonthlyRankings(page = 1, limit = 20): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await this.client.get(
      `/analytics/monthly-rankings?${params.toString()}`
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
      search?: string;
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
    if (options?.search?.trim())
      params.append('search', options.search.trim());

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

  async exportUsersExcel(): Promise<Blob> {
    const response = await this.client.get('/admin/users/export-excel', {
      responseType: 'blob',
    });
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

  async exportRedeemsExcel(): Promise<Blob> {
    const response = await this.client.get('/admin/redeems/export-excel', {
      responseType: 'blob',
    });
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

  // Notification endpoints
  async getNotifications(): Promise<any> {
    const response = await this.client.get('/notifications');
    return response.data;
  }

  async markNotificationAsRead(id: string): Promise<any> {
    const response = await this.client.patch(`/notifications/${id}/read`);
    return response.data;
  }

  // Utility method for direct API calls
  async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.request<T>(config);
  }

  // Clear session cache and temporary tokens
  clearSessionCache() {
    this.sessionCache = null;
    this.tempAccessToken = null;
    this.tempRefreshToken = null;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
