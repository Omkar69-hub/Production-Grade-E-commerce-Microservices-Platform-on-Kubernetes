import apiClient from '../config/axios';
import { Product, PaginatedResponse, PaginationParams } from '../types/product';

export const ProductService = {
  getProducts: async (params: PaginationParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/api/v1/products', { params });
    return response.data.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/api/v1/products/${id}`);
    return response.data.data;
  },
};
