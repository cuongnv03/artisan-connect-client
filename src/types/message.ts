import { BaseEntity } from './common';
import { User } from './auth';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  CUSTOM_ORDER = 'CUSTOM_ORDER',
  QUOTE_DISCUSSION = 'QUOTE_DISCUSSION',
}

export interface Message extends BaseEntity {
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  metadata?: Record<string, any>;
  isRead: boolean;
  sender: User;
  receiver: User;
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
  lastMessage?: Message;
  unreadCount: number;
  lastActivity: Date;
  lastMessageAt?: Date; // For compatibility
}

// DTOs
export interface SendMessageRequest {
  receiverId: string;
  content: string;
  type?: MessageType;
  metadata?: Record<string, any>;
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
