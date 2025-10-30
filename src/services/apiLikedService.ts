// API-based Liked Products Service
import { ApiClient } from './apiClient';

export interface LikedProduct {
  productId: string;
  productName: string;
  addedAt: string;
}

export interface ApiLikedProducts {
  userId: string;
  products: LikedProduct[];
  totalLiked: number;
  createdAt: string;
  updatedAt: string;
}

export class ApiLikedService {
  /**
   * Get user's liked products from API
   */
  static async getLikedProducts(userId: string): Promise<LikedProduct[]> {
    try {
      console.log('🌐 Fetching liked products from API for user:', userId);
      const likedData = await ApiClient.get<ApiLikedProducts>(`/liked/${userId}`);
      console.log('✅ Fetched liked products from API:', likedData?.products?.length || 0, 'items');
      return likedData?.products || [];
    } catch (error: any) {
      console.error('❌ Error fetching liked products from API:', error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Add product to liked list via API
   */
  static async addLikedProduct(userId: string, productId: string, productName: string): Promise<ApiLikedProducts> {
    try {
      console.log('🌐 Adding liked product via API for user:', userId);
      const likedData = await ApiClient.post<ApiLikedProducts>(`/liked/${userId}`, {
        productId,
        productName,
      });
      console.log('✅ Liked product added via API');
      return likedData;
    } catch (error: any) {
      console.error('❌ Error adding liked product via API:', error);
      throw new Error(`Failed to add liked product: ${error.message}`);
    }
  }

  /**
   * Remove product from liked list via API
   */
  static async removeLikedProduct(userId: string, productId: string): Promise<ApiLikedProducts> {
    try {
      console.log('🌐 Removing liked product via API for user:', userId);
      const likedData = await ApiClient.delete<ApiLikedProducts>(`/liked/${userId}/products/${productId}`);
      console.log('✅ Liked product removed via API');
      return likedData;
    } catch (error: any) {
      console.error('❌ Error removing liked product via API:', error);
      throw new Error(`Failed to remove liked product: ${error.message}`);
    }
  }

  /**
   * Clear all liked products via API
   */
  static async clearLikedProducts(userId: string): Promise<void> {
    try {
      console.log('🌐 Clearing liked products via API for user:', userId);
      await ApiClient.delete(`/liked/${userId}`);
      console.log('✅ Liked products cleared via API');
    } catch (error: any) {
      console.error('❌ Error clearing liked products via API:', error);
      throw new Error(`Failed to clear liked products: ${error.message}`);
    }
  }

  /**
   * Check if a product is liked
   */
  static async isProductLiked(userId: string, productId: string): Promise<boolean> {
    try {
      const likedProducts = await this.getLikedProducts(userId);
      return likedProducts.some(product => product.productId === productId);
    } catch (error: any) {
      console.error('❌ Error checking if product is liked:', error);
      return false;
    }
  }
}
