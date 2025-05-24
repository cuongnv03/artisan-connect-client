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
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM',
}

export interface Notification extends BaseEntity {
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  recipient?: User;
  sender?: User;
}
