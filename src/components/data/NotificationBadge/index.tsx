import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { NotificationService } from '../../../services/notification.service';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

interface NotificationBadgeProps {
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  className = '',
}) => {
  // Get unread notification count
  const { data: unreadCount } = useQuery(
    ['notifications-count'],
    () => NotificationService.getUnreadCount(),
    {
      refetchInterval: 60000, // Refetch every minute
      refetchOnWindowFocus: true,
    },
  );

  const hasUnread = (unreadCount || 0) > 0;

  return (
    <Link
      to="/notifications"
      className={`relative p-2 text-gray-600 rounded-full hover:text-accent hover:bg-gray-100 ${className}`}
    >
      {hasUnread ? (
        <BellIconSolid className="h-6 w-6 text-accent" />
      ) : (
        <BellIcon className="h-6 w-6" />
      )}

      {hasUnread && (
        <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center transform translate-x-1/3 -translate-y-1/3">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};
