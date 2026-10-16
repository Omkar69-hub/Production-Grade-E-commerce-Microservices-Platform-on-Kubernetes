import apiClient from '../config/axios';
import type { Product, PaginatedResponse, PaginationParams, Category } from '../types/product';
import { serializeCategoryParamToBackendUuid } from '../utils/categoryMapping';

export const ProductService = {
  getProducts: async (params: PaginationParams): Promise<PaginatedResponse<Product>> => {
    // Backend expects 'name' instead of 'search'
    const apiParams: Record<string, any> = {
      ...params,
      name: params.search,
    };
    delete apiParams.search;

    if (apiParams.categoryId) {
      const serialized = serializeCategoryParamToBackendUuid(apiParams.categoryId);
      if (serialized) {
        apiParams.categoryId = serialized;
      } else {
        delete apiParams.categoryId;
      }
    }

    const response = await apiClient.get('/api/v1/products', { params: apiParams });
    return response.data.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/api/v1/products/${id}`);
    return response.data.data;
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const serializedCategory = data.categoryId ? serializeCategoryParamToBackendUuid(data.categoryId) : undefined;
    const payload = {
      ...data,
      ...(serializedCategory ? { categoryId: serializedCategory } : {}),
    };
    const response = await apiClient.post('/api/v1/products', payload);
    return response.data.data;
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const serializedCategory = data.categoryId ? serializeCategoryParamToBackendUuid(data.categoryId) : undefined;
    const payload = {
      ...data,
      ...(serializedCategory ? { categoryId: serializedCategory } : {}),
    };
    const response = await apiClient.put(`/api/v1/products/${id}`, payload);
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

