import type { Product } from '../types/product';
import { ApiProductService } from './apiProductService';
import { AWS_CONFIG } from '../config/aws';

const PRODUCTS_STORAGE_KEY = 'temp_products';

export class ProductService {
  private static syncSubscriptions: Set<(products: Product[]) => void> = new Set();
  private static lastSyncTime: number = 0;
  private static syncInterval: number | null = null;
  private static isOnline: boolean = navigator.onLine;

  // Initialize service and set up connectivity monitoring
  static initialize() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored');
      this.isOnline = true;
      this.startRealTimeSync();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Connection lost, falling back to localStorage');
      this.isOnline = false;
      this.stopRealTimeSync();
    });

    // Start real-time sync if enabled
    if (AWS_CONFIG.enableRealTimeSync) {
      this.startRealTimeSync();
    }
  }

  // Helper method to get products from localStorage
  private static getProductsFromStorage(): Product[] {
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (!stored) return [];

      const products = JSON.parse(stored);
      // Ensure all prices are numbers (migration for existing data)
      return products.map((product: any) => ({
        ...product,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
      }));
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  // Helper method to save products to localStorage (for caching)
  private static saveProductsToStorage(products: Product[]): void {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      localStorage.setItem('products_last_sync', Date.now().toString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Get all products with smart fallback strategy
  static async getAllProducts(): Promise<Product[]> {
    try {
      console.log('🔍 ProductService.getAllProducts called');

      // Try API first if online
      if (this.isOnline) {
        try {
          console.log('🌐 Attempting to fetch products from API...');
          const products = await ApiProductService.getAllProducts();
          // Cache the results
          this.saveProductsToStorage(products);
          console.log('✅ ProductService.getAllProducts returning', products.length, 'products from API');
          return products;
        } catch (apiError) {
          console.warn('⚠️ API unavailable, falling back to localStorage');
        }
      } else {
        console.log('📱 Offline mode detected, using localStorage');
      }

      // Fallback to localStorage
      const products = this.getProductsFromStorage();
      console.log('ProductService.getAllProducts returning', products.length, 'products from localStorage');
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  // Get products by category
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const products = await this.getAllProducts();
      return products.filter(product => product.category === category);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw new Error('Failed to fetch products by category');
    }
  }

  // Search products
  static async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const products = await this.getAllProducts();
      const lowercaseSearch = searchTerm.toLowerCase();

      return products.filter(product =>
        product.name.toLowerCase().includes(lowercaseSearch) ||
        product.description.toLowerCase().includes(lowercaseSearch) ||
        product.category.toLowerCase().includes(lowercaseSearch)
      );
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  // Enhanced real-time product updates with smart polling
  static subscribeToProducts(callback: (products: Product[]) => void): () => void {
    console.log('ProductService.subscribeToProducts called');

    // Add callback to subscriptions
    this.syncSubscriptions.add(callback);

    // Initial call
    this.getAllProducts().then(callback).catch(error => {
      console.error('Error in initial product fetch:', error);
    });

    // Return unsubscribe function
    return () => {
      this.syncSubscriptions.delete(callback);
      console.log('ProductService subscription removed');
    };
  }

  // Start real-time synchronization
  private static startRealTimeSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    console.log('🔄 Starting real-time sync with interval:', AWS_CONFIG.syncPollingInterval, 'ms');

    this.syncInterval = setInterval(async () => {
      if (this.syncSubscriptions.size === 0) {
        // No active subscriptions, skip sync
        return;
      }

      try {
        const products = await this.getAllProducts();

        // Notify all subscribers
        this.syncSubscriptions.forEach(callback => {
          try {
            callback(products);
          } catch (error) {
            console.error('Error in sync callback:', error);
          }
        });

        this.lastSyncTime = Date.now();
      } catch (error) {
        console.error('Error during real-time sync:', error);
      }
    }, AWS_CONFIG.syncPollingInterval);
  }

  // Stop real-time synchronization
  private static stopRealTimeSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Real-time sync stopped');
    }
  }

  // Get sync status
  static getSyncStatus(): {
    isOnline: boolean;
    lastSyncTime: number;
    activeSubscriptions: number;
    syncEnabled: boolean;
  } {
    return {
      isOnline: this.isOnline,
      lastSyncTime: this.lastSyncTime,
      activeSubscriptions: this.syncSubscriptions.size,
      syncEnabled: AWS_CONFIG.enableRealTimeSync,
    };
  }

  // Get featured products (e.g., best sellers, new arrivals)
  static async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      const products = await this.getAllProducts();
      return products.slice(0, limit);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw new Error('Failed to fetch featured products');
    }
  }

  // Get products with price range filter
  static async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    try {
      const products = await this.getAllProducts();
      return products.filter(product =>
        product.price >= minPrice && product.price <= maxPrice
      );
    } catch (error) {
      console.error('Error fetching products by price range:', error);
      throw new Error('Failed to fetch products by price range');
    }
  }
}
