import apiClient from '../config/axios';
import type { CreateOrderRequest, OrderResponse, OrderTrackingResponse } from '../types/order';

export const OrderService = {
  createOrder: async (request: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await apiClient.post(`/api/v1/orders`, request);
    return response.data.data;
  },

  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    const response = await apiClient.get(`/api/v1/orders/${orderId}`);
    return response.data.data;
  },

  getOrderTracking: async (orderId: string): Promise<OrderTrackingResponse> => {
    const response = await apiClient.get(`/api/v1/orders/${orderId}/tracking`);
    return response.data.data;
  },

  simulateStatusTransition: async (orderId: string, status: string, comment?: string): Promise<OrderTrackingResponse> => {
    const response = await apiClient.post(`/api/v1/orders/${orderId}/simulate-status`, { status, comment });
    return response.data.data;
  },

  getUserOrders: async (page = 0, size = 10): Promise<any> => {
    const response = await apiClient.get(`/api/v1/orders`, {
      params: { page, size }
    });
    return response.data.data;
  },

  getAllOrders: async (page = 0, size = 50): Promise<any> => {
    const response = await apiClient.get(`/api/v1/orders/all`, {
      params: { page, size }
    });
    return response.data.data;
  }
};

