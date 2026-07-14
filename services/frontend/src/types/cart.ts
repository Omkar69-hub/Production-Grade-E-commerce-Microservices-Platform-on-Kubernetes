export interface CartItem {
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Cart {
  cartId: string;
  userId?: string;
  items: CartItem[];
  totalPrice: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}
