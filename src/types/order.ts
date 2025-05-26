import { BaseEntity } from './common';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string; // ISO string
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  primarySeller?: {
    id: string;
    name: string;
    shopName?: string;
  };
}
export interface OrderWithDetails {
  id: string;
  orderNumber: string;
  userId: string;
  addressId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;

  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };

  shippingAddress?: {
    id: string;
    fullName: string;
    phone?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  items: OrderItemWithDetails[];
  statusHistory: OrderStatusHistory[];
  paymentTransactions: PaymentTransaction[];
}

export interface OrderItemWithDetails {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  quantity: number;
  price: number;
  createdAt: string;

  product: {
    id: string;
    name: string;
    slug?: string;
    images: string[];
    isCustomizable: boolean;
  };

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

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  createdBy?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  userId: string;
  paymentMethodId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  reference: string;
  externalReference?: string;
  failureReason?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}
