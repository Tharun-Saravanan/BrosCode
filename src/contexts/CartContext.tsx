import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useAppDispatch } from '../store/hooks';
import {
  loadCart,
  handleUserSignIn,
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  updateCartItemQuantity as updateCartItemQuantityAction,
  clearCart as clearCartAction
} from '../store/cartSlice';
import type { AddToCartPayload, UpdateCartItemPayload } from '../types/cart';

interface CartContextType {
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItemQuantity: (payload: UpdateCartItemPayload) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();

  const userId = currentUser?.uid || null;

  // Load appropriate cart when user authentication state changes
  useEffect(() => {
    console.log('🛒 Cart: User authentication state changed, userId:', userId);
    dispatch(loadCart(userId));
  }, [userId, dispatch]);

  // Handle user sign in - merge guest cart with user cart
  useEffect(() => {
    const handleSignIn = async () => {
      if (currentUser?.uid) {
        console.log('🛒 Cart: User signed in, merging carts for user:', currentUser.uid);
        try {
          await dispatch(handleUserSignIn(currentUser.uid)).unwrap();
          console.log('✅ Cart: Successfully merged guest cart with user cart');
        } catch (error) {
          console.error('❌ Cart: Failed to merge carts on sign in:', error);
        }
      }
    };

    // Only handle sign in if we have a user and this is a new sign in
    // (not just a page refresh with existing user)
    if (currentUser?.uid) {
      handleSignIn();
    }
  }, [currentUser?.uid, dispatch]);

  // Cart operations that automatically use the correct user context
  const addToCart = async (payload: AddToCartPayload): Promise<void> => {
    try {
      await dispatch(addToCartAction({ ...payload, userId })).unwrap();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string): Promise<void> => {
    try {
      await dispatch(removeFromCartAction({ itemId, userId })).unwrap();
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  };

  const updateCartItemQuantity = async (payload: UpdateCartItemPayload): Promise<void> => {
    try {
      await dispatch(updateCartItemQuantityAction({ ...payload, userId })).unwrap();
    } catch (error) {
      console.error('Failed to update cart item quantity:', error);
      throw error;
    }
  };

  const clearCart = async (): Promise<void> => {
    try {
      await dispatch(clearCartAction(userId)).unwrap();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const value: CartContextType = {
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
