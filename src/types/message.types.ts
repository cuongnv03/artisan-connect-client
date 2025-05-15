import { User } from './user.types';

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  attachments: string[];
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  sender?: User;
  recipient?: User;
}

export interface Conversation {
  participantId: string;
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatarUrl?: string | null;
  };
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

export interface MessageQueryOptions {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface CreateMessageDto {
  recipientId: string;
  content: string;
  attachments?: string[];
}

export interface PaginatedMessages {
  data: Message[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ConversationParticipants {
  sender: User;
  recipient: User;
}
