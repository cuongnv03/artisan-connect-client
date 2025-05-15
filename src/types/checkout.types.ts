import { Address } from './api.types';
import { PaymentMethod } from './order.types';

export interface CheckoutItem {
  productId: string;
  sellerId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CheckoutState {
  items: CheckoutItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  selectedAddress?: Address;
  paymentMethod?: PaymentMethod;
  notes?: string;
  quoteRequestId?: string; // For orders from quote
}
