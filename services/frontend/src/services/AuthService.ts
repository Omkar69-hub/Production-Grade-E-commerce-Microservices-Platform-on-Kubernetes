import apiClient from '../config/axios';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth';

export const AuthService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: { accessToken: string; expiresIn: number } }>('/api/v1/auth/login', credentials);
    const accessToken = response.data.data.accessToken;
    localStorage.setItem('token', accessToken);

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
    await apiClient.post('/api/v1/auth/register', userData);
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<{ data: User }>('/api/v1/auth/me');
    return response.data.data;
  },

  refreshToken: async (): Promise<string> => {
    const response = await apiClient.post<{ data: { accessToken: string; expiresIn: number } }>('/api/v1/auth/refresh');
    const newAccessToken = response.data.data.accessToken;
    localStorage.setItem('token', newAccessToken);
    return newAccessToken;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
    }
  }
};
