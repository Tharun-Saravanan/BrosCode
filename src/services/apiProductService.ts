// API-based Product Service
import { ApiClient } from './apiClient';
import type { Product } from '../types/product';

export class ApiProductService {
  /**
   * Get all products from API
   */
  static async getAllProducts(): Promise<Product[]> {
    try {
      console.log('🌐 Fetching all products from API');
      const products = await ApiClient.get<Product[]>('/products');
      console.log('✅ Fetched', products?.length || 0, 'products from API');
      return products || [];
    } catch (error: any) {
      console.error('❌ Error fetching products from API:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  /**
   * Get a single product by ID from API
   */
  static async getProductById(productId: string): Promise<Product | null> {
    try {
      console.log('🌐 Fetching product by ID from API:', productId);
      const product = await ApiClient.get<Product>(`/products/${productId}`);
      console.log('✅ Fetched product from API:', product?.products_id);
      return product;
    } catch (error: any) {
      console.error('❌ Error fetching product by ID from API:', error);
      return null;
    }
  }

  /**
   * Get products by category from API
   */
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      console.log('🌐 Fetching products by category from API:', category);
      const products = await ApiClient.get<Product[]>(`/products/category/${category}`);
      console.log('✅ Fetched', products?.length || 0, 'products by category from API');
      return products || [];
    } catch (error: any) {
      console.error('❌ Error fetching products by category from API:', error);
      throw new Error(`Failed to fetch products by category: ${error.message}`);
    }
  }

  /**
   * Create a new product (admin only)
   */
  static async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      console.log('🌐 Creating product via API');
      const product = await ApiClient.post<Product>('/products', productData);
      console.log('✅ Product created via API:', product?.products_id);
      return product;
    } catch (error: any) {
      console.error('❌ Error creating product via API:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  /**
   * Update a product (admin only)
   */
  static async updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
    try {
      console.log('🌐 Updating product via API:', productId);
      const product = await ApiClient.put<Product>(`/products/${productId}`, productData);
      console.log('✅ Product updated via API:', product?.products_id);
      return product;
    } catch (error: any) {
      console.error('❌ Error updating product via API:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  /**
   * Delete a product (admin only)
   */
  static async deleteProduct(productId: string): Promise<void> {
    try {
      console.log('🌐 Deleting product via API:', productId);
      await ApiClient.delete(`/products/${productId}`);
      console.log('✅ Product deleted via API:', productId);
    } catch (error: any) {
      console.error('❌ Error deleting product via API:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }
}
