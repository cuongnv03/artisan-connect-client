import { BaseEntity } from './common';
import { User } from './auth';
import { Product } from './product';

export enum QuoteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COUNTER_OFFERED = 'COUNTER_OFFERED',
  EXPIRED = 'EXPIRED',
}

export enum CustomOrderAction {
  CREATE = 'CREATE',
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
  COUNTER_OFFER = 'COUNTER_OFFER',
  ACCEPT_COUNTER = 'ACCEPT_COUNTER',
  UPDATE = 'UPDATE',
  MESSAGE = 'MESSAGE',
}

export interface CustomOrderRequest extends BaseEntity {
  customerId: string;
  artisanId: string;
  title: string;
  description: string;
  referenceProductId?: string;
  specifications?: any;
  attachmentUrls: string[];
  estimatedPrice?: number;
  customerBudget?: number;
  timeline?: string;
  status: QuoteStatus;
  artisanResponse?: any;
  finalPrice?: number;
  negotiationHistory?: any;
  expiresAt?: Date;
}

export interface CustomOrderWithDetails extends CustomOrderRequest {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
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
      rating?: number;
    };
  };
  referenceProduct?: {
    id: string;
    name: string;
    slug?: string;
    images: string[];
    price: number;
    isCustomizable: boolean;
  };
  messages: CustomOrderMessage[];
}

export interface CustomOrderMessage extends BaseEntity {
  senderId: string;
  receiverId: string;
  content: string;
  attachments: string[];
  isRead: boolean;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatarUrl?: string;
  };
}

// DTOs
export interface CreateCustomOrderRequest {
  artisanId: string;
  title: string;
  description: string;
  referenceProductId?: string;
  specifications?: any;
  attachmentUrls?: string[];
  estimatedPrice?: number;
  customerBudget?: number;
  timeline?: string;
  expiresInDays?: number;
}

export interface ArtisanResponseRequest {
  action: 'ACCEPT' | 'REJECT' | 'COUNTER_OFFER';
  finalPrice?: number;
  response?: any;
  expiresInDays?: number;
}

export interface UpdateCustomOrderRequest {
  title?: string;
  description?: string;
  specifications?: any;
  attachmentUrls?: string[];
  estimatedPrice?: number;
  customerBudget?: number;
  timeline?: string;
}

export interface CustomOrderStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  expiredRequests: number;
  averageResponseTime: number;
  conversionRate: number;
}
