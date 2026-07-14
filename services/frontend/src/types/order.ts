export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  cartId: string;
  shippingAddress: ShippingAddress;
}

export interface OrderResponse {
  orderId: string;
  userId: string;
  status: string; // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
  totalAmount: number;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  createdAt: string;
}
