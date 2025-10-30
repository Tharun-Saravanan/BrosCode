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

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  loading: boolean;
  error: string | null;
}

export interface AddToCartPayload {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  size: string;
  quantity?: number;
  category: string;
}

export interface UpdateCartItemPayload {
  id: string;
  quantity: number;
}
