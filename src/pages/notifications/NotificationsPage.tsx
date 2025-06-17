import React from 'react';
import { useNotifications } from '../../hooks/notifications/useNotifications';
import {
  NotificationHeader,
  NotificationFilters,
  NotificationsList,
} from '../../components/notifications';

export const NotificationsPage: React.FC = () => {
  const {
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
    refreshNotifications,
  } = useNotifications();

  return (
    <div className="max-w-7xl mx-auto">
      <NotificationHeader
        unreadCount={unreadCount}
        onMarkAllAsRead={handleMarkAllAsRead}
        markingAll={markingAll}
      />

      <NotificationFilters
        filters={filters}
        onFilterChange={setFilters}
        onRefresh={refreshNotifications}
      />

      <NotificationsList
        notifications={notifications}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDeleteNotification}
      />
    </div>
  );
};
