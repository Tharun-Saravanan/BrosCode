// DynamoDB Product Service for E-commerce Application
import {
  ScanCommand,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, AWS_CONFIG } from '../config/aws';
import type { Product } from '../types/product';

export class DynamoProductService {
  /**
   * Get all products from DynamoDB (public access for e-commerce site)
   */
  static async getAllProducts(): Promise<Product[]> {
    try {
      console.log('DynamoProductService.getAllProducts called (e-commerce site)');

      const command = new ScanCommand({
        TableName: AWS_CONFIG.dynamoDbTableName,
      });

      const response = await dynamoDbDocClient.send(command);
      const rawProducts = (response.Items || []) as any[];

      // Transform products to match e-commerce interface
      const products: Product[] = rawProducts.map(item => ({
        products_id: item.products_id || item.id, // Handle both field names
        id: item.products_id || item.id, // Keep for backward compatibility
        name: item.name,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
        description: item.description,
        category: item.category,
        sizes: item.sizes || [],
        imageUrl: item.imageUrl,
        images: item.images || [],
        imageKeys: item.imageKeys || [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      // Sort by createdAt descending (newest first)
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log('✅ DynamoProductService.getAllProducts returning', products.length, 'products from DynamoDB');
      return products;
    } catch (error) {
      console.error('❌ Error fetching products from DynamoDB (e-commerce site):', error);
      console.warn('💡 This is expected if Cognito Identity Pool requires authentication');
      console.warn('🔄 E-commerce site will fall back to localStorage');
      throw new Error('Failed to fetch products from DynamoDB');
    }
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(products_id: string): Promise<Product | null> {
    try {
      console.log('DynamoProductService.getProductById called with products_id:', products_id);

      const command = new GetCommand({
        TableName: AWS_CONFIG.dynamoDbTableName,
        Key: { products_id },
      });

      const response = await dynamoDbDocClient.send(command);
      const item = response.Item as any;

      if (!item) {
        console.log('DynamoProductService.getProductById returning: not found');
        return null;
      }

      // Transform product to match e-commerce interface
      const product: Product = {
        products_id: item.products_id || item.id,
        id: item.products_id || item.id, // Keep for backward compatibility
        name: item.name,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
        description: item.description,
        category: item.category,
        sizes: item.sizes || [],
        imageUrl: item.imageUrl,
        images: item.images || [],
        imageKeys: item.imageKeys || [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };

      console.log('DynamoProductService.getProductById returning: found');
      return product;
    } catch (error) {
      console.error('Error fetching product by ID from DynamoDB:', error);
      throw new Error('Failed to fetch product');
    }
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      console.log('DynamoProductService.getProductsByCategory called with category:', category);

      const command = new QueryCommand({
        TableName: AWS_CONFIG.dynamoDbTableName,
        IndexName: 'CategoryIndex',
        KeyConditionExpression: 'category = :category',
        ExpressionAttributeValues: {
          ':category': category,
        },
        ScanIndexForward: false, // Sort by createdAt descending
      });

      const response = await dynamoDbDocClient.send(command);
      const products = (response.Items || []) as Product[];

      console.log('DynamoProductService.getProductsByCategory returning', products.length, 'products');
      return products;
    } catch (error) {
      console.error('Error fetching products by category from DynamoDB:', error);
      throw new Error('Failed to fetch products by category');
    }
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      console.log('DynamoProductService.getFeaturedProducts called with limit:', limit);
      
      const products = await this.getAllProducts();
      const featuredProducts = products.slice(0, limit);
      
      console.log('DynamoProductService.getFeaturedProducts returning', featuredProducts.length, 'products');
      return featuredProducts;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw new Error('Failed to fetch featured products');
    }
  }

  /**
   * Search products by name, description, or category
   */
  static async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      console.log('DynamoProductService.searchProducts called with term:', searchTerm);

      // For now, we'll scan all products and filter client-side
      // In production, consider using Amazon OpenSearch for better search capabilities
      const allProducts = await this.getAllProducts();
      
      const searchTermLower = searchTerm.toLowerCase();
      const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTermLower) ||
        product.description.toLowerCase().includes(searchTermLower) ||
        product.category.toLowerCase().includes(searchTermLower)
      );

      console.log('DynamoProductService.searchProducts returning', filteredProducts.length, 'products');
      return filteredProducts;
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  /**
   * Get products by multiple categories
   */
  static async getProductsByCategories(categories: string[]): Promise<Product[]> {
    try {
      console.log('DynamoProductService.getProductsByCategories called with categories:', categories);

      const allProducts: Product[] = [];
      
      // Fetch products for each category
      for (const category of categories) {
        const categoryProducts = await this.getProductsByCategory(category);
        allProducts.push(...categoryProducts);
      }

      // Remove duplicates and sort by createdAt
      const uniqueProducts = allProducts.filter((product, index, self) =>
        index === self.findIndex(p => p.id === product.id)
      );

      uniqueProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log('DynamoProductService.getProductsByCategories returning', uniqueProducts.length, 'products');
      return uniqueProducts;
    } catch (error) {
      console.error('Error fetching products by categories:', error);
      throw new Error('Failed to fetch products by categories');
    }
  }

  /**
   * Subscribe to product updates (polling-based for now)
   * In production, consider using DynamoDB Streams with Lambda for real-time updates
   */
  static subscribeToProducts(callback: (products: Product[]) => void): () => void {
    let isSubscribed = true;
    
    const pollProducts = async () => {
      if (!isSubscribed) return;
      
      try {
        const products = await this.getAllProducts();
        callback(products);
      } catch (error) {
        console.error('Error polling products:', error);
        // Continue polling even if there's an error
      }
      
      // Poll every 10 seconds (less frequent than admin dashboard)
      if (isSubscribed) {
        setTimeout(pollProducts, 10000);
      }
    };

    // Initial call
    pollProducts();

    // Return unsubscribe function
    return () => {
      isSubscribed = false;
    };
  }

  /**
   * Get product statistics
   */
  static async getProductStats(): Promise<{
    totalProducts: number;
    productsByCategory: Record<string, number>;
    recentProducts: Product[];
  }> {
    try {
      console.log('DynamoProductService.getProductStats called');

      const allProducts = await this.getAllProducts();
      
      // Count products by category
      const productsByCategory: Record<string, number> = {};
      allProducts.forEach(product => {
        productsByCategory[product.category] = (productsByCategory[product.category] || 0) + 1;
      });

      // Get recent products (last 10)
      const recentProducts = allProducts.slice(0, 10);

      const stats = {
        totalProducts: allProducts.length,
        productsByCategory,
        recentProducts,
      };

      console.log('DynamoProductService.getProductStats returning:', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw new Error('Failed to fetch product statistics');
    }
  }

  /**
   * Check if DynamoDB service is available
   */
  static async healthCheck(): Promise<boolean> {
    try {
      console.log('DynamoProductService.healthCheck called');

      const command = new ScanCommand({
        TableName: AWS_CONFIG.dynamoDbTableName,
        Limit: 1, // Only fetch 1 item for health check
      });

      await dynamoDbDocClient.send(command);
      
      console.log('DynamoProductService.healthCheck: ✅ Service is healthy');
      return true;
    } catch (error) {
      console.error('DynamoProductService.healthCheck: ❌ Service is unhealthy:', error);
      return false;
    }
  }

  /**
   * Fallback to localStorage if DynamoDB is unavailable
   */
  static async getAllProductsWithFallback(): Promise<Product[]> {
    try {
      // Try DynamoDB first
      return await this.getAllProducts();
    } catch (error) {
      console.warn('DynamoDB unavailable, falling back to localStorage:', error);

      try {
        const stored = localStorage.getItem('temp_products');
        if (!stored) return [];

        const rawProducts = JSON.parse(stored);
        return rawProducts.map((item: any) => ({
          products_id: item.products_id || item.id, // Handle both field names
          id: item.products_id || item.id, // Keep for backward compatibility
          name: item.name,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
          description: item.description,
          category: item.category,
          sizes: item.sizes || [],
          imageUrl: item.imageUrl,
          images: item.images || [],
          imageKeys: item.imageKeys || [],
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));
      } catch (localError) {
        console.error('Error reading from localStorage:', localError);
        return [];
      }
    }
  }
}
