import { BaseEntity } from './common';

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  product?: ProductInCart;
}

export interface ProductInCart {
  id: string;
  name: string;
  slug?: string;
  price: number;
  discountPrice?: number;
  images: string[];
  status: string;
  quantity: number; // Available stock
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    artisanProfile?: {
      shopName: string;
      isVerified: boolean;
    };
  };
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  total: number;
  groupedBySeller: SellerCartGroup[];
}

export interface SellerCartGroup {
  sellerId: string;
  sellerInfo: {
    id: string;
    name: string;
    username: string;
    shopName?: string;
    isVerified: boolean;
  };
  items: CartItem[];
  subtotal: number;
  total: number;
}

export interface CartValidation {
  isValid: boolean;
  errors: Array<{
    type: 'OUT_OF_STOCK' | 'PRODUCT_UNAVAILABLE' | 'INVALID_QUANTITY';
    productId: string;
    productName: string;
    message: string;
  }>;
  warnings: Array<{
    type: 'LOW_STOCK' | 'PRICE_CHANGED';
    productId: string;
    productName: string;
    message: string;
  }>;
}
