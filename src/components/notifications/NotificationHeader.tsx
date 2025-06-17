import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
  markingAll: boolean;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  unreadCount,
  onMarkAllAsRead,
  markingAll,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
        {unreadCount > 0 && (
          <p className="text-gray-600">{unreadCount} thông báo chưa đọc</p>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            onClick={onMarkAllAsRead}
            loading={markingAll}
            leftIcon={<CheckIcon className="w-4 h-4" />}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>
    </div>
  );
};
