import type { CartItem, AddToCartPayload } from '../types/cart';
import { DynamoCartService } from './dynamoCartService';

const GUEST_CART_STORAGE_KEY = 'sibiling_shoes_guest_cart';
const USER_CART_STORAGE_PREFIX = 'sibiling_shoes_user_cart_';

export class CartService {
  // Generate user-specific storage key
  static getUserCartKey(userId: string): string {
    return `${USER_CART_STORAGE_PREFIX}${userId}`;
  }

  // Get cart items from localStorage for a specific user (sync method)
  static getUserCartFromStorage(userId: string): CartItem[] {
    try {
      const cartKey = this.getUserCartKey(userId);
      const cartData = localStorage.getItem(cartKey);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error reading user cart from localStorage:', error);
      return [];
    }
  }

  // Get cart items for a specific user (async method with DynamoDB)
  static async getUserCart(userId: string): Promise<CartItem[]> {
    try {
      const localItems = this.getUserCartFromStorage(userId);
      return await DynamoCartService.getCartWithFallback(userId, localItems);
    } catch (error) {
      console.error('Error getting user cart:', error);
      // Fallback to localStorage only
      return this.getUserCartFromStorage(userId);
    }
  }

  // Get guest cart items from localStorage
  static getGuestCartFromStorage(): CartItem[] {
    try {
      const cartData = localStorage.getItem(GUEST_CART_STORAGE_KEY);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error reading guest cart from localStorage:', error);
      return [];
    }
  }

