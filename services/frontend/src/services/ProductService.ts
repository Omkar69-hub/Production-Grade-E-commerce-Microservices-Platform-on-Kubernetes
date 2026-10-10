import apiClient from '../config/axios';
import type { Product, PaginatedResponse, PaginationParams, Category } from '../types/product';

export const ProductService = {
  getProducts: async (params: PaginationParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/api/v1/products', { params });
    return response.data.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/api/v1/products/${id}`);
    return response.data.data;
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.post('/api/v1/products', data);
    return response.data.data;
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put(`/api/v1/products/${id}`, data);
    return response.data.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/products/${id}`);
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/api/v1/categories');
    return response.data.data;
  },
};

