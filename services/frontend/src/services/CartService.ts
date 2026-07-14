import apiClient from '../config/axios';
import { Cart, AddToCartRequest } from '../types/cart';

export const CartService = {
  getCart: async (cartId: string): Promise<Cart> => {
    const response = await apiClient.get(`/api/v1/cart/${cartId}`);
    return response.data.data;
  },

  addToCart: async (cartId: string, request: AddToCartRequest): Promise<Cart> => {
    const response = await apiClient.post(`/api/v1/cart/${cartId}/items`, request);
    return response.data.data;
  },

  updateQuantity: async (cartId: string, productId: string, quantity: number): Promise<Cart> => {
    const response = await apiClient.put(`/api/v1/cart/${cartId}/items/${productId}`, { quantity });
    return response.data.data;
  },

  removeItem: async (cartId: string, productId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/cart/${cartId}/items/${productId}`);
  },

  clearCart: async (cartId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/cart/${cartId}`);
  }
};
