import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Message, Conversation } from '../types/message.types';
import { MessageService } from '../services/message.service';
import { useAuth } from './AuthContext';

// Define context types
interface MessageState {
  conversations: Conversation[];
  currentConversation: {
    participantId: string;
    messages: Message[];
    hasMore: boolean;
    page: number;
    isLoading: boolean;
  };
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

type MessageAction =
  | { type: 'FETCH_CONVERSATIONS_REQUEST' }
  | { type: 'FETCH_CONVERSATIONS_SUCCESS'; payload: Conversation[] }
  | { type: 'FETCH_CONVERSATIONS_FAILURE'; payload: string }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: string }
  | { type: 'FETCH_MESSAGES_REQUEST' }
  | {
      type: 'FETCH_MESSAGES_SUCCESS';
      payload: { messages: Message[]; hasMore: boolean };
    }
  | { type: 'FETCH_MESSAGES_FAILURE'; payload: string }
  | { type: 'SEND_MESSAGE_REQUEST' }
  | { type: 'SEND_MESSAGE_SUCCESS'; payload: Message }
  | { type: 'SEND_MESSAGE_FAILURE'; payload: string }
  | { type: 'LOAD_MORE_MESSAGES' }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'MARK_CONVERSATION_READ'; payload: string }
  | { type: 'RESET_CURRENT_CONVERSATION' };

interface MessageContextProps {
  state: MessageState;
  fetchConversations: () => Promise<void>;
  setCurrentConversation: (participantId: string) => void;
  fetchMessages: (participantId: string, reset?: boolean) => Promise<void>;
  sendMessage: (
    recipientId: string,
    content: string,
    attachments?: string[],
  ) => Promise<void>;
  markConversationAsRead: (participantId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  resetCurrentConversation: () => void;
  fetchUnreadCount: () => Promise<void>;
}

// Initial state
const initialState: MessageState = {
  conversations: [],
  currentConversation: {
    participantId: '',
    messages: [],
    hasMore: false,
    page: 1,
    isLoading: false,
  },
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Create the context
const MessageContext = createContext<MessageContextProps | undefined>(
  undefined,
);

// Reducer
const messageReducer = (
  state: MessageState,
  action: MessageAction,
): MessageState => {
  switch (action.type) {
    case 'FETCH_CONVERSATIONS_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'FETCH_CONVERSATIONS_SUCCESS':
      return {
        ...state,
        conversations: action.payload,
        isLoading: false,
      };
    case 'FETCH_CONVERSATIONS_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'SET_CURRENT_CONVERSATION':
      return {
        ...state,
        currentConversation: {
          ...state.currentConversation,
          participantId: action.payload,
          messages: [],
          page: 1,
          hasMore: false,
        },
      };
    case 'FETCH_MESSAGES_REQUEST':
      return {
        ...state,
        currentConversation: {
          ...state.currentConversation,
          isLoading: true,
        },
      };
    case 'FETCH_MESSAGES_SUCCESS':
      return {
        ...state,
        currentConversation: {
          ...state.currentConversation,
          messages: [
            ...action.payload.messages,
            ...state.currentConversation.messages,
          ],
          hasMore: action.payload.hasMore,
          isLoading: false,
        },
      };
    case 'FETCH_MESSAGES_FAILURE':
      return {
        ...state,
        currentConversation: {
          ...state.currentConversation,
          isLoading: false,
        },
        error: action.payload,
      };
    case 'SEND_MESSAGE_SUCCESS':
      return {
        ...state,
        currentConversation: {
          ...state.currentConversation,
          messages: [action.payload, ...state.currentConversation.messages],
        },
      };
    case 'LOAD_MORE_MESSAGES':
      return {
        ...state,
        currentConversation: {
          ...state.currentConversation,
          page: state.currentConversation.page + 1,
        },
      };
    case 'SET_UNREAD_COUNT':
      return {
        ...state,
        unreadCount: action.payload,
      };
    case 'MARK_CONVERSATION_READ': {
      // Update unread count in the conversations list
      const updatedConversations = state.conversations.map((conversation) => {
        if (conversation.participantId === action.payload) {
          return {
            ...conversation,
            unreadCount: 0,
          };
        }
        return conversation;
      });

      // Calculate the new total unread count
      const newUnreadCount = updatedConversations.reduce(
        (sum, conv) => sum + conv.unreadCount,
        0,
      );

      return {
        ...state,
        conversations: updatedConversations,
        unreadCount: newUnreadCount,
      };
    }
    case 'RESET_CURRENT_CONVERSATION':
      return {
        ...state,
        currentConversation: {
          participantId: '',
          messages: [],
          hasMore: false,
          page: 1,
          isLoading: false,
        },
      };
    default:
      return state;
  }
};

// Provider component
export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);
  const { state: authState } = useAuth();