  // Save cart items to localStorage for a specific user (sync method)
  static saveUserCartToStorage(userId: string, items: CartItem[]): void {
    try {
      const cartKey = this.getUserCartKey(userId);
      localStorage.setItem(cartKey, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving user cart to localStorage:', error);
    }
  }

  // Save cart items for a specific user (async method with DynamoDB)
  static async saveUserCart(userId: string, items: CartItem[]): Promise<void> {
    try {
      await DynamoCartService.saveCartWithFallback(
        userId,
        items,
        (items) => this.saveUserCartToStorage(userId, items)
      );
    } catch (error) {
      console.error('Error saving user cart:', error);
      // Fallback to localStorage only
      this.saveUserCartToStorage(userId, items);
    }
  }

  // Save guest cart items to localStorage
  static saveGuestCartToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving guest cart to localStorage:', error);
    }
  }

  // Get cart items from localStorage (legacy method for backward compatibility)
  static getCartFromStorage(): CartItem[] {
    // This method now defaults to guest cart
    return this.getGuestCartFromStorage();
  }

  // Save cart items to localStorage (legacy method for backward compatibility)
  static saveCartToStorage(items: CartItem[]): void {
    // This method now defaults to guest cart
    this.saveGuestCartToStorage(items);
  }

  // Generate unique cart item ID
  static generateCartItemId(productId: string, size: string): string {
    return `${productId}_${size}`;
  }

  // Add item to cart
  static addToCart(items: CartItem[], payload: AddToCartPayload): CartItem[] {
    const cartItemId = this.generateCartItemId(payload.productId, payload.size);
    const existingItemIndex = items.findIndex(item => item.id === cartItemId);

    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const updatedItems = [...items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + (payload.quantity || 1)
      };
      return updatedItems;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: cartItemId,
        productId: payload.productId,
        name: payload.name,
        price: payload.price,
        imageUrl: payload.imageUrl,
        size: payload.size,
        quantity: payload.quantity || 1,
        category: payload.category
      };
      return [...items, newItem];
    }
  }

  // Remove item from cart
  static removeFromCart(items: CartItem[], itemId: string): CartItem[] {
    return items.filter(item => item.id !== itemId);
  }

  // Update item quantity
  static updateQuantity(items: CartItem[], itemId: string, quantity: number): CartItem[] {
    if (quantity <= 0) {
      return this.removeFromCart(items, itemId);
    }

    return items.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
  }

  // Calculate totals
  static calculateTotals(items: CartItem[]): { totalItems: number; totalPrice: number } {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return { totalItems, totalPrice };
  }

  // Clear user cart
  static clearUserCart(userId: string): void {
    const cartKey = this.getUserCartKey(userId);
    localStorage.removeItem(cartKey);
  }

  // Clear guest cart
  static clearGuestCart(): void {
    localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  }

  // Clear cart (legacy method for backward compatibility)
  static clearCart(): void {
    // This method now defaults to guest cart
    this.clearGuestCart();
  }

  // Merge guest cart with user cart (when user signs in)
  static mergeGuestCartWithUserCart(guestItems: CartItem[], userItems: CartItem[]): CartItem[] {
    let mergedItems = [...userItems];

    guestItems.forEach(guestItem => {
      const existingItemIndex = mergedItems.findIndex(item => item.id === guestItem.id);

      if (existingItemIndex >= 0) {
        // Merge quantities if same item exists
        mergedItems[existingItemIndex] = {
          ...mergedItems[existingItemIndex],
          quantity: mergedItems[existingItemIndex].quantity + guestItem.quantity
        };
      } else {
        // Add guest item if it doesn't exist
        mergedItems.push(guestItem);
      }
    });

    return mergedItems;
  }

  // Transfer guest cart to user cart when user signs in (sync method)
  static transferGuestCartToUser(userId: string): CartItem[] {
    const guestItems = this.getGuestCartFromStorage();
    const userItems = this.getUserCartFromStorage(userId);
    const mergedItems = this.mergeGuestCartWithUserCart(guestItems, userItems);

    // Save merged cart to user storage
    this.saveUserCartToStorage(userId, mergedItems);

    // Clear guest cart after transfer
    this.clearGuestCart();

    return mergedItems;
  }

  // Transfer guest cart to user cart when user signs in (async method)
  static async transferGuestCartToUserAsync(userId: string): Promise<CartItem[]> {
    const guestItems = this.getGuestCartFromStorage();
    const userItems = await this.getUserCart(userId);
    const mergedItems = this.mergeGuestCartWithUserCart(guestItems, userItems);

    // Save merged cart to user storage (DynamoDB + localStorage)
    await this.saveUserCart(userId, mergedItems);

    // Clear guest cart after transfer
    this.clearGuestCart();

    return mergedItems;
  }

  // Transfer user cart to guest cart when user signs out (sync method)
  static transferUserCartToGuest(userId: string): CartItem[] {
    const userItems = this.getUserCartFromStorage(userId);

    // Save user cart to guest storage (overwrite any existing guest cart)
    this.saveGuestCartToStorage(userItems);

    return userItems;
  }

  // Transfer user cart to guest cart when user signs out (async method)
  static async transferUserCartToGuestAsync(userId: string): Promise<CartItem[]> {
    const userItems = await this.getUserCart(userId);

    // Save user cart to guest storage (overwrite any existing guest cart)
    this.saveGuestCartToStorage(userItems);

    return userItems;
  }

  // Get appropriate cart based on user authentication status (sync method)
  static getCartForUser(userId: string | null): CartItem[] {
    if (userId) {
      return this.getUserCartFromStorage(userId);
    } else {
      return this.getGuestCartFromStorage();
    }
  }

  // Get appropriate cart based on user authentication status (async method)
  static async getCartForUserAsync(userId: string | null): Promise<CartItem[]> {
    if (userId) {
      return await this.getUserCart(userId);
    } else {
      return this.getGuestCartFromStorage();
    }
  }

  // Save cart for appropriate user based on authentication status (sync method)
  static saveCartForUser(userId: string | null, items: CartItem[]): void {
    if (userId) {
      this.saveUserCartToStorage(userId, items);
    } else {
      this.saveGuestCartToStorage(items);
    }
  }

  // Save cart for appropriate user based on authentication status (async method)
  static async saveCartForUserAsync(userId: string | null, items: CartItem[]): Promise<void> {
    if (userId) {
      await this.saveUserCart(userId, items);
    } else {
      this.saveGuestCartToStorage(items);
    }
  }
}
