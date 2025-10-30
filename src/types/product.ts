export interface Product {
  products_id: string;
  id?: string; // Keep for backward compatibility
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl?: string; // Keep for backward compatibility
  images?: string[]; // S3 URLs for multiple images
  imageKeys?: string[]; // S3 keys for image management (admin use)
  createdAt: string;
  updatedAt: string;
}

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export const CATEGORIES = [
  'Sneakers',
  'Boots',
  'Sandals',
  'Formal Shoes',
  'Athletic Shoes',
  'Casual Shoes',
] as const;

// Sizes removed from the product model
