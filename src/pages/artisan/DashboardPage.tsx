import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  EyeIcon,
  HeartIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { artisanService } from '../../services/artisan.service';
import { analyticsService } from '../../services/analytics.service';
import { orderService } from '../../services/order.service';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  totalViews: number;
  totalLikes: number;
  totalFollowers: number;
  revenueGrowth: number;
  salesGrowth: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
}

export const DashboardPage: React.FC = () => {
  const { state } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load artisan stats
      const artisanStats = await artisanService.getArtisanStats();

      // Load analytics summary
      const analyticsData = await analyticsService.getUserAnalyticsSummary();

      // Load recent orders
      const ordersData = await orderService.getSellerOrders({
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      // Combine stats
      setStats({
        totalProducts: artisanStats.totalProducts || 0,
        totalSales: artisanStats.totalSales || 0,
        totalRevenue: artisanStats.totalRevenue || 0,
        totalViews: analyticsData.totalViews || 0,
        totalLikes: analyticsData.totalLikes || 0,
        totalFollowers: state.user?.followerCount || 0,
        revenueGrowth: artisanStats.revenueGrowth || 0,
        salesGrowth: artisanStats.salesGrowth || 0,
      });

      setRecentOrders(ordersData.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getOrderStatusColor = (status: string) => {
    const colors = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      PAID: 'success',
      PROCESSING: 'info',
      SHIPPED: 'info',
      DELIVERED: 'success',
      CANCELLED: 'danger',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getOrderStatusText = (status: string) => {
    const texts = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PAID: 'Đã thanh toán',
      PROCESSING: 'Đang xử lý',
      SHIPPED: 'Đã gửi hàng',
      DELIVERED: 'Đã giao hàng',
      CANCELLED: 'Đã hủy',
    };
    return texts[status as keyof typeof texts] || status;
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-vietnamese rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Chào mừng trở lại, {state.user?.firstName}!
        </h1>
        <p className="opacity-90">
          Đây là tổng quan về hoạt động nghệ nhân của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Doanh thu</p>
                {stats && stats.revenueGrowth !== 0 && (
                  <div className="flex items-center">
                    {stats.revenueGrowth > 0 ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-xs ml-1 ${
                        stats.revenueGrowth > 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {Math.abs(stats.revenueGrowth)}%
                    </span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {stats ? formatCurrency(stats.totalRevenue) : '0 ₫'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingBagIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Đơn hàng</p>
                {stats && stats.salesGrowth !== 0 && (
                  <div className="flex items-center">
                    {stats.salesGrowth > 0 ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-xs ml-1 ${
                        stats.salesGrowth > 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {Math.abs(stats.salesGrowth)}%
                    </span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalSales || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EyeIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-500">Lượt xem</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalViews?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="w-8 h-8 text-pink-600" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-500">
                Người theo dõi
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalFollowers || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Đơn hàng gần đây
            </h2>
            <Link to="/orders">
              <Button variant="ghost" size="sm">
                Xem tất cả
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      #{order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <Badge
                      variant={getOrderStatusColor(order.status) as any}
                      size="sm"
                    >
                      {getOrderStatusText(order.status)}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Chưa có đơn hàng nào
              </p>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thao tác nhanh
          </h2>

          <div className="space-y-3">
            <Link to="/products/create" className="block">
              <Button variant="outline" fullWidth className="justify-start">
                <ShoppingBagIcon className="w-5 h-5 mr-3" />
                Thêm sản phẩm mới
              </Button>
            </Link>

            <Link to="/create-post" className="block">
              <Button variant="outline" fullWidth className="justify-start">
                <ChartBarIcon className="w-5 h-5 mr-3" />
                Tạo bài viết
              </Button>
            </Link>

            <Link to="/artisan/customize" className="block">
              <Button variant="outline" fullWidth className="justify-start">
                <EyeIcon className="w-5 h-5 mr-3" />
                Tùy chỉnh trang cá nhân
              </Button>
            </Link>

            <Link to="/artisan/analytics" className="block">
              <Button variant="outline" fullWidth className="justify-start">
                <ChartBarIcon className="w-5 h-5 mr-3" />
                Xem thống kê chi tiết
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tổng quan hiệu suất
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">
              {stats?.totalProducts || 0}
            </div>
            <p className="text-sm text-gray-600">Sản phẩm đang bán</p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">
              {stats?.totalLikes || 0}
            </div>
            <p className="text-sm text-gray-600">Lượt thích tổng cộng</p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">
              {stats
                ? Math.round(
                    stats.totalViews / Math.max(stats.totalProducts, 1),
                  )
                : 0}
            </div>
            <p className="text-sm text-gray-600">
              Lượt xem trung bình/sản phẩm
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
