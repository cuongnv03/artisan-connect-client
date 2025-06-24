import { BaseEntity } from './common';
import { User } from './auth';
import { Product } from './product';

export enum NegotiationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COUNTER_OFFERED = 'COUNTER_OFFERED',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED',
}

export enum NegotiationAction {
  PROPOSE = 'PROPOSE',
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
  COUNTER = 'COUNTER',
}

export interface PriceNegotiation extends BaseEntity {
  productId: string;
  variantId?: string | null; // NEW: Support for variants
  customerId: string;
  artisanId: string;
  originalPrice: number;
  proposedPrice: number;
  finalPrice?: number;
  quantity: number;
  customerReason?: string;
  status: NegotiationStatus;
  artisanResponse?: string;
  negotiationHistory?: any;
  expiresAt?: Date;
}

export interface PriceNegotiationWithDetails extends PriceNegotiation {
  product: {
    id: string;
    name: string;
    slug?: string;
    images: string[];
    price: number;
    discountPrice?: number;
    quantity: number;
    allowNegotiation: boolean;
    status: string;
    hasVariants: boolean; // NEW
    seller: {
      id: string;
      firstName: string;
      lastName: string;
      username: string;
      avatarUrl?: string;
      artisanProfile?: {
        shopName: string;
        isVerified: boolean;
      };
    };
  };
  variant?: {
    // NEW: Variant details if negotiating for a variant
    id: string;
    name?: string;
    price: number;
    discountPrice?: number;
    quantity: number;
    images: string[];
    attributes: Record<string, any>;
    isActive: boolean;
  } | null;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatarUrl?: string;
    role: string; // NEW: To identify if customer is also an artisan
  };
  artisan: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatarUrl?: string;
    artisanProfile?: {
      shopName: string;
      isVerified: boolean;
    };
  };
}

export interface NegotiationSummary {
  id: string;
  productName: string;
  productImages: string[];
  variantId?: string | null; // NEW
  variantName?: string | null; // NEW
  variantAttributes?: Record<string, any> | null; // NEW
  originalPrice: number;
  proposedPrice: number;
  finalPrice?: number;
  quantity: number;
  status: NegotiationStatus;
  createdAt: Date;
  expiresAt?: Date;
  customer?: {
    id: string;
    name: string;
    username: string;
    role: string; // NEW
  };
  artisan?: {
    id: string;
    name: string;
    shopName?: string;
  };
}

// DTOs
export interface CreateNegotiationRequest {
  productId: string;
  variantId?: string; // NEW: Optional variant ID
  proposedPrice: number;
  quantity?: number;
  customerReason?: string;
  expiresInDays?: number;
}

export interface RespondToNegotiationRequest {
  action: 'ACCEPT' | 'REJECT' | 'COUNTER';
  counterPrice?: number;
  artisanResponse?: string;
}

export interface CheckExistingNegotiationQuery {
  productId: string;
  variantId?: string; // NEW
}

export interface NegotiationStats {
  totalNegotiations: number;
  pendingNegotiations: number;
  acceptedNegotiations: number;
  rejectedNegotiations: number;
  expiredNegotiations: number;
  averageDiscount: number;
  successRate: number;
}
