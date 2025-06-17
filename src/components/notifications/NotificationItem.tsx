import React from 'react';
import {
  CheckIcon,
  TrashIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShoppingBagIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { Notification, NotificationType } from '../../types/notification';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  formatNotificationDisplay,
  getNotificationTypeDisplayName,
  formatRelativeTime,
} from '../../utils/notificationFormatter';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  // Use formatter to get Vietnamese content
  const displayData = formatNotificationDisplay(notification);

  const getNotificationIcon = (type: NotificationType) => {
    const iconProps = { className: 'w-5 h-5' };

    switch (type) {
      case NotificationType.LIKE:
        return <HeartIcon {...iconProps} className="w-5 h-5 text-red-500" />;
      case NotificationType.COMMENT:
        return (
          <ChatBubbleLeftIcon
            {...iconProps}
            className="w-5 h-5 text-blue-500"
          />
        );
      case NotificationType.FOLLOW:
        return (
          <UserPlusIcon {...iconProps} className="w-5 h-5 text-green-500" />
        );
      case NotificationType.ORDER_UPDATE:
      case NotificationType.PAYMENT_SUCCESS:
        return (
          <ShoppingBagIcon {...iconProps} className="w-5 h-5 text-green-500" />
        );
      case NotificationType.PAYMENT_FAILED:
        return (
          <ExclamationTriangleIcon
            {...iconProps}
            className="w-5 h-5 text-red-500"
          />
        );
      case NotificationType.QUOTE_REQUEST:
      case NotificationType.QUOTE_RESPONSE:
      case NotificationType.CUSTOM_ORDER:
        return (
          <ShoppingBagIcon {...iconProps} className="w-5 h-5 text-blue-500" />
        );
      case NotificationType.MESSAGE:
        return (
          <ChatBubbleLeftIcon
            {...iconProps}
            className="w-5 h-5 text-purple-500"
          />
        );
      case NotificationType.PRICE_NEGOTIATION:
        return (
          <ShoppingBagIcon {...iconProps} className="w-5 h-5 text-yellow-500" />
        );
      case NotificationType.DISPUTE:
        return (
          <ExclamationTriangleIcon
            {...iconProps}
            className="w-5 h-5 text-red-500"
          />
        );
      case NotificationType.RETURN:
        return (
          <ShoppingBagIcon {...iconProps} className="w-5 h-5 text-orange-500" />
        );
      case NotificationType.SYSTEM:
        return (
          <InformationCircleIcon
            {...iconProps}
            className="w-5 h-5 text-gray-500"
          />
        );
      default:
        return <BellIcon {...iconProps} className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <Card
      className={`p-4 transition-colors ${
        !notification.isRead ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3
                  className={`font-medium ${
                    !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                  }`}
                >
                  {displayData.title}
                </h3>

                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}

                <Badge variant="secondary" size="sm">
                  {getNotificationTypeDisplayName(notification.type)}
                </Badge>
              </div>

              <p
                className={`text-sm ${
                  !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                }`}
              >
                {displayData.message}
              </p>

              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-500">
                  {formatRelativeTime(notification.createdAt)}
                </span>

                {notification.sender && (
                  <span className="text-xs text-gray-500">
                    Từ {notification.sender.firstName}{' '}
                    {notification.sender.lastName}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  title="Đánh dấu đã đọc"
                >
                  <CheckIcon className="w-4 h-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(notification.id)}
                className="text-red-600 hover:text-red-700"
                title="Xóa thông báo"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
