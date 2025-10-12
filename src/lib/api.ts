/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';
// Note: Auth types are now handled by NextAuth.js

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api',
      timeout: 10000,
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
        // Only add auth header for protected endpoints and non-GET methods
        const protectedEndpoints = [
          '/auth/me',
          '/posts',
          '/actions',
          '/redeems',
          '/analytics',
          '/admin',
          '/points',
          '/users',
        ];

        // For rewards, only protect non-GET methods (POST, PATCH, DELETE)
        const isRewardsEndpoint = config.url?.includes('/rewards');
        const isRewardsProtectedMethod =
          isRewardsEndpoint &&
          (config.method === 'post' ||
            config.method === 'patch' ||
            config.method === 'delete');

        const needsAuth =
          protectedEndpoints.some(endpoint => config.url?.includes(endpoint)) ||
          isRewardsProtectedMethod;

        if (needsAuth) {
          const session = await getSession();
          if (session?.user) {
            // For NextAuth, we'll use the session directly
            // The backend should accept the session token
            config.headers.Authorization = `Bearer ${session.user.id}`;
          }
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    this.client.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          // Redirect to login on 401
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Note: Auth methods are now handled by NextAuth.js
  // Use useNextAuth hook instead of these methods

  // User endpoints
  async getCurrentUser(): Promise<any> {
    const response = await this.client.get('/auth/me');
    return response.data.data;
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
      `/posts?highlighted=true&page=${page}&limit=${limit}`
    );
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

  async sharePost(postId: string): Promise<any> {
    const response = await this.client.post(`/posts/${postId}/share`);
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
    // Transform frontend data to backend format
    const backendData = {
      giftCode: data.rewardId, // Assuming rewardId is the gift code
      receiverInfo: {
        name: data.receiverName,
        phone: data.receiverPhone,
        address: data.receiverAddress,
      },
      payWith: 'points', // Default to points
    };
    const response = await this.client.post('/redeems', backendData);
    return response.data;
  }

  async getRedeemHistory(): Promise<any> {
    const response = await this.client.get('/redeems');
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

  // Admin endpoints
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

  async getRedeemLogs(): Promise<any> {
    const response = await this.client.get('/admin/redeems');
    return response.data;
  }

  async getUserActions(): Promise<any> {
    const response = await this.client.get('/actions/user');
    return response.data;
  }

  // Admin methods
  async getUsers(): Promise<any> {
    const response = await this.client.get('/admin/users');
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

  async updateRedeemStatus(redeemId: string, status: string): Promise<any> {
    const response = await this.client.patch(`/redeems/${redeemId}/status`, {
      status,
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
