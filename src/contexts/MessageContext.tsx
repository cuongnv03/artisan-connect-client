import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { messageService } from '../services/message.service';
import { useSocketContext } from './SocketContext';
import { useAuth } from './AuthContext';
import { Message } from '../types/message';

interface MessageState {
  unreadCount: number;
  loading: boolean;
}

type MessageAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'INCREMENT_UNREAD' }
  | { type: 'DECREMENT_UNREAD'; payload?: number }
  | { type: 'RESET_UNREAD' };

interface MessageContextType {
  state: MessageState;
  refreshUnreadCount: () => Promise<void>;
  markConversationAsRead: (userId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

const initialState: MessageState = {
  unreadCount: 0,
  loading: false,
};

function messageReducer(
  state: MessageState,
  action: MessageAction,
): MessageState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload, loading: false };
    case 'INCREMENT_UNREAD':
      return { ...state, unreadCount: state.unreadCount + 1 };
    case 'DECREMENT_UNREAD':
      const decrement = action.payload || 1;
      return {
        ...state,
        unreadCount: Math.max(0, state.unreadCount - decrement),
      };
    case 'RESET_UNREAD':
      return { ...state, unreadCount: 0 };
    default:
      return state;
  }
}

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);
  const { socket } = useSocketContext();
  const { state: authState } = useAuth();

  // Load initial unread count
  useEffect(() => {
    if (authState.isAuthenticated) {
      refreshUnreadCount();
    }
  }, [authState.isAuthenticated]);

  // Handle real-time updates
  useEffect(() => {
    if (!socket || !authState.isAuthenticated) return;

    const handleNewMessage = (message: Message) => {
      // Only increment if this user is the receiver
      if (message.receiverId === authState.user?.id) {
        dispatch({ type: 'INCREMENT_UNREAD' });
      }
    };

    const handleConversationRead = (data: {
      userId: string;
      readCount: number;
    }) => {
      // Only decrement if this user read the messages
      if (data.userId === authState.user?.id) {
        dispatch({ type: 'DECREMENT_UNREAD', payload: data.readCount });
      }
    };

    const handleMessageRead = (data: { messageId: string; readBy: string }) => {
      // If someone else read our message, we don't need to update unread count
      // This is for read receipts, not unread count
    };

    socket.on('new-message', handleNewMessage);
    socket.on('conversation-read', handleConversationRead);
    socket.on('message-read-update', handleMessageRead);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('conversation-read', handleConversationRead);
      socket.off('message-read-update', handleMessageRead);
    };
  }, [socket, authState.isAuthenticated, authState.user?.id]);

  const refreshUnreadCount = async () => {
    if (!authState.isAuthenticated) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await messageService.getUnreadCount();
      dispatch({ type: 'SET_UNREAD_COUNT', payload: result.unreadCount });
    } catch (error) {
      console.error('Error loading unread count:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const markConversationAsRead = async (userId: string) => {
    try {
      const result = await messageService.markConversationAsRead(userId);
      dispatch({ type: 'DECREMENT_UNREAD', payload: result.markedCount });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      // This would need a new API endpoint to mark all conversations as read
      // For now, we'll reset the count
      dispatch({ type: 'RESET_UNREAD' });
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  };

  const value = {
    state,
    refreshUnreadCount,
    markConversationAsRead,
    markAllAsRead,
  };

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
};

export function useMessage() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
}
