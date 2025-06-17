import { BaseEntity } from './common';
import { User } from './auth';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  CUSTOM_ORDER = 'CUSTOM_ORDER',
  QUOTE_DISCUSSION = 'QUOTE_DISCUSSION',
}

// Base Message interface (khớp với Prisma schema)
export interface Message extends BaseEntity {
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  attachments: string[];
  quoteRequestId?: string;
  productMentions?: Record<string, any>; // Đổi từ metadata thành productMentions
  isRead: boolean;
  readAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
}

export interface MessageWithUsers extends Message {
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
  productMentions?: Record<string, any>; // Đổi từ metadata
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
  sortOrder?: 'asc' | 'desc';
}

// Custom Order types for messaging
export interface CustomOrderProposal {
  productName: string;
  description: string;
  estimatedPrice: number;
  timeline: string;
  specifications?: Record<string, any>;
  attachments?: string[];
  deadline?: Date;
}

export interface CustomOrderResponse {
  accepted: boolean;
  message: string;
  canProceed: boolean;
  requiresMoreInfo?: boolean;
  additionalQuestions?: string[];
  counterOffer?: {
    price: number;
    duration: string;
  };
}
