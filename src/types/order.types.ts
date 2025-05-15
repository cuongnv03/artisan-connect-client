import { Address } from './api.types';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  quantity: number;
  price: number;
  productData: any; // Snapshot of product at time of order
  createdAt: Date;
  product?: {
    name: string;
    images: string[];
  };
  seller?: {
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  createdBy?: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressId?: string;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: boolean;
  paymentIntentId?: string;
  quoteRequestId?: string;
  notes?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  shippingAddress?: Address;
  statusHistory?: OrderStatusHistory[];
  customer?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface OrderQueryOptions {
  status?: OrderStatus | OrderStatus[];
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'totalAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateOrderFromCartDto {
  addressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CreateOrderFromQuoteDto {
  quoteRequestId: string;
  addressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  note?: string;
}

export interface UpdateShippingInfoDto {
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

export interface CancelOrderDto {
  reason: string;
}
