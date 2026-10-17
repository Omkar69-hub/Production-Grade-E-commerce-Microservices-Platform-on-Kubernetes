import axios from 'axios';
import { env } from './env';

const apiClient = axios.create({
  baseURL: env.API_GATEWAY_URL ?? '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor with refresh token rotation and race-condition prevention
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Fails immediately if not 401 or no config
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Do not attempt refresh on auth endpoints (login, register, refresh) or if already retried
    const url = originalRequest.url || '';
    const isAuthEndpoint =
      url.includes('/api/v1/auth/login') ||
      url.includes('/api/v1/auth/register') ||
      url.includes('/api/v1/auth/refresh');

    if (isAuthEndpoint || originalRequest._retry) {
      if (url.includes('/api/v1/auth/refresh') || originalRequest._retry) {
        localStorage.removeItem('token');
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Refresh in flight: queue request until new token is available
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Cookie is passed automatically because withCredentials: true
      const refreshResponse = await apiClient.post<{
        data: { accessToken: string; expiresIn: number };
      }>('/api/v1/auth/refresh');

      const newAccessToken = refreshResponse.data?.data?.accessToken;
      if (!newAccessToken) {
        throw new Error('Refresh failed: access token missing');
      }

      localStorage.setItem('token', newAccessToken);
      processQueue(null, newAccessToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem('token');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
