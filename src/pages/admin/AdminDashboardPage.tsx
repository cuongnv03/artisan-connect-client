import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

interface AdminStats {
  totalUsers: number;
  totalArtisans: number;
  totalOrders: number;
  totalRevenue: number;
  pendingArtisanRequests: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
  }>;
  growthStats: {
    usersGrowth: number;
    ordersGrowth: number;
    revenueGrowth: number;
  };
}

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      // Mock data - In real app, call admin API
      const mockStats: AdminStats = {
        totalUsers: 1234,
        totalArtisans: 156,
        totalOrders: 2845,
        totalRevenue: 125000000,
        pendingArtisanRequests: 8,
        recentActivity: [
          {
            id: '1',
            type: 'user_registration',
            description: 'Người dùng mới đăng ký: Nguyễn Văn A',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            status: 'success',
          },
          {
            id: '2',
            type: 'artisan_request',
            description: 'Yêu cầu nâng cấp nghệ nhân mới từ Trần Thị B',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            status: 'warning',
          },
          {
            id: '3',
            type: 'order_completed',
            description: 'Đơn hàng #12345 đã hoàn thành',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            status: 'success',
          },
          {
            id: '4',
            type: 'content_reported',
            description: 'Bài viết bị báo cáo vi phạm',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            status: 'error',
          },
        ],
        growthStats: {
          usersGrowth: 12.5,
          ordersGrowth: 8.3,
          revenueGrowth: 15.2,
        },
      };

      setTimeout(() => {
        setStats(mockStats);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading admin stats:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) {
      return 'Vừa xong';
    } else if (diffMins < 60) {
      return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else {
      return then.toLocaleDateString('vi-VN');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UsersIcon className="w-4 h-4" />;
      case 'artisan_request':
        return <ClockIcon className="w-4 h-4" />;
      case 'order_completed':
        return <ShoppingBagIcon className="w-4 h-4" />;
      case 'content_reported':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <CheckCircleIcon className="w-4 h-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không thể tải dữ liệu
        </h3>
        <Button onClick={loadAdminStats}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Tổng quan hệ thống Artisan Connect</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Người dùng</p>
                <div className="flex items-center">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500 ml-1">
                    +{stats.growthStats.usersGrowth}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalUsers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.totalArtisans} nghệ nhân
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingBagIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Đơn hàng</p>
                <div className="flex items-center">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500 ml-1">
                    +{stats.growthStats.ordersGrowth}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalOrders.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Doanh thu</p>
                <div className="flex items-center">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500 ml-1">
                    +{stats.growthStats.revenueGrowth}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-500">Chờ duyệt</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.pendingArtisanRequests}
              </p>
              <p className="text-xs text-gray-500 mt-1">yêu cầu nghệ nhân</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/users">
            <Button
              variant="outline"
              fullWidth
              className="justify-start h-auto p-4"
            >
              <div className="text-left">
                <div className="flex items-center">
                  <UsersIcon className="w-5 h-5 mr-3" />
                  <span className="font-medium">Quản lý người dùng</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Xem và quản lý tài khoản người dùng
                </p>
              </div>
            </Button>
          </Link>

          <Link to="/admin/artisan-requests">
            <Button
              variant="outline"
              fullWidth
              className="justify-start h-auto p-4"
            >
              <div className="text-left">
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 mr-3" />
                  <span className="font-medium">Duyệt nghệ nhân</span>
                  {stats.pendingArtisanRequests > 0 && (
                    <Badge variant="warning" size="sm" className="ml-2">
                      {stats.pendingArtisanRequests}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Xem xét yêu cầu nâng cấp nghệ nhân
                </p>
              </div>
            </Button>
          </Link>

          <Button
            variant="outline"
            fullWidth
            className="justify-start h-auto p-4"
          >
            <div className="text-left">
              <div className="flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-3" />
                <span className="font-medium">Báo cáo chi tiết</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Xem báo cáo và thống kê hệ thống
              </p>
            </div>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Hoạt động gần đây
          </h2>
          <Button variant="ghost" size="sm">
            <EyeIcon className="w-4 h-4 mr-2" />
            Xem tất cả
          </Button>
        </div>

        <div className="space-y-4">
          {stats.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div
                className={`p-2 rounded-full ${getActivityColor(
                  activity.status,
                )}`}
              >
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tình trạng hệ thống
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Server</span>
              <Badge variant="success" size="sm">
                Hoạt động
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <Badge variant="success" size="sm">
                Hoạt động
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">File Storage</span>
              <Badge variant="success" size="sm">
                Hoạt động
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Gateway</span>
              <Badge variant="warning" size="sm">
                Chậm
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thống kê nhanh
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bài viết hôm nay</span>
              <span className="font-medium">24</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Đơn hàng hôm nay</span>
              <span className="font-medium">18</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Người dùng online</span>
              <span className="font-medium">142</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Báo cáo chờ xử lý</span>
              <span className="font-medium text-yellow-600">3</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
