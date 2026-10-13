export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  name?: string;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  price?: number;
  totalPrice?: number;
}

export interface CreateOrderRequest {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  notes?: string;
  cartId?: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  orderId?: string;
  userId: string;
  status: string; // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  status: string;
  comment?: string;
  isSimulated: boolean;
  createdAt: string;
}

export interface OrderTrackingResponse {
  orderId: string;
  orderNumber: string;
  currentStatus: string;
  createdAt: string;
  updatedAt?: string;
  timeline: OrderStatusHistoryItem[];
}
