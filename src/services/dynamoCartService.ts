import { GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, DYNAMODB_QUERIES } from '../config/aws';
import type { CartItem } from '../types/cart';

export interface DynamoCartData {
  userId: string;
  cartType: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: number;
}

export class DynamoCartService {
  // Get user cart from DynamoDB
  static async getUserCart(userId: string): Promise<CartItem[]> {
    try {
      console.log('🗄️ DynamoDB: Getting cart for user:', userId);
      
      const command = new GetCommand(DYNAMODB_QUERIES.getUserCart(userId));
      const response = await dynamoDbDocClient.send(command);
      
      if (response.Item) {
        console.log('✅ DynamoDB: Cart found for user:', userId, 'Items:', response.Item.items?.length || 0);
        return response.Item.items || [];
      } else {
        console.log('📭 DynamoDB: No cart found for user:', userId);
        return [];
      }
    } catch (error) {
      console.error('❌ DynamoDB: Error getting user cart:', error);
      throw new Error(`Failed to get cart for user ${userId}: ${error}`);
    }
  }

  // Save user cart to DynamoDB
  static async saveUserCart(userId: string, items: CartItem[]): Promise<void> {
    try {
      console.log('💾 DynamoDB: Saving cart for user:', userId, 'Items:', items.length);
      
      // Calculate totals
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const cartData = {
        items,
        totalItems,
        totalPrice,
        createdAt: new Date().toISOString(),
      };
      
      const command = new PutCommand(DYNAMODB_QUERIES.saveUserCart(userId, cartData));
      await dynamoDbDocClient.send(command);
      
      console.log('✅ DynamoDB: Cart saved successfully for user:', userId);
    } catch (error) {
      console.error('❌ DynamoDB: Error saving user cart:', error);
      throw new Error(`Failed to save cart for user ${userId}: ${error}`);
    }
  }

  // Delete user cart from DynamoDB
  static async deleteUserCart(userId: string): Promise<void> {
    try {
      console.log('🗑️ DynamoDB: Deleting cart for user:', userId);
      
      const command = new DeleteCommand(DYNAMODB_QUERIES.deleteUserCart(userId));
      await dynamoDbDocClient.send(command);
      
      console.log('✅ DynamoDB: Cart deleted successfully for user:', userId);
    } catch (error) {
      console.error('❌ DynamoDB: Error deleting user cart:', error);
      throw new Error(`Failed to delete cart for user ${userId}: ${error}`);
    }
  }

  // Check if DynamoDB is available
  static async isAvailable(): Promise<boolean> {
    try {
      // Try a simple operation to check if DynamoDB is accessible
      const testUserId = 'health-check-test';
      await this.getUserCart(testUserId);
      return true;
    } catch (error) {
      console.warn('⚠️ DynamoDB: Service not available, falling back to localStorage');
      return false;
    }
  }

  // Sync localStorage cart to DynamoDB (for migration/backup)
  static async syncLocalStorageToDb(userId: string, localItems: CartItem[]): Promise<void> {
    try {
      if (localItems.length > 0) {
        console.log('🔄 DynamoDB: Syncing localStorage cart to database for user:', userId);
        await this.saveUserCart(userId, localItems);
        console.log('✅ DynamoDB: localStorage cart synced successfully');
      }
    } catch (error) {
      console.error('❌ DynamoDB: Failed to sync localStorage cart:', error);
      // Don't throw error here as this is a background sync operation
    }
  }

  // Get cart with fallback to localStorage
  static async getCartWithFallback(userId: string, localStorageItems: CartItem[]): Promise<CartItem[]> {
    try {
      // Try to get from DynamoDB first
      const dbItems = await this.getUserCart(userId);
      
      // If DynamoDB has items, use them
      if (dbItems.length > 0) {
        return dbItems;
      }
      
      // If DynamoDB is empty but localStorage has items, sync them
      if (localStorageItems.length > 0) {
        await this.syncLocalStorageToDb(userId, localStorageItems);
        return localStorageItems;
      }
      
      // Both are empty
      return [];
    } catch (error) {
      console.warn('⚠️ DynamoDB: Falling back to localStorage due to error:', error);
      return localStorageItems;
    }
  }

  // Save cart with fallback to localStorage
  static async saveCartWithFallback(
    userId: string, 
    items: CartItem[], 
    localStorageSaveFn: (items: CartItem[]) => void
  ): Promise<void> {
    // Always save to localStorage first for immediate response
    localStorageSaveFn(items);
    
    try {
      // Then sync to DynamoDB in background
      await this.saveUserCart(userId, items);
    } catch (error) {
      console.warn('⚠️ DynamoDB: Failed to sync to database, but localStorage saved:', error);
      // Don't throw error as localStorage save succeeded
    }
  }
}