  // Fetch unread count on mount if user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchUnreadCount();
    }
  }, [authState.isAuthenticated]);

  // Fetch conversations
  const fetchConversations = async () => {
    dispatch({ type: 'FETCH_CONVERSATIONS_REQUEST' });
    try {
      const conversations = await MessageService.getConversations();
      dispatch({ type: 'FETCH_CONVERSATIONS_SUCCESS', payload: conversations });
    } catch (error: any) {
      dispatch({
        type: 'FETCH_CONVERSATIONS_FAILURE',
        payload: error.message || 'Failed to fetch conversations',
      });
    }
  };

  // Set current conversation
  const setCurrentConversation = (participantId: string) => {
    dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: participantId });
  };

  // Fetch messages for a conversation
  const fetchMessages = async (
    participantId: string,
    reset: boolean = false,
  ) => {
    if (reset) {
      dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: participantId });
    }

    dispatch({ type: 'FETCH_MESSAGES_REQUEST' });
    try {
      const response = await MessageService.getMessages(participantId, {
        page: reset ? 1 : state.currentConversation.page,
        limit: 20,
      });

      dispatch({
        type: 'FETCH_MESSAGES_SUCCESS',
        payload: {
          messages: response.data,
          hasMore: response.data.length >= 20,
        },
      });

      // Mark messages as read when fetched
      if (response.data.length > 0) {
        await markConversationAsRead(participantId);
      }
    } catch (error: any) {
      dispatch({
        type: 'FETCH_MESSAGES_FAILURE',
        payload: error.message || 'Failed to fetch messages',
      });
    }
  };

  // Send a message
  const sendMessage = async (
    recipientId: string,
    content: string,
    attachments: string[] = [],
  ) => {
    dispatch({ type: 'SEND_MESSAGE_REQUEST' });
    try {
      const message = await MessageService.sendMessage({
        recipientId,
        content,
        attachments,
      });
      dispatch({ type: 'SEND_MESSAGE_SUCCESS', payload: message });

      // Refresh conversations to update the list with the latest message
      fetchConversations();

      return message;
    } catch (error: any) {
      dispatch({
        type: 'SEND_MESSAGE_FAILURE',
        payload: error.message || 'Failed to send message',
      });
      throw error;
    }
  };

  // Mark conversation as read
  const markConversationAsRead = async (participantId: string) => {
    try {
      await MessageService.markAsRead(participantId);
      dispatch({ type: 'MARK_CONVERSATION_READ', payload: participantId });
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
    }
  };

  // Load more messages
  const loadMoreMessages = async () => {
    if (
      state.currentConversation.isLoading ||
      !state.currentConversation.hasMore
    )
      return;

    dispatch({ type: 'LOAD_MORE_MESSAGES' });
    await fetchMessages(state.currentConversation.participantId);
  };

  // Reset current conversation
  const resetCurrentConversation = () => {
    dispatch({ type: 'RESET_CURRENT_CONVERSATION' });
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const count = await MessageService.getUnreadCount();
      dispatch({ type: 'SET_UNREAD_COUNT', payload: count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  return (
    <MessageContext.Provider
      value={{
        state,
        fetchConversations,
        setCurrentConversation,
        fetchMessages,
        sendMessage,
        markConversationAsRead,
        loadMoreMessages,
        resetCurrentConversation,
        fetchUnreadCount,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

// Custom hook to use the message context
export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};
