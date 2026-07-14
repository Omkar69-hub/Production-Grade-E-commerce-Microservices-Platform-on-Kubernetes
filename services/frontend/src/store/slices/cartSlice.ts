import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Cart, AddToCartRequest } from '../../types/cart';
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
  async (cartId: string, { rejectWithValue }) => {
    try {
      return await CartService.getCart(cartId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ cartId, item }: { cartId: string; item: AddToCartRequest }, { rejectWithValue }) => {
    try {
      return await CartService.addToCart(cartId, item);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ cartId, productId }: { cartId: string; productId: string }, { rejectWithValue }) => {
    try {
      await CartService.removeItem(cartId, productId);
      return productId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove item');
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
      .addCase(removeFromCart.fulfilled, (state, action) => {
        if (state.cart) {
          state.cart.items = state.cart.items.filter(i => i.productId !== action.payload);
          state.cart.totalPrice = state.cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        }
      });
  },
});

export const { initializeCart, clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
