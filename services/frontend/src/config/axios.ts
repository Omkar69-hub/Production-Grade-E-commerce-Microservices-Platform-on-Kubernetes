import axios from 'axios';
import { env } from './env';
import { tokenStorage } from '../services/tokenStorage';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined' || !document.cookie) {
    return null;
  }
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

const apiClient = axios.create({
  baseURL: env.API_GATEWAY_URL ?? '',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach in-memory JWT token and CSRF proof for refresh/logout
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach CSRF proof header for cookie-authenticated refresh and logout requests
    const url = config.url || '';
    if (url.includes('/api/v1/auth/refresh') || url.includes('/api/v1/auth/logout')) {
      const csrfToken = getCookie('XSRF-TOKEN');
      if (csrfToken && config.headers) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
        config.headers['X-CSRF-TOKEN'] = csrfToken;
      }
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

// Response interceptor: handles 401 with atomic refresh coordination, single retry, and loop prevention
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Fails immediately if not 401 or no request config
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || '';
    const isAuthEndpoint =
      url.includes('/api/v1/auth/login') ||
      url.includes('/api/v1/auth/register') ||
      url.includes('/api/v1/auth/refresh');

    // Prevent infinite retry loops on auth endpoints or already-retried requests
    if (isAuthEndpoint || originalRequest._retry) {
      if (url.includes('/api/v1/auth/refresh') || originalRequest._retry) {
        tokenStorage.clearToken();
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Concurrently queued: wait for active refresh to resolve and retry once
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
      const refreshResponse = await apiClient.post<{
        data: { accessToken: string; expiresIn: number };
      }>('/api/v1/auth/refresh');

      const newAccessToken = refreshResponse.data?.data?.accessToken;
      if (!newAccessToken) {
        throw new Error('Refresh failed: access token missing');
      }

      tokenStorage.setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenStorage.clearToken();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
