import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { Notification } from '../../types/notification';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { Pagination } from '../ui/Pagination';
import { NotificationItem } from './NotificationItem';

interface NotificationsListProps {
  notifications: Notification[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  loading,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onMarkAsRead,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<BellIcon className="w-16 h-16" />}
        title="Chưa có thông báo nào"
        description="Khi có hoạt động mới, bạn sẽ nhận được thông báo ở đây"
      />
    );
  }

  return (
    <>
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={20}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
};
