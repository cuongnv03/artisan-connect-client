import React from 'react';
import { useQuery } from 'react-query';
import { NotificationService } from '../../../services/notification.service';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

interface NotificationBadgeProps {
  className?: string;
  asButton?: boolean;
  onClick?: () => void;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  className = '',
  asButton = false,
  onClick,
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

  const content = (
    <>
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
    </>
  );

  if (asButton) {
    return (
      <button
        onClick={onClick}
        className={`relative p-2 text-gray-600 rounded-full hover:text-accent hover:bg-gray-100 ${className}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`relative p-2 text-gray-600 ${className}`}>{content}</div>
  );
};
