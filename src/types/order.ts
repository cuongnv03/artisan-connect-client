import { BaseEntity } from './common';
import { User } from './auth';
import { Product } from './product';
import { Address } from './user';

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
  customer?: User;
  items: OrderItem[];
  shippingAddress?: Address;
}

export interface OrderItem extends BaseEntity {
  orderId: string;
  productId: string;
  sellerId: string;
  quantity: number;
  price: number;
  product: Product;
  seller: User;
}

export interface CartItem extends BaseEntity {
  userId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  estimatedShipping: number;
  estimatedTotal: number;
}

export interface CartValidation {
  valid: boolean;
  issues?: Array<{
    type: 'out_of_stock' | 'price_changed' | 'unavailable';
    productId: string;
    message: string;
  }>;
}

// Quote types
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
