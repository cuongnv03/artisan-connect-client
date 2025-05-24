import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  FunnelIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShoppingBagIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useToastContext } from '../../contexts/ToastContext';
import { notificationService } from '../../services/notification.service';
import { Notification, NotificationType } from '../../types/notification';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Select } from '../../components/ui/Dropdown';
import { Pagination } from '../../components/ui/Pagination';

export const NotificationsPage: React.FC = () => {
  const { success, error } = useToastContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    type: NotificationType | '';
    isRead: boolean | '';
  }>({
    type: '',
    isRead: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [currentPage, filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const result = await notificationService.getNotifications({
        page: currentPage,
        limit: 20,
        type: filter.type || undefined,
        isRead: filter.isRead !== '' ? filter.isRead : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      setNotifications(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.total);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const getNotificationTypeText = (type: NotificationType) => {
    const types = {
      [NotificationType.LIKE]: 'Lượt thích',
      [NotificationType.COMMENT]: 'Bình luận',
      [NotificationType.FOLLOW]: 'Theo dõi',
      [NotificationType.MENTION]: 'Nhắc đến',
      [NotificationType.ORDER_UPDATE]: 'Cập nhật đơn hàng',
      [NotificationType.PAYMENT_SUCCESS]: 'Thanh toán thành công',
      [NotificationType.PAYMENT_FAILED]: 'Thanh toán thất bại',
      [NotificationType.QUOTE_REQUEST]: 'Yêu cầu báo giá',
      [NotificationType.QUOTE_RESPONSE]: 'Phản hồi báo giá',
      [NotificationType.CUSTOM_ORDER]: 'Đơn hàng tùy chỉnh',
      [NotificationType.MESSAGE]: 'Tin nhắn',
      [NotificationType.SYSTEM]: 'Hệ thống',
    };
    return types[type];
  };

  const formatTime = (date: string) => {
    const notifDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Vừa xong';
    } else if (diffMins < 60) {
      return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return notifDate.toLocaleDateString('vi-VN');
    }
  };

  const typeOptions = [
    { label: 'Tất cả loại', value: '' },
    { label: 'Lượt thích', value: NotificationType.LIKE },
    { label: 'Bình luận', value: NotificationType.COMMENT },
    { label: 'Theo dõi', value: NotificationType.FOLLOW },
    { label: 'Đơn hàng', value: NotificationType.ORDER_UPDATE },
    { label: 'Thanh toán', value: NotificationType.PAYMENT_SUCCESS },
    { label: 'Tin nhắn', value: NotificationType.MESSAGE },
    { label: 'Hệ thống', value: NotificationType.SYSTEM },
  ];

  const statusOptions = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Chưa đọc', value: 'false' },
    { label: 'Đã đọc', value: 'true' },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
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
              onClick={handleMarkAllAsRead}
              loading={markingAll}
              leftIcon={<CheckIcon className="w-4 h-4" />}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center">
            <FunnelIcon className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Bộ lọc:</span>
          </div>

          <div className="flex flex-col md:flex-row gap-3 flex-1">
            <Select
              value={filter.type}
              onChange={(value) =>
                setFilter((prev) => ({
                  ...prev,
                  type: value as NotificationType,
                }))
              }
              options={typeOptions}
              className="md:w-48"
            />

            <Select
              value={filter.isRead.toString()}
              onChange={(value) =>
                setFilter((prev) => ({
                  ...prev,
                  isRead: value === '' ? '' : value === 'true',
                }))
              }
              options={statusOptions}
              className="md:w-48"
            />
          </div>

          <Button variant="ghost" size="sm" onClick={loadNotifications}>
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Đang tải thông báo...</p>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<BellIcon className="w-16 h-16" />}
          title="Chưa có thông báo nào"
          description="Khi có hoạt động mới, bạn sẽ nhận được thông báo ở đây"
        />
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 transition-colors ${
                  !notification.isRead
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
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
                              !notification.isRead
                                ? 'text-gray-900'
                                : 'text-gray-700'
                            }`}
                          >
                            {notification.title}
                          </h3>

                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}

                          <Badge variant="secondary" size="sm">
                            {getNotificationTypeText(notification.type)}
                          </Badge>
                        </div>

                        <p
                          className={`text-sm ${
                            !notification.isRead
                              ? 'text-gray-700'
                              : 'text-gray-500'
                          }`}
                        >
                          {notification.message}
                        </p>

                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
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
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <CheckIcon className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteNotification(notification.id)
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
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
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
