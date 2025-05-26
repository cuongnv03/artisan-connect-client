import { User } from './auth';
import { BaseEntity } from './common';
import { Product } from './product';

export enum QuoteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COUNTER_OFFERED = 'COUNTER_OFFERED',
  EXPIRED = 'EXPIRED',
}

export interface QuoteRequest extends BaseEntity {
  productId: string;
  customerId: string;
  artisanId: string;
  requestedPrice?: number;
  specifications?: string;
  status: QuoteStatus;
  counterOffer?: number;
  finalPrice?: number;
  customerMessage?: string;
  artisanMessage?: string;
  expiresAt?: Date;
  product: Product;
  customer: User;
  artisan: User;
}

export interface QuoteStats {
  totalQuotes: number;
  pendingQuotes: number;
  acceptedQuotes: number;
  rejectedQuotes: number;
  expiredQuotes: number;
  averageNegotiationTime: number;
  conversionRate: number;
}
