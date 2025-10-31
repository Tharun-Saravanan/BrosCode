export interface Product {
  products_id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl?: string; // Main image URL for backward compatibility
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

export interface PurchaseItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  category: string;
}

export interface PaymentDetails {
  method: 'card' | 'upi' | 'netbanking' | 'cod';
  transactionId?: string;
  status?: 'SUCCESS' | 'FAILED' | 'PENDING';
  cardNumber?: string;
  upiId?: string;
  bankName?: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber: string;
}

export interface Purchase {
  purchaseId: string;
  userId: string;
  items: PurchaseItem[];
  totalItems: number;
  totalAmount: number;
  paymentDetails: PaymentDetails;
  shippingAddress: ShippingAddress;
  orderStatus: 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  deliveryStatus: 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  estimatedDelivery: string;
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
}
