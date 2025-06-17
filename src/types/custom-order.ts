import { BaseEntity } from './common';
import { User } from './auth';

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

// Khớp với Prisma schema QuoteRequest
export interface CustomOrderRequest extends BaseEntity {
  customerId: string;
  artisanId: string;
  title: string;
  description: string;
  referenceProductId?: string;
  specifications?: any; // Json
  attachmentUrls: string[];
  estimatedPrice?: number; // Decimal -> number
  customerBudget?: number; // Decimal -> number
  timeline?: string;
  status: QuoteStatus;
  artisanResponse?: any; // Json
  finalPrice?: number; // Decimal -> number
  negotiationHistory?: any; // Json
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

// DTOs khớp với server validators
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

export interface CustomOrderQueryOptions {
  page?: number;
  limit?: number;
  customerId?: string;
  artisanId?: string;
  status?: QuoteStatus | QuoteStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomOrderStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  expiredRequests: number;
  averageResponseTime: number; // hours
  conversionRate: number; // percentage
}
