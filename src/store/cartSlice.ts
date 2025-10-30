import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartState, CartItem, AddToCartPayload, UpdateCartItemPayload } from '../types/cart';
import { CartService } from '../services/cartService';

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
  loading: false,
  error: null,
};

// Async thunk to load cart from DynamoDB/localStorage for specific user
export const loadCart = createAsyncThunk(
  'cart/loadCart',
  async (userId: string | null, { rejectWithValue }) => {
    try {
      const items = await CartService.getCartForUserAsync(userId);
      return items;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load cart');
    }
  }
);

// Async thunk to load user cart (for backward compatibility)
export const loadUserCart = createAsyncThunk(
  'cart/loadUserCart',
  async (userId: string | null, { rejectWithValue }) => {
    try {
      const items = await CartService.getCartForUserAsync(userId);
      return items;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load user cart');
    }
  }
);

// Async thunk to add item to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (payload: AddToCartPayload & { userId?: string | null }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState };
      const updatedItems = CartService.addToCart(state.cart.items, payload);
      await CartService.saveCartForUserAsync(payload.userId || null, updatedItems);
      return updatedItems;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add item to cart');
    }
  }
);

// Async thunk to remove item from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (payload: { itemId: string; userId?: string | null }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState };
      const updatedItems = CartService.removeFromCart(state.cart.items, payload.itemId);
      await CartService.saveCartForUserAsync(payload.userId || null, updatedItems);
      return updatedItems;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove item from cart');
    }
  }
);

// Async thunk to update item quantity
export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async (payload: UpdateCartItemPayload & { userId?: string | null }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState };
      const updatedItems = CartService.updateQuantity(state.cart.items, payload.id, payload.quantity);
      await CartService.saveCartForUserAsync(payload.userId || null, updatedItems);
      return updatedItems;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update cart item');
    }
  }
);

// Async thunk to clear cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (userId: string | null, { rejectWithValue }) => {
    try {
      if (userId) {
        CartService.clearUserCart(userId);
      } else {
        CartService.clearGuestCart();
      }
      return [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear cart');
    }
  }
);

// Async thunk to handle user sign in (merge guest cart with user cart)
export const handleUserSignIn = createAsyncThunk(
  'cart/handleUserSignIn',
  async (userId: string, { rejectWithValue }) => {
    try {
      const mergedItems = await CartService.transferGuestCartToUserAsync(userId);
      return mergedItems;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to merge cart on sign in');
    }
  }
);

// Async thunk to handle user sign out (transfer user cart to guest)
export const handleUserSignOut = createAsyncThunk(
  'cart/handleUserSignOut',
  async (userId: string, { rejectWithValue }) => {
    try {
      const guestItems = await CartService.transferUserCartToGuestAsync(userId);
      return guestItems;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to transfer cart on sign out');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Sync action for merging guest cart with user cart
    mergeGuestCart: (state, action: PayloadAction<CartItem[]>) => {
      const mergedItems = CartService.mergeGuestCartWithUserCart(state.items, action.payload);
      state.items = mergedItems;
      const totals = CartService.calculateTotals(mergedItems);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
      // Note: Don't save here as this is handled by the calling thunk
    },
    // Sync action to set cart items directly
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      const totals = CartService.calculateTotals(action.payload);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
    },
  },
  extraReducers: (builder) => {
    // Load cart
    builder
      .addCase(loadCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        const totals = CartService.calculateTotals(action.payload);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
        state.error = null;
      })
      .addCase(loadCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        const totals = CartService.calculateTotals(action.payload);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        const totals = CartService.calculateTotals(action.payload);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Update quantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        const totals = CartService.calculateTotals(action.payload);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Handle user sign in
      .addCase(handleUserSignIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleUserSignIn.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        const totals = CartService.calculateTotals(action.payload);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
        state.error = null;
      })
      .addCase(handleUserSignIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Handle user sign out
      .addCase(handleUserSignOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleUserSignOut.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        const totals = CartService.calculateTotals(action.payload);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
        state.error = null;
      })
      .addCase(handleUserSignOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Load user cart
      .addCase(loadUserCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        const totals = CartService.calculateTotals(action.payload);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
        state.error = null;
      })
      .addCase(loadUserCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { toggleCart, closeCart, openCart, clearError, mergeGuestCart, setCartItems } = cartSlice.actions;
export default cartSlice.reducer;
