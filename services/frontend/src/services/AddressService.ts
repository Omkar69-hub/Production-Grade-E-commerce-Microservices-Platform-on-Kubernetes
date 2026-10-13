import apiClient from '../config/axios';
import type { Address, AddressInput } from '../types/address';

export const AddressService = {
  getAddresses: async (): Promise<Address[]> => {
    const response = await apiClient.get('/api/v1/auth/addresses');
    return response.data.data;
  },

  getAddress: async (id: string): Promise<Address> => {
    const response = await apiClient.get(`/api/v1/auth/addresses/${id}`);
    return response.data.data;
  },

  createAddress: async (data: AddressInput): Promise<Address> => {
    const response = await apiClient.post('/api/v1/auth/addresses', data);
    return response.data.data;
  },

  updateAddress: async (id: string, data: AddressInput): Promise<Address> => {
    const response = await apiClient.put(`/api/v1/auth/addresses/${id}`, data);
    return response.data.data;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/auth/addresses/${id}`);
  },

  setDefaultAddress: async (id: string): Promise<Address> => {
    const response = await apiClient.patch(`/api/v1/auth/addresses/${id}/default`);
    return response.data.data;
  }
};
