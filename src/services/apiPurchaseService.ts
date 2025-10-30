import { ApiClient } from './apiClient';

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
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  cvv?: string;
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

export interface PurchaseRequest {
  items: PurchaseItem[];
  totalAmount: number;
  paymentDetails: PaymentDetails;
  shippingAddress: ShippingAddress;
}

export interface Purchase {
  purchaseId: string;
  userId: string;
  items: PurchaseItem[];
  totalItems: number;
  totalAmount: number;
  paymentDetails: {
    method: string;
    transactionId?: string;
    status?: string;
    cardNumber?: string;
    upiId?: string;
    bankName?: string;
  };
  shippingAddress: ShippingAddress;
  orderStatus: string;
  deliveryStatus: string;
  estimatedDelivery: string;
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
}

export const ApiPurchaseService = {
  // Create a new purchase
  async createPurchase(userId: string, purchaseData: PurchaseRequest): Promise<any> {
    return await ApiClient.post(`/purchases/${userId}`, purchaseData);
  },

  // Get purchase history for a user
  async getPurchaseHistory(userId: string): Promise<any> {
    return await ApiClient.get(`/purchases/${userId}`);
  },

  // Get a specific purchase by ID
  async getPurchase(purchaseId: string): Promise<any> {
    return await ApiClient.get(`/purchases/order/${purchaseId}`);
  },
};
