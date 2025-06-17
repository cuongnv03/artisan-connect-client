import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Notification } from '../types/notification';
import { notificationService } from '../services/notification.service';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from './AuthContext';
import { formatNotificationDisplay } from '../utils/notificationFormatter';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

interface NotificationContextType {
  state: NotificationState;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
};

function notificationReducer(
  state: NotificationState,
  action: NotificationAction,
): NotificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload, loading: false };
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: action.payload.isRead
          ? state.unreadCount
          : state.unreadCount + 1,
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map((notif) =>
          notif.id === action.payload ? { ...notif, isRead: true } : notif,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map((notif) => ({
          ...notif,
          isRead: true,
        })),
        unreadCount: 0,
      };
    case 'REMOVE_NOTIFICATION':
      const removedNotif = state.notifications.find(
        (n) => n.id === action.payload,
      );
      return {
        ...state,
        notifications: state.notifications.filter(
          (notif) => notif.id !== action.payload,
        ),
        unreadCount:
          removedNotif && !removedNotif.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      };
    default:
      return state;
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const socket = useSocket();
  const { state: authState } = useAuth();

  useEffect(() => {
    if (authState.isInitialized && authState.isAuthenticated) {
      refreshNotifications();
      loadUnreadCount();
    }
  }, [authState.isInitialized, authState.isAuthenticated]);

  // Clear notifications when user logs out
  useEffect(() => {
    if (authState.isInitialized && !authState.isAuthenticated) {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      dispatch({ type: 'SET_UNREAD_COUNT', payload: 0 });
    }
  }, [authState.isInitialized, authState.isAuthenticated]);

  useEffect(() => {
    if (!socket || !authState.isAuthenticated) return;

    const handleNewNotification = (notification: Notification) => {
      // Format notification before adding to state
      const formattedNotification = {
        ...notification,
        // Keep original data but ensure we have formatted display
        _displayData: formatNotificationDisplay(notification),
      };

      dispatch({ type: 'ADD_NOTIFICATION', payload: formattedNotification });
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [socket, authState.isAuthenticated]);

  const refreshNotifications = async () => {
    if (!authState.isAuthenticated) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await notificationService.getNotifications({
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      dispatch({ type: 'SET_NOTIFICATIONS', payload: result.data });
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    if (!authState.isAuthenticated) return;

    try {
      const { count } = await notificationService.getUnreadCount();
      dispatch({ type: 'SET_UNREAD_COUNT', payload: count });
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      dispatch({ type: 'MARK_AS_READ', payload: id });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const value = {
    state,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
}
