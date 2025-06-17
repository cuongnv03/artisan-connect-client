import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../../services/notification.service';
import { Notification, NotificationType } from '../../types/notification';
import { PaginatedResponse } from '../../types/common';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';

export interface NotificationFilters {
  type: NotificationType | '';
  isRead: boolean | '';
}

export const useNotifications = () => {
  const { state: authState } = useAuth();
  const { success, error } = useToastContext();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<NotificationFilters>({
    type: '',
    isRead: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    setLoading(true);
    try {
      const result = await notificationService.getNotifications({
        page: currentPage,
        limit: 20,
        type: filters.type || undefined,
        isRead: filters.isRead !== '' ? filters.isRead : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      setNotifications(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.total);
    } catch (err: any) {
      console.error('Error loading notifications:', err);
      error(err.message || 'Có lỗi xảy ra khi tải thông báo');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, authState.isAuthenticated, error]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif,
        ),
      );
      success('Đã đánh dấu thông báo đã đọc');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );
      success('Đã đánh dấu tất cả thông báo đã đọc');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      success('Đã xóa thông báo');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    loading,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    unreadCount,
    markingAll,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    refreshNotifications: loadNotifications,
  };
};
