import axios from 'axios';
import { env } from './env';

const apiClient = axios.create({
  baseURL: env.API_GATEWAY_URL,
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

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., logout user, clear token)
      localStorage.removeItem('token');
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
