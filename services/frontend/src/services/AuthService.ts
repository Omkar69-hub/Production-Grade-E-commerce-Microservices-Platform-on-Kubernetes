import apiClient from '../config/axios';
import { tokenStorage } from './tokenStorage';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth';

export const AuthService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: { accessToken: string; expiresIn: number } }>('/api/v1/auth/login', credentials);
    if (!response.data || typeof response.data !== 'object' || !response.data.data?.accessToken) {
      throw new Error('Authentication response format invalid. Expected backend JSON access token.');
    }
    const accessToken = response.data.data.accessToken;
    tokenStorage.setAccessToken(accessToken);

    // Retrieve user profile using the authenticated token
    const profileResponse = await apiClient.get<{ data: User }>('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const user = profileResponse.data.data;
    return {
      token: accessToken,
      user: user
    };
  },

  register: async (userData: RegisterRequest): Promise<void> => {
    const response = await apiClient.post('/api/v1/auth/register', userData);
    if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<!doctype')) {
      throw new Error('Backend unavailable: Endpoint returned SPA fallback HTML instead of API response.');
    }
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<{ data: User }>('/api/v1/auth/me');
    return response.data.data;
  },

  refreshToken: async (): Promise<string> => {
    const response = await apiClient.post<{ data: { accessToken: string; expiresIn: number } }>('/api/v1/auth/refresh');
    const newAccessToken = response.data.data.accessToken;
    tokenStorage.setAccessToken(newAccessToken);
    return newAccessToken;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch {
      // Ignore network errors on logout to allow client cleanup
    } finally {
      tokenStorage.clearToken();
    }
  },

  restoreSession: async (): Promise<AuthResponse | null> => {
    try {
      const response = await apiClient.post<{ data: { accessToken: string; expiresIn: number } }>('/api/v1/auth/refresh');
      const accessToken = response.data?.data?.accessToken;
      if (!accessToken) {
        return null;
      }
      tokenStorage.setAccessToken(accessToken);

      const profileResponse = await apiClient.get<{ data: User }>('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      return {
        token: accessToken,
        user: profileResponse.data.data
      };
    } catch {
      tokenStorage.clearToken();
      return null;
    }
  }
};
