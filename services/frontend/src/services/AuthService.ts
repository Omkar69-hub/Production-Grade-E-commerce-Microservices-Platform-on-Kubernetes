import apiClient from '../config/axios';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

export const AuthService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: AuthResponse }>('/api/v1/auth/login', credentials);
    return response.data.data;
  },

  register: async (userData: RegisterRequest): Promise<void> => {
    await apiClient.post('/api/v1/auth/register', userData);
  },
  
  getProfile: async (): Promise<any> => {
    const response = await apiClient.get('/api/v1/auth/me');
    return response.data.data;
  }
};
