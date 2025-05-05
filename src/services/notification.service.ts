import api from './api';
import {
  Notification,
  NotificationQueryOptions,
  NotificationPreference,
} from '../types/notification.types';
import { PaginatedResponse } from '../types/api.types';

export const NotificationService = {
  getNotifications: async (
    options: NotificationQueryOptions = {},
  ): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get('/notifications', { params: options });
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread/count');
    return response.data.data.count;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  getPreferences: async (): Promise<NotificationPreference[]> => {
    const response = await api.get('/notifications/preferences');
    return response.data.data;
  },

  updatePreference: async (
    type: string,
    enabled: boolean,
  ): Promise<NotificationPreference> => {
    const response = await api.patch('/notifications/preferences', {
      type,
      enabled,
    });
    return response.data.data;
  },
};
