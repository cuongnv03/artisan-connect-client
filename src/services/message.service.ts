import api from './api';
import {
  Message,
  Conversation,
  MessageQueryOptions,
  CreateMessageDto,
  PaginatedMessages,
  ConversationParticipants,
} from '../types/message.types';

export const MessageService = {
  // Get all conversations
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/messages/conversations');
    return response.data.data;
  },

  // Get messages between current user and another user
  getMessages: async (
    participantId: string,
    options: MessageQueryOptions = {},
  ): Promise<PaginatedMessages> => {
    const response = await api.get(`/messages/${participantId}`, {
      params: options,
    });
    return response.data.data;
  },

  // Send a message
  sendMessage: async (data: CreateMessageDto): Promise<Message> => {
    const response = await api.post('/messages', data);
    return response.data.data;
  },

  // Mark messages as read
  markAsRead: async (participantId: string): Promise<void> => {
    await api.patch(`/messages/${participantId}/read`);
  },

  // Delete a message
  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/messages/${messageId}`);
  },

  // Get conversation participants
  getConversationParticipants: async (
    participantId: string,
  ): Promise<ConversationParticipants> => {
    const response = await api.get(`/messages/${participantId}/participants`);
    return response.data.data;
  },

  // Get unread messages count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/messages/unread/count');
    return response.data.data.count;
  },
};
