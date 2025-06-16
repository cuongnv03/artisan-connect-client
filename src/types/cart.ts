import { BaseEntity } from './common';

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: number; // Converted from Decimal
  negotiationId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  product?: ProductInCart;
  variant?: ProductVariantInCart;
  negotiation?: NegotiationInCart;
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

export interface ProductVariantInCart {
  id: string;
  sku: string;
  name?: string;
  price: number;
  discountPrice?: number;
  images: string[];
  attributes: Array<{
    key: string;
    name: string;
    value: string;
  }>;
}

export interface NegotiationInCart {
  id: string;
  originalPrice: number;
  finalPrice: number;
  status: string;
  expiresAt?: Date | null;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  total: number;
  groupedBySeller: SellerCartGroup[];
  hasNegotiatedItems: boolean;
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
  negotiationIssues?: Array<{
    type: 'NEGOTIATION_EXPIRED' | 'NEGOTIATION_INVALID' | 'NEGOTIATION_USED';
    negotiationId: string;
    productName: string;
    message: string;
  }>;
}

// DTOs
export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  negotiationId?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
