export interface Product {
  products_id: string;
  id?: string; // Keep for backward compatibility
  name: string;
  price: number;
  description: string;
  imageUrl?: string; // Keep for backward compatibility
  images?: string[]; // S3 URLs for multiple images
  imageKeys?: string[]; // S3 keys for image management (admin use)
  category?: string; // Product category
  createdAt: string;
  updatedAt: string;
}

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

// Categories removed

