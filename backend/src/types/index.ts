export interface Product {
  products_id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  sizes: string[];
  images?: string[];
  imageKeys?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  size: string;
  quantity: number;
  category: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface LikedProduct {
  userId: string;
  productId: string;
  productName: string;
  addedAt: string;
}

export interface LikedProductsList {
  userId: string;
  products: Array<{
    productId: string;
    productName: string;
    addedAt: string;
  }>;
  totalLiked: number;
  createdAt: string;
  updatedAt: string;
}

export interface APIResponse<T = any> {
  statusCode: number;
  body: string;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Credentials': string;
    'Access-Control-Allow-Headers': string;
  };
}

export interface ErrorResponse {
  message: string;
  error?: string;
}

export interface SuccessResponse<T = any> {
  message: string;
  data?: T;
}
