import { BaseEntity } from './common';
import { User } from './auth';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  CUSTOM_ORDER = 'CUSTOM_ORDER',
  QUOTE_DISCUSSION = 'QUOTE_DISCUSSION',
}

// Base Message interface (entity)
export interface Message extends BaseEntity {
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  attachments: string[];
  quoteRequestId?: string;
  productMentions?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
}

export interface MessageWithUsers {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  attachments: string[];
  quoteRequestId?: string;
  productMentions?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  sender: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role: string;
    lastSeenAt?: Date;
  };
  receiver: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role: string;
    lastSeenAt?: Date;
  };
  quoteRequest?: {
    id: string;
    title: string;
    status: string;
  };
}

export interface Conversation {
  participantId: string;
  participant: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role: string;
    lastSeenAt?: Date;
  };
  lastMessage?: MessageWithUsers;
  unreadCount: number;
  lastActivity: Date;
}

// DTOs
export interface SendMessageRequest {
  receiverId: string;
  content: string;
  type?: MessageType;
  attachments?: string[];
  quoteRequestId?: string;
  productMentions?: Record<string, any>;
}

export interface SendCustomOrderRequest {
  type: 'create_custom_order' | 'respond_custom_order' | 'quote_discussion';
  receiverId: string;
  content: string;
  customOrderData?: {
    title?: string;
    description?: string;
    estimatedPrice?: number;
    customerBudget?: number;
    timeline?: string;
    specifications?: any;
    attachments?: string[];
    referenceProductId?: string;
  };
  quoteRequestId?: string;
  response?: {
    action: 'ACCEPT' | 'REJECT' | 'COUNTER_OFFER';
    finalPrice?: number;
    data?: any;
  };
}

export interface MessageQueryOptions {
  page?: number;
  limit?: number;
  conversationWith?: string;
  type?: MessageType;
  isRead?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}
