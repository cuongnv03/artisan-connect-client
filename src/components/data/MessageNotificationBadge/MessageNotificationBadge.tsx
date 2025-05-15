import React, { useEffect } from 'react';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftIcon as ChatBubbleLeftIconSolid } from '@heroicons/react/24/solid';
import { useMessages } from '../../../context/MessageContext';
import { Badge } from '../../common/Badge';

interface MessageNotificationBadgeProps {
  isActive?: boolean;
}

export const MessageNotificationBadge: React.FC<
  MessageNotificationBadgeProps
> = ({ isActive = false }) => {
  const { state, fetchUnreadCount } = useMessages();

  // Fetch unread count when the component mounts
  useEffect(() => {
    fetchUnreadCount();

    // Set up a polling interval to check for new messages
    const interval = setInterval(fetchUnreadCount, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const Icon = isActive ? ChatBubbleLeftIconSolid : ChatBubbleLeftIcon;

  return (
    <div className="relative">
      <Icon className="h-6 w-6" />
      {state.unreadCount > 0 && (
        <Badge variant="danger" size="sm" className="absolute -top-1 -right-1">
          {state.unreadCount > 99 ? '99+' : state.unreadCount}
        </Badge>
      )}
    </div>
  );
};
