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
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatarUrl?: string;
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

export interface NegotiationStats {
  totalNegotiations: number;
  pendingNegotiations: number;
  acceptedNegotiations: number;
  rejectedNegotiations: number;
  expiredNegotiations: number;
  averageDiscount: number;
  successRate: number;
}
