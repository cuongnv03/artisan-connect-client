import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { Notification, NotificationType } from '../types/notification';
import { PaginatedResponse } from '../types/common';

export interface GetNotificationsQuery {
  type?: NotificationType;
  isRead?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const notificationService = {
  async getNotifications(
    query: GetNotificationsQuery = {},
  ): Promise<PaginatedResponse<Notification>> {
    return await apiClient.get<PaginatedResponse<Notification>>(
      API_ENDPOINTS.NOTIFICATIONS.BASE,
      query,
    );
  },

  async getUnreadCount(): Promise<{ count: number }> {
    return await apiClient.get<{ count: number }>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
    );
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${id}`);
  },
};
