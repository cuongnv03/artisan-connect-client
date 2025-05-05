import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { NotificationService } from '../../../services/notification.service';
import { NotificationType } from '../../../types/notification.types';
import { Avatar } from '../../../components/common/Avatar';
import { Button } from '../../../components/common/Button';
import { Tabs } from '../../../components/ui/Tabs';
import { Loader } from '../../../components/ui/Loader';
import { Alert } from '../../../components/ui/Alert';
import { formatRelativeTime } from '../../../utils/formatters';

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ['notifications', activeTab],
    () =>
      NotificationService.getNotifications({
        isRead: activeTab === 'unread' ? false : undefined,
        limit: 20,
      }),
    {
      refetchOnWindowFocus: true,
    },
  );

  // Mark all as read mutation
  const markAllReadMutation = useMutation(
    () => NotificationService.markAllAsRead(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
        queryClient.invalidateQueries(['notifications-count']);
      },
    },
  );

  // Mark single notification as read
  const markAsReadMutation = useMutation(
    (id: string) => NotificationService.markAsRead(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
        queryClient.invalidateQueries(['notifications-count']);
      },
    },
  );

  // Delete notification mutation
  const deleteNotificationMutation = useMutation(
    (id: string) => NotificationService.deleteNotification(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
      },
    },
  );

  // Mark notification as read when viewed
  useEffect(() => {
    // Mark unread notifications as read when tab changes
    const markVisibleAsRead = async () => {
      if (notificationsData?.data) {
        const unreadNotifications = notificationsData.data.filter(
          (notification) => !notification.isRead,
        );

        for (const notification of unreadNotifications) {
          await markAsReadMutation.mutateAsync(notification.id);
        }
      }
    };

    if (activeTab === 'all') {
      markVisibleAsRead();
    }
  }, [activeTab, notificationsData?.data, markAsReadMutation]);

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to the related entity
    // This logic would depend on your app's routing and notification types
  };

  const getNotificationLink = (notification: any) => {
    switch (notification.relatedEntityType) {
      case 'post':
        return `/post/${notification.relatedEntityId}`;
      case 'product':
        return `/product/${notification.relatedEntityId}`;
      case 'user':
        return `/profile/${notification.relatedEntityId}`;
      case 'order':
        return `/order/${notification.relatedEntityId}`;
      default:
        return '#';
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    // You can replace these with appropriate icons
    switch (type) {
      case NotificationType.LIKE:
        return '❤️';
      case NotificationType.COMMENT:
        return '💬';
      case NotificationType.FOLLOW:
        return '👥';
      case NotificationType.MENTION:
        return '@';
      case NotificationType.QUOTE_REQUEST:
      case NotificationType.QUOTE_RESPONSE:
        return '💲';
      case NotificationType.ORDER_STATUS:
        return '📦';
      case NotificationType.MESSAGE:
        return '✉️';
      case NotificationType.REVIEW:
        return '⭐';
      case NotificationType.SYSTEM:
      default:
        return '🔔';
    }
  };

  const tabs = [
    { id: 'all', label: 'All Notifications' },
    { id: 'unread', label: 'Unread' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllReadMutation.mutate()}
          isLoading={markAllReadMutation.isLoading}
          disabled={
            isLoading ||
            (notificationsData?.data?.every((n) => n.isRead) ?? true)
          }
        >
          Mark all as read
        </Button>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-3 px-6 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-accent text-accent font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id as 'all' | 'unread')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader size="lg" />
          </div>
        ) : isError ? (
          <Alert
            type="error"
            variant="subtle"
            className="m-4"
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            {(error as Error)?.message || 'Failed to load notifications'}
          </Alert>
        ) : notificationsData?.data.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-medium text-gray-900">
              No notifications yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'unread'
                ? "You've read all your notifications"
                : "You don't have any notifications"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notificationsData?.data.map((notification) => (
              <li
                key={notification.id}
                className={`p-4 hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <Link
                  to={getNotificationLink(notification)}
                  className="flex items-start space-x-3"
                  onClick={() => handleNotificationClick(notification)}
                >
                  {notification.relatedUser ? (
                    <Avatar
                      src={notification.relatedUser.avatarUrl}
                      firstName={notification.relatedUser.firstName}
                      lastName={notification.relatedUser.lastName}
                      size="md"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-accent-light rounded-full text-accent-dark">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.content}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="mt-2 flex justify-end space-x-2">
                  {!notification.isRead && (
                    <button
                      className="text-xs text-accent hover:text-accent-dark"
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={() =>
                      deleteNotificationMutation.mutate(notification.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
