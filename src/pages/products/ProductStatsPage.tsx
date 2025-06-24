import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChartBarIcon,
  CubeIcon,
  EyeIcon,
  ShoppingCartIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Dropdown';
import { useToastContext } from '../../contexts/ToastContext';
import { productService } from '../../services/product.service';
import { ProductStats } from '../../types/product';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  description,
  onClick,
}) => (
  <Card
    className={`p-6 hover:shadow-lg transition-shadow ${
      onClick ? 'cursor-pointer' : ''
    }`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div
        className={`p-3 rounded-full ${color
          .replace('text-', 'bg-')
          .replace('-600', '-100')}`}
      >
        {icon}
      </div>
    </div>
    {change !== undefined && (
      <div className="mt-4 flex items-center">
        {change >= 0 ? (
          <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
        ) : (
          <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
        )}
        <span
          className={`text-sm font-medium ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {change >= 0 ? '+' : ''}
          {change}%
        </span>
        <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
      </div>
    )}
  </Card>
);

export const ProductStatsPage: React.FC = () => {
  const navigate = useNavigate();
  const { error: showError } = useToastContext();
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await productService.getMyProductStats();
      setStats(statsData);
    } catch (err: any) {
      showError(err.message || 'Không thể tải thống kê');
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

  const navigateToProducts = (filters: Record<string, any>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    });
    navigate(`/products?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Không thể tải thống kê</p>
          <Button onClick={loadStats}>Thử lại</Button>
        </div>
      </div>
    );
  }

  const conversionRate =
    stats.totalViews > 0 ? (stats.totalSales / stats.totalViews) * 100 : 0;
  const avgViewsPerProduct =
    stats.totalProducts > 0
      ? Math.round(stats.totalViews / stats.totalProducts)
      : 0;

  return (
    <>
      <Helmet>
        <title>Thống kê sản phẩm - Artisan Connect</title>
        <meta
          name="description"
          content="Theo dõi hiệu suất kinh doanh sản phẩm"
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/products')}
                leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
              >
                Quay lại
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <ChartBarIcon className="w-8 h-8 text-primary mr-3" />
                  Thống kê sản phẩm
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  Theo dõi hiệu suất kinh doanh của bạn
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <Select
                value={timeRange}
                onChange={setTimeRange}
                options={[
                  { label: '7 ngày qua', value: 'week' },
                  { label: '30 ngày qua', value: 'month' },
                  { label: '3 tháng qua', value: 'quarter' },
                  { label: '12 tháng qua', value: 'year' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Tổng sản phẩm"
            value={stats.totalProducts}
            icon={<CubeIcon className="w-6 h-6" />}
            color="text-blue-600"
            description="Tất cả sản phẩm trong cửa hàng"
            onClick={() => navigateToProducts({})}
          />

          <StatsCard
            title="Đang bán"
            value={stats.publishedProducts}
            change={+12}
            icon={<ShoppingCartIcon className="w-6 h-6" />}
            color="text-green-600"
            description="Sản phẩm đã xuất bản"
            onClick={() => navigateToProducts({ status: 'PUBLISHED' })}
          />

          <StatsCard
            title="Lượt xem"
            value={stats.totalViews.toLocaleString()}
            change={+8}
            icon={<EyeIcon className="w-6 h-6" />}
            color="text-purple-600"
            description="Tổng lượt xem sản phẩm"
          />

          <StatsCard
            title="Đã bán"
            value={stats.totalSales.toLocaleString()}
            change={+15}
            icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
            color="text-orange-600"
            description="Tổng số lượng đã bán"
          />
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Product Status Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Phân bố trạng thái sản phẩm
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Đang bán</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{stats.publishedProducts}</div>
                  <div className="text-xs text-gray-500">
                    {stats.totalProducts > 0
                      ? Math.round(
                          (stats.publishedProducts / stats.totalProducts) * 100,
                        )
                      : 0}
                    %
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Nháp</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{stats.draftProducts}</div>
                  <div className="text-xs text-gray-500">
                    {stats.totalProducts > 0
                      ? Math.round(
                          (stats.draftProducts / stats.totalProducts) * 100,
                        )
                      : 0}
                    %
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Hết hàng</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {stats.outOfStockProducts}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.totalProducts > 0
                      ? Math.round(
                          (stats.outOfStockProducts / stats.totalProducts) *
                            100,
                        )
                      : 0}
                    %
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hiệu suất kinh doanh
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tỷ lệ chuyển đổi</span>
                <div className="text-right">
                  <div className="font-semibold">
                    {conversionRate.toFixed(1)}%
                  </div>
                  <Badge variant="success" size="sm">
                    +0.3%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Lượt xem trung bình
                </span>
                <div className="text-right">
                  <div className="font-semibold">{avgViewsPerProduct}</div>
                  <span className="text-xs text-gray-500">mỗi sản phẩm</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Đánh giá trung bình
                </span>
                <div className="text-right">
                  <div className="font-semibold flex items-center">
                    <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                    {stats.avgRating?.toFixed(1) || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hành động nhanh
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => navigate('/products/create')}
                className="w-full justify-start"
                leftIcon={<CubeIcon className="w-4 h-4" />}
              >
                Tạo sản phẩm mới
              </Button>

              <Button
                variant="outline"
                onClick={() => navigateToProducts({ status: 'DRAFT' })}
                className="w-full justify-start"
                leftIcon={<EyeIcon className="w-4 h-4" />}
              >
                Xem sản phẩm nháp ({stats.draftProducts})
              </Button>

              <Button
                variant="outline"
                onClick={() => navigateToProducts({ inStock: false })}
                className="w-full justify-start"
                leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
              >
                Kiểm tra hết hàng ({stats.outOfStockProducts})
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/orders')}
                className="w-full justify-start"
                leftIcon={<CurrencyDollarIcon className="w-4 h-4" />}
              >
                Xem đơn hàng
              </Button>
            </div>
          </Card>
        </div>

        {/* Insights & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Insights */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Phân tích hiệu suất
            </h3>
            <div className="space-y-4 text-sm">
              {stats.publishedProducts === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    ⚠️ Bạn chưa có sản phẩm nào đang bán. Hãy đăng bán ít nhất
                    một sản phẩm để bắt đầu kinh doanh.
                  </p>
                </div>
              )}

              {stats.totalViews > 0 && conversionRate < 1 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800">
                    💡 Tỷ lệ chuyển đổi thấp ({conversionRate.toFixed(1)}%). Hãy
                    cải thiện mô tả và hình ảnh sản phẩm.
                  </p>
                </div>
              )}

              {stats.outOfStockProducts > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">
                    🚨 Bạn có {stats.outOfStockProducts} sản phẩm hết hàng. Hãy
                    cập nhật tồn kho để không bỏ lỡ đơn hàng.
                  </p>
                </div>
              )}

              {stats.draftProducts > stats.publishedProducts && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-800">
                    📝 Bạn có nhiều sản phẩm nháp hơn sản phẩm đang bán. Hãy
                    hoàn thiện và đăng bán chúng.
                  </p>
                </div>
              )}

              {stats.avgRating && stats.avgRating < 4 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800">
                    ⭐ Đánh giá trung bình thấp ({stats.avgRating.toFixed(1)}
                    /5). Hãy cải thiện chất lượng sản phẩm và dịch vụ.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Tips for Improvement */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              💡 Gợi ý cải thiện
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm text-blue-800">
              <div className="flex items-start">
                <span className="mr-2">📸</span>
                <span>Thêm nhiều hình ảnh chất lượng cao cho sản phẩm</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2">📝</span>
                <span>Viết mô tả sản phẩm chi tiết và hấp dẫn</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2">🏷️</span>
                <span>
                  Sử dụng các thẻ từ khóa phù hợp để tăng khả năng tìm kiếm
                </span>
              </div>
              <div className="flex items-start">
                <span className="mr-2">💬</span>
                <span>Tương tác với khách hàng qua bình luận và tin nhắn</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2">🎯</span>
                <span>Đăng bài trên mạng xã hội để quảng bá sản phẩm</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2">📊</span>
                <span>Theo dõi và phân tích xu hướng thị trường</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};
