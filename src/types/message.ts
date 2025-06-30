import { BaseEntity } from './common';
import { User } from './auth';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  CUSTOM_ORDER = 'CUSTOM_ORDER',
}

// Base Message interface (matches Prisma schema)
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
  productMentions?: Record<string, any>;
}

// ENHANCED: Complete custom order flow in chat
export interface SendCustomOrderRequest {
  type:
    | 'create_custom_order'
    | 'respond_custom_order'
    | 'customer_counter_offer'
    | 'customer_accept_offer'
    | 'customer_reject_offer'
    | 'quote_discussion'
    | 'send_existing_custom_order';
  receiverId: string;
  content: string;

  // For create_custom_order
  customOrderData?: {
    title: string;
    description: string;
    estimatedPrice?: number;
    customerBudget?: number;
    timeline?: string;
    specifications?: any;
    attachments?: string[];
    referenceProductId?: string;
    expiresInDays?: number;
  };

  // For respond_custom_order & other quote actions
  quoteRequestId?: string;

  // For respond_custom_order
  response?: {
    action: 'ACCEPT' | 'REJECT' | 'COUNTER_OFFER';
    finalPrice?: number;
    data?: any;
    expiresInDays?: number;
  };

  // For customer_counter_offer
  counterOffer?: {
    finalPrice: number;
    timeline?: string;
    data?: any;
    expiresInDays?: number;
  };

  // For customer_reject_offer
  rejectOffer?: {
    reason?: string;
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

// ENHANCED: Custom Order types for messaging with complete data structure
export interface CustomOrderProposal {
  artisanId?: string; // Optional for display
  title: string;
  description: string;
  referenceProductId?: string;
  specifications?: Record<string, any>;
  attachmentUrls?: string[];
  estimatedPrice?: number;
  customerBudget?: number;
  timeline?: string;
  expiresInDays?: number;

  // Additional fields for enhanced display
  materials?: string[];
  dimensions?: string;
  colors?: string[];
  style?: string;
  features?: string;
  inspiration?: string;
  usage?: string;
  occasion?: string;
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
