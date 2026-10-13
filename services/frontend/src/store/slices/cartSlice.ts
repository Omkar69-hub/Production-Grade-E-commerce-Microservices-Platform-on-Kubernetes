import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Cart, AddToCartRequest } from '../../types/cart';
import { CartService } from '../../services/CartService';
import { v4 as uuidv4 } from 'uuid';

interface CartState {
  cartId: string | null;
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cartId: null,
  cart: null,
  loading: false,
  error: null,
};

// Thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      return await CartService.getCart();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ item }: { item: AddToCartRequest }, { rejectWithValue }) => {
    try {
      return await CartService.addToCart(item);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ productId }: { productId: string }, { rejectWithValue }) => {
    try {
      await CartService.removeItem(productId);
      return productId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove item');
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      return await CartService.updateQuantity(productId, quantity);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update quantity');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    initializeCart: (state) => {
      if (!state.cartId) {
        state.cartId = uuidv4();
      }
    },
    clearCartLocal: (state) => {
      state.cart = null;
      state.cartId = uuidv4();
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        if (state.cart) {
          state.cart.items = state.cart.items.filter(i => i.productId !== action.payload);
          const total = state.cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
          state.cart.subtotal = total;
          state.cart.totalPrice = total;
        }
      });
  },
});

export const { initializeCart, clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;



