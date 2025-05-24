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

export interface Conversation {
  participantId: string;
  participant: User;
  lastMessage?: Message;
  unreadCount: number;
  lastMessageAt?: Date;
}

// DTOs
export interface SendMessageRequest {
  receiverId: string;
  content: string;
  type?: MessageType;
  metadata?: Record<string, any>;
}
