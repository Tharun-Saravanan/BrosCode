// API-based Cart Service
import { ApiClient } from './apiClient';
import type { CartItem } from '../types/cart';

export interface ApiCart {
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export class ApiCartService {
  /**
   * Get user's cart from API
   */
  static async getUserCart(userId: string): Promise<CartItem[]> {
    try {
      console.log('🌐 Fetching cart from API for user:', userId);
      const cart = await ApiClient.get<ApiCart>(`/carts/${userId}`);
      console.log('✅ Fetched cart from API:', cart?.items?.length || 0, 'items');
      return cart?.items || [];
    } catch (error: any) {
      console.error('❌ Error fetching cart from API:', error);
      // Return empty cart on error
      return [];
    }
  }

  /**
   * Add item to cart via API
   */
  static async addToCart(userId: string, item: Partial<CartItem>): Promise<ApiCart> {
    try {
      console.log('🌐 Adding item to cart via API for user:', userId);
      const cart = await ApiClient.post<ApiCart>(`/carts/${userId}`, item);
      console.log('✅ Item added to cart via API');
      return cart;
    } catch (error: any) {
      console.error('❌ Error adding item to cart via API:', error);
      throw new Error(`Failed to add item to cart: ${error.message}`);
    }
  }

  /**
   * Update cart item quantity via API
   */
  static async updateCartItem(userId: string, itemId: string, quantity: number): Promise<ApiCart> {
    try {
      console.log('🌐 Updating cart item via API for user:', userId);
      const cart = await ApiClient.put<ApiCart>(`/carts/${userId}`, { itemId, quantity });
      console.log('✅ Cart item updated via API');
      return cart;
    } catch (error: any) {
      console.error('❌ Error updating cart item via API:', error);
      throw new Error(`Failed to update cart item: ${error.message}`);
    }
  }

  /**
   * Remove item from cart via API
   */
  static async removeFromCart(userId: string, itemId: string): Promise<ApiCart> {
    try {
      console.log('🌐 Removing item from cart via API for user:', userId);
      const cart = await ApiClient.delete<ApiCart>(`/carts/${userId}/items/${itemId}`);
      console.log('✅ Item removed from cart via API');
      return cart;
    } catch (error: any) {
      console.error('❌ Error removing item from cart via API:', error);
      throw new Error(`Failed to remove item from cart: ${error.message}`);
    }
  }

  /**
   * Clear entire cart via API
   */
  static async clearCart(userId: string): Promise<void> {
    try {
      console.log('🌐 Clearing cart via API for user:', userId);
      await ApiClient.delete(`/carts/${userId}`);
      console.log('✅ Cart cleared via API');
    } catch (error: any) {
      console.error('❌ Error clearing cart via API:', error);
      throw new Error(`Failed to clear cart: ${error.message}`);
    }
  }

  /**
   * Sync local cart to API (for migration when user logs in)
   */
  static async syncCart(userId: string, items: CartItem[]): Promise<ApiCart> {
    try {
      console.log('🔄 Syncing cart to API for user:', userId);
      
      // Clear existing cart first
      await this.clearCart(userId);
      
      // Add each item to the cart
      let cart: ApiCart | null = null;
      for (const item of items) {
        cart = await this.addToCart(userId, item);
      }
      
      console.log('✅ Cart synced to API');
      return cart || {
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('❌ Error syncing cart to API:', error);
      throw new Error(`Failed to sync cart: ${error.message}`);
    }
  }
}
