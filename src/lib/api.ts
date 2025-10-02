/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, AuthResponse, User } from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
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
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        `${this.client.defaults.baseURL}/auth/refresh`,
        { refreshToken }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      this.setTokens(accessToken, newRefreshToken);
      
      return accessToken;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/register', {
      email,
      password,
      name,
    });
    return response.data.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  }

  // Posts endpoints
  async getPosts(page = 1, limit = 10): Promise<any> {
    const response = await this.client.get(`/posts?page=${page}&limit=${limit}`);
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
    const response = await this.client.post(`/mood-cards/${cardId}/share`, shareData);
    return response.data;
  }

  // Rewards endpoints
  async getRewards(): Promise<any> {
    const response = await this.client.get('/rewards');
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

  // Upload endpoints
  async getSignedUploadUrl(filename: string, contentType: string): Promise<any> {
    const response = await this.client.post('/uploads/sign', {
      filename,
      contentType,
    });
    return response.data;
  }

  // Analytics endpoints
  async trackCornerAnalytics(data: any[]): Promise<void> {
    await this.client.post('/analytics/corners', { events: data });
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

  async getRedeemLogs(): Promise<any> {
    const response = await this.client.get('/admin/redeems');
    return response.data;
  }

  async updateRedeemStatus(redeemId: string, status: string): Promise<any> {
    const response = await this.client.patch(`/admin/redeems/${redeemId}`, { status });
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

