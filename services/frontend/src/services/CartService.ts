import apiClient from '../config/axios';
import type { Cart, AddToCartRequest } from '../types/cart';

export const CartService = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get(`/api/v1/cart`);
    return response.data.data;
  },

  addToCart: async (request: AddToCartRequest): Promise<Cart> => {
    const response = await apiClient.post(`/api/v1/cart/items`, request);
    return response.data.data;
  },

  updateQuantity: async (productId: string, quantity: number): Promise<Cart> => {
    const response = await apiClient.put(`/api/v1/cart/items/${productId}`, { productId, quantity });
    return response.data.data;
  },

  removeItem: async (productId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/cart/items/${productId}`);
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete(`/api/v1/cart`);
  }
};

