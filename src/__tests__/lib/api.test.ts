import { apiClient } from '@/lib/api';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock axios.create to return a mock instance
const mockAxiosInstance = {
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    // Reset all mock functions
    Object.values(mockAxiosInstance).forEach(mockFn => {
      if (typeof mockFn === 'function') {
        mockFn.mockClear();
      }
    });
  });

  describe('login', () => {
    it('should call login endpoint with correct data', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.login('test@example.com', 'password');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should handle login error', async () => {
      const error = new Error('Login failed');
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(
        apiClient.login('test@example.com', 'wrong-password')
      ).rejects.toThrow('Login failed');
    });
  });

  describe('register', () => {
    it('should call register endpoint with correct data', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.register(
        'test@example.com',
        'password',
        'Test User'
      );

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('getCurrentUser', () => {
    it('should call getCurrentUser endpoint', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { id: '1', email: 'test@example.com', name: 'Test User' },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getCurrentUser();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('logout', () => {
    it('should call logout endpoint and clear tokens', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} });

      await apiClient.logout();

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/logout');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('getPosts', () => {
    it('should call getPosts endpoint with default parameters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { posts: [], pagination: { total: 0, page: 1, limit: 10 } },
          message: 'Success',
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getPosts();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/posts?page=1&limit=10'
      );
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should call getPosts endpoint with custom parameters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { posts: [], pagination: { total: 0, page: 2, limit: 20 } },
          message: 'Success',
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getPosts(2, 20);

      expect(mockedAxios.get).toHaveBeenCalledWith('/posts?page=2&limit=20');
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('likePost', () => {
    it('should call likePost endpoint', async () => {
      const mockResponse = { data: { success: true } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.likePost('post-id');

      expect(mockedAxios.post).toHaveBeenCalledWith('/posts/post-id/like');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createPost', () => {
    it('should call createPost endpoint with correct data', async () => {
      const postData = {
        imageUrl: 'https://example.com/image.jpg',
        caption: 'Test caption',
      };

      const mockResponse = {
        data: { success: true, data: { id: '1', ...postData } },
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.createPost(postData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/posts', postData);
      expect(result).toEqual(mockResponse.data);
    });
  });
});
