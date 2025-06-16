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
  // ===== CORE HTTP API METHODS =====

  // Get user notifications
  async getNotifications(
    query: GetNotificationsQuery = {},
  ): Promise<PaginatedResponse<Notification>> {
    return await apiClient.get<PaginatedResponse<Notification>>(
      API_ENDPOINTS.NOTIFICATIONS.BASE,
      query,
    );
  },

  // Get unread count
  async getUnreadCount(): Promise<{ count: number }> {
    return await apiClient.get<{ count: number }>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
    );
  },

  // Mark single notification as read
  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ markedCount: number }> {
    return await apiClient.patch<{ markedCount: number }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
    );
  },

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${id}`);
  },

  // ===== HELPER METHODS =====

  // Get notifications by type
  async getNotificationsByType(
    type: NotificationType,
    query: Omit<GetNotificationsQuery, 'type'> = {},
  ): Promise<PaginatedResponse<Notification>> {
    return await this.getNotifications({ ...query, type });
  },

  // Get unread notifications only
  async getUnreadNotifications(
    query: Omit<GetNotificationsQuery, 'isRead'> = {},
  ): Promise<PaginatedResponse<Notification>> {
    return await this.getNotifications({ ...query, isRead: false });
  },

  // Get read notifications only
  async getReadNotifications(
    query: Omit<GetNotificationsQuery, 'isRead'> = {},
  ): Promise<PaginatedResponse<Notification>> {
    return await this.getNotifications({ ...query, isRead: true });
  },

  // Mark multiple notifications as read (batch operation)
  async markMultipleAsRead(notificationIds: string[]): Promise<{
    successful: string[];
    failed: string[];
  }> {
    const results = await Promise.allSettled(
      notificationIds.map((id) => this.markAsRead(id).then(() => id)),
    );

    const successful: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        failed.push(notificationIds[index]);
      }
    });

    return { successful, failed };
  },

  // Delete multiple notifications (batch operation)
  async deleteMultipleNotifications(notificationIds: string[]): Promise<{
    successful: string[];
    failed: string[];
  }> {
    const results = await Promise.allSettled(
      notificationIds.map((id) => this.deleteNotification(id).then(() => id)),
    );

    const successful: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        failed.push(notificationIds[index]);
      }
    });

    return { successful, failed };
  },

  // ===== NOTIFICATION PREFERENCES =====

  // Get notification preferences (if server supports)
  async getNotificationPreferences(): Promise<
    Record<NotificationType, boolean>
  > {
    try {
      return await apiClient.get<Record<NotificationType, boolean>>(
        `${API_ENDPOINTS.NOTIFICATIONS.BASE}/preferences`,
      );
    } catch (error) {
      // Return default preferences if endpoint not implemented
      return Object.values(NotificationType).reduce((acc, type) => {
        acc[type] = true;
        return acc;
      }, {} as Record<NotificationType, boolean>);
    }
  },

  // Update notification preferences (if server supports)
  async updateNotificationPreferences(
    preferences: Partial<Record<NotificationType, boolean>>,
  ): Promise<Record<NotificationType, boolean>> {
    try {
      return await apiClient.patch<Record<NotificationType, boolean>>(
        `${API_ENDPOINTS.NOTIFICATIONS.BASE}/preferences`,
        preferences,
      );
    } catch (error) {
      console.warn(
        'Notification preferences update not supported by server:',
        error,
      );
      throw new Error('Notification preferences update not supported');
    }
  },

  // ===== UTILITY METHODS =====

  // Check if notification is actionable (has actionUrl)
  isActionableNotification(notification: Notification): boolean {
    return !!(notification.actionUrl && notification.actionUrl.trim());
  },

  // Get notification display text (for UI)
  getNotificationDisplayText(notification: Notification): {
    title: string;
    message: string;
    icon?: string;
    color?: string;
  } {
    const typeConfig: Record<
      NotificationType,
      { icon: string; color: string }
    > = {
      [NotificationType.LIKE]: { icon: '👍', color: 'blue' },
      [NotificationType.COMMENT]: { icon: '💬', color: 'green' },
      [NotificationType.FOLLOW]: { icon: '👥', color: 'purple' },
      [NotificationType.MENTION]: { icon: '📢', color: 'orange' },
      [NotificationType.ORDER_UPDATE]: { icon: '📦', color: 'orange' },
      [NotificationType.PAYMENT_SUCCESS]: { icon: '💳', color: 'green' },
      [NotificationType.PAYMENT_FAILED]: { icon: '❌', color: 'red' },
      [NotificationType.QUOTE_REQUEST]: { icon: '📝', color: 'blue' },
      [NotificationType.QUOTE_RESPONSE]: { icon: '📋', color: 'indigo' },
      [NotificationType.CUSTOM_ORDER]: { icon: '🎨', color: 'indigo' },
      [NotificationType.CUSTOM_ORDER_UPDATE]: { icon: '🔄', color: 'purple' },
      [NotificationType.MESSAGE]: { icon: '✉️', color: 'blue' },
      [NotificationType.DISPUTE]: { icon: '⚖️', color: 'red' },
      [NotificationType.RETURN]: { icon: '↩️', color: 'orange' },
      [NotificationType.PRICE_NEGOTIATION]: { icon: '💰', color: 'yellow' },
      [NotificationType.SYSTEM]: { icon: '⚙️', color: 'gray' },
    };

    const config = typeConfig[notification.type];

    return {
      title: notification.title,
      message: notification.message,
      icon: config.icon,
      color: config.color,
    };
  },

  // Group notifications by date (for UI)
  groupNotificationsByDate(notifications: Notification[]): {
    today: Notification[];
    yesterday: Notification[];
    thisWeek: Notification[];
    older: Notification[];
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return notifications.reduce(
      (groups, notification) => {
        const createdAt = new Date(notification.createdAt);

        if (createdAt >= today) {
          groups.today.push(notification);
        } else if (createdAt >= yesterday) {
          groups.yesterday.push(notification);
        } else if (createdAt >= thisWeek) {
          groups.thisWeek.push(notification);
        } else {
          groups.older.push(notification);
        }

        return groups;
      },
      {
        today: [] as Notification[],
        yesterday: [] as Notification[],
        thisWeek: [] as Notification[],
        older: [] as Notification[],
      },
    );
  },
};
