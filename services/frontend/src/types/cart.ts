export interface CartItem {
  productId: string;
  sku: string;
  name?: string;
  productName?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  totalLinePrice?: number;
}

export interface Cart {
  cartId?: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  totalPrice?: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}
