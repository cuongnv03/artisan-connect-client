import { BaseEntity } from './common';

// ENUMS
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

export enum PaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  // DEBIT_CARD = 'DEBIT_CARD',
  // BANK_TRANSFER = 'BANK_TRANSFER',
  // DIGITAL_WALLET = 'DIGITAL_WALLET',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

export enum DeliveryStatus {
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  RETURNED = 'RETURNED',
}

// DISPUTE ENUMS
export enum DisputeType {
  PRODUCT_NOT_RECEIVED = 'PRODUCT_NOT_RECEIVED',
  PRODUCT_DAMAGED = 'PRODUCT_DAMAGED',
  PRODUCT_NOT_AS_DESCRIBED = 'PRODUCT_NOT_AS_DESCRIBED',
  DELIVERY_ISSUE = 'DELIVERY_ISSUE',
  SELLER_ISSUE = 'SELLER_ISSUE',
  OTHER = 'OTHER',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// RETURN ENUMS
export enum ReturnReason {
  DEFECTIVE = 'DEFECTIVE',
  NOT_AS_DESCRIBED = 'NOT_AS_DESCRIBED',
  WRONG_ITEM = 'WRONG_ITEM',
  DAMAGED_IN_SHIPPING = 'DAMAGED_IN_SHIPPING',
  CHANGED_MIND = 'CHANGED_MIND',
  OTHER = 'OTHER',
}

export enum ReturnStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PRODUCT_RETURNED = 'PRODUCT_RETURNED',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
}

// MAIN INTERFACES
export interface Order extends BaseEntity {
  orderNumber: string;
  userId: string;
  addressId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  taxAmount?: number;
  discountAmount?: number;
  paymentMethod?: PaymentMethodType;
  paymentReference?: string;
  deliveryStatus: DeliveryStatus;
  expectedDelivery?: Date;
  actualDelivery?: Date;
  isDeliveryLate: boolean;
  deliveryNotes?: string;
  trackingNumber?: string;
  canReturn: boolean;
  returnDeadline?: Date;
  hasDispute: boolean;
  isRated: boolean;
  buyerSatisfaction?: number;
  notes?: string;
  statusHistory?: any;
}

export interface OrderWithDetails extends Order {
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
  paymentTransactions: PaymentTransaction[];
  disputes: OrderDispute[];
  returns: OrderReturn[];
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: Date;
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

export interface OrderItemWithDetails {
  id: string;
  orderId: string;
  productId?: string;
  variantId?: string;
  sellerId: string;
  quantity: number;
  price: number;
  isCustomOrder: boolean;
  customTitle?: string;
  customDescription?: string;
  product?: {
    id: string;
    name: string;
    slug?: string;
    images: string[];
  };
  variant?: {
    id: string;
    sku: string;
    name?: string;
    attributes: Record<string, any>;
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
  customOrder?: {
    id: string;
    title: string;
    description: string;
  };
}

export interface PaymentTransaction extends BaseEntity {
  orderId: string;
  userId: string;
  paymentMethodId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodType: PaymentMethodType;
  reference: string;
  externalReference?: string;
  failureReason?: string;
  metadata?: any;
  processedAt?: Date;
}

// DISPUTE INTERFACES
export interface OrderDispute extends BaseEntity {
  orderId: string;
  complainantId: string;
  type: DisputeType;
  reason: string;
  evidence: string[];
  status: DisputeStatus;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface OrderDisputeWithDetails extends OrderDispute {
  order: {
    id: string;
    orderNumber: string;
  };
  complainant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// RETURN INTERFACES
export interface OrderReturn extends BaseEntity {
  orderId: string;
  requesterId: string;
  reason: ReturnReason;
  description?: string;
  evidence: string[];
  status: ReturnStatus;
  approvedBy?: string;
  refundAmount?: number;
  refundReason?: string;
}

export interface OrderReturnWithDetails extends OrderReturn {
  order: {
    id: string;
    orderNumber: string;
  };
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// DTOs
export interface CreateOrderFromCartRequest {
  addressId: string;
  paymentMethod: PaymentMethodType;
  notes?: string;
}

export interface CreateOrderFromQuoteRequest {
  quoteRequestId: string;
  addressId: string;
  paymentMethod: PaymentMethodType;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
  estimatedDelivery?: Date;
}

export interface ProcessPaymentRequest {
  paymentMethodId?: string;
  paymentReference?: string;
  externalReference?: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

// DISPUTE DTOs
export interface CreateDisputeRequest {
  orderId: string;
  type: DisputeType;
  reason: string;
  evidence?: string[];
}

export interface UpdateDisputeRequest {
  status: DisputeStatus;
  resolution?: string;
}

// RETURN DTOs
export interface CreateReturnRequest {
  orderId: string;
  reason: ReturnReason;
  description?: string;
  evidence?: string[];
}

export interface UpdateReturnRequest {
  status: ReturnStatus;
  refundAmount?: number;
  refundReason?: string;
}

// QUERY INTERFACES
export interface GetOrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus | PaymentStatus[];
  deliveryStatus?: DeliveryStatus | DeliveryStatus[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetDisputesQuery {
  page?: number;
  limit?: number;
  status?: DisputeStatus;
  type?: DisputeType;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetReturnsQuery {
  page?: number;
  limit?: number;
  status?: ReturnStatus;
  reason?: ReturnReason;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetOrderStatsQuery {
  userId?: string;
  sellerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// STATUS HISTORY - CẬP NHẬT
export interface OrderStatusHistory {
  status: OrderStatus;
  note?: string;
  timestamp: string;
  updatedBy?: string;
}
