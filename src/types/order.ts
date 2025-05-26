import { BaseEntity } from './common';
import { User } from './auth';
import { Address } from './user';
import { CartItem, CartSummary } from './cart';

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

export interface Order extends BaseEntity {
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
  estimatedDelivery?: Date;
  deliveredAt?: Date;
}

export interface OrderWithDetails extends Order {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  shippingAddress?: Address;
  items: OrderItemWithDetails[];
  statusHistory: OrderStatusHistory[];
  paymentTransactions: PaymentTransaction[];
}

export interface OrderItem extends BaseEntity {
  orderId: string;
  productId: string;
  sellerId: string;
  quantity: number;
  price: number;
}

export interface OrderItemWithDetails extends OrderItem {
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

export interface OrderStatusHistory extends BaseEntity {
  orderId: string;
  status: OrderStatus;
  note?: string;
  createdBy?: string;
}

export interface PaymentTransaction extends BaseEntity {
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
  processedAt?: Date;
}

// DTOs
export interface CreateOrderFromCartRequest {
  addressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CreateOrderFromQuoteRequest {
  quoteRequestId: string;
  addressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

export interface ProcessPaymentRequest {
  paymentMethodId?: string;
  paymentReference?: string;
  externalReference?: string;
}
