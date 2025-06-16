import { BaseEntity } from './common';
import { User } from './auth';

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  MENTION = 'MENTION',
  ORDER_UPDATE = 'ORDER_UPDATE',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  QUOTE_REQUEST = 'QUOTE_REQUEST',
  QUOTE_RESPONSE = 'QUOTE_RESPONSE',
  CUSTOM_ORDER = 'CUSTOM_ORDER',
  CUSTOM_ORDER_UPDATE = 'CUSTOM_ORDER_UPDATE',
  MESSAGE = 'MESSAGE',
  DISPUTE = 'DISPUTE',
  RETURN = 'RETURN',
  PRICE_NEGOTIATION = 'PRICE_NEGOTIATION',
  SYSTEM = 'SYSTEM',
}

export interface Notification extends BaseEntity {
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  recipient?: User;
  sender?: User;
}

export interface NotificationQueryOptions {
  page?: number;
  limit?: number;
  isRead?: boolean;
  types?: NotificationType[];
  dateFrom?: Date;
  dateTo?: Date;
}
