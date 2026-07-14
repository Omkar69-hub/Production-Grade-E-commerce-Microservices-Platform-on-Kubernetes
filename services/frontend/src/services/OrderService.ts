import apiClient from '../config/axios';
import { CreateOrderRequest, OrderResponse } from '../types/order';

export const OrderService = {
  createOrder: async (request: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await apiClient.post(`/api/v1/orders`, request);
    return response.data.data;
  },

  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    const response = await apiClient.get(`/api/v1/orders/${orderId}`);
    return response.data.data;
  },

  getUserOrders: async (): Promise<OrderResponse[]> => {
    const response = await apiClient.get(`/api/v1/orders/user`);
    return response.data.data;
  }
};
