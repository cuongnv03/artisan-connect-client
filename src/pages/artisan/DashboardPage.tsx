import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CubeIcon,
  EyeIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  PlusIcon,
  ChartBarIcon,
  UsersIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ProductCard } from '../../components/products/customer/ProductCard/ProductCard';
import { productService } from '../../services/product.service';
import { orderService } from '../../services/order.service';
import { Product, ProductStats } from '../../types/product';
import { Order } from '../../types/order';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTE_PATHS } from '../../constants/routes';

interface DashboardStats {
  productStats: ProductStats;
  recentOrders: Order[];
  topProducts: Product[];
  monthlyRevenue: number;
  monthlyViews: number;
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { state: authState } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [productStats, recentProducts, recentOrders] = await Promise.all([
        productService.getMyProductStats(),
        productService.getMyProducts({
          limit: 6,
          sortBy: 'salesCount',
          sortOrder: 'desc',
        }),
        orderService.getSellerOrders({
          limit: 5,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
      ]);

      setStats({
        productStats,
        recentOrders: recentOrders.data,
        topProducts: recentProducts.data,
        monthlyRevenue: 0, // Calculate from orders
        monthlyViews: productStats.totalViews,
      });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Không thể tải dữ liệu dashboard
        </h2>
        <Button onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    );
  }

  const quickStats = [
    {
      title: 'Tổng sản phẩm',
      value: stats.productStats.totalProducts,
      icon: CubeIcon,
      color: 'blue',
      change: '+12%',
    },
    {
      title: 'Đã xuất bản',
      value: stats.productStats.publishedProducts,
      icon: EyeIcon,
      color: 'green',
      change: '+8%',
    },
    {
      title: 'Tổng lượt xem',
      value: stats.productStats.totalViews.toLocaleString(),
      icon: ChartBarIcon,
      color: 'purple',
      change: '+25%',
    },
    {
      title: 'Đã bán',
      value: stats.productStats.totalSales,
      icon: ShoppingBagIcon,
      color: 'orange',
      change: '+15%',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Chào mừng {authState.user?.firstName}, quản lý cửa hàng của bạn
          </p>
        </div>
        <div className="flex gap-3">
          <Link to={ROUTE_PATHS.APP.ARTISAN.CREATE_PRODUCT}>
            <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
              Thêm sản phẩm mới
            </Button>
          </Link>
          <Link to={ROUTE_PATHS.APP.ARTISAN.ANALYTICS}>
            <Button
              variant="outline"
              leftIcon={<ChartBarIcon className="w-4 h-4" />}
            >
              Xem chi tiết
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <span className="text-sm text-green-600 font-medium">
                  {stat.change}
                </span>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Đơn hàng gần đây
            </h2>
            <Link
              to="/artisan/orders"
              className="text-primary hover:text-primary-dark"
            >
              Xem tất cả
            </Link>
          </div>

          {stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      #{order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} sản phẩm
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <Badge
                      variant={
                        order.status === 'DELIVERED'
                          ? 'success'
                          : order.status === 'CANCELLED'
                          ? 'danger'
                          : order.status === 'PROCESSING'
                          ? 'warning'
                          : 'secondary'
                      }
                      size="sm"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Chưa có đơn hàng nào
            </p>
          )}
        </Card>

        {/* Performance Overview */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Hiệu suất tháng này
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Doanh thu</span>
              <span className="font-semibold">
                {formatCurrency(stats.monthlyRevenue)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Lượt xem</span>
              <span className="font-semibold">
                {stats.monthlyViews.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tỉ lệ chuyển đổi</span>
              <span className="font-semibold">2.4%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Đánh giá trung bình</span>
              <div className="flex items-center">
                <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="font-semibold">4.8</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link to="/artisan/analytics">
              <Button variant="outline" fullWidth>
                Xem báo cáo chi tiết
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Sản phẩm bán chạy
          </h2>
          <Link
            to={ROUTE_PATHS.APP.ARTISAN.PRODUCTS}
            className="text-primary hover:text-primary-dark"
          >
            Quản lý sản phẩm
          </Link>
        </div>

        {stats.topProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.topProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showSellerInfo={false}
                variant="grid"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có sản phẩm
            </h3>
            <p className="text-gray-600 mb-6">
              Tạo sản phẩm đầu tiên để bắt đầu bán hàng
            </p>
            <Link to={ROUTE_PATHS.APP.ARTISAN.CREATE_PRODUCT}>
              <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
                Tạo sản phẩm
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Thao tác nhanh
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={ROUTE_PATHS.APP.ARTISAN.CREATE_PRODUCT}>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
              <PlusIcon className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-medium text-gray-900">Thêm sản phẩm</h3>
              <p className="text-sm text-gray-600">Tạo sản phẩm mới để bán</p>
            </div>
          </Link>

          <Link to={ROUTE_PATHS.APP.ARTISAN.CUSTOMIZE}>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
              <UsersIcon className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-medium text-gray-900">Tùy chỉnh shop</h3>
              <p className="text-sm text-gray-600">Cá nhân hóa cửa hàng</p>
            </div>
          </Link>

          <Link to={ROUTE_PATHS.APP.MESSAGES}>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
              <CurrencyDollarIcon className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-medium text-gray-900">Tin nhắn</h3>
              <p className="text-sm text-gray-600">Trả lời khách hàng</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
};
