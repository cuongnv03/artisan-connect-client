import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useCustomOrderStats } from '../../../hooks/custom-orders/useCustomOrderStats';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export const CustomOrderStatsPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, loading, dateRange, updateDateRange, refreshStats } =
    useCustomOrderStats();
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const now = new Date();
    let dateFrom: Date;

    switch (period) {
      case '7days':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6months':
        dateFrom = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    updateDateRange({
      dateFrom: dateFrom.toISOString().split('T')[0],
      dateTo: now.toISOString().split('T')[0],
    });
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Quay lại
          </Button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Thống kê Custom Order
            </h1>
            <p className="text-gray-600">
              Phân tích hiệu suất các yêu cầu custom order
            </p>
          </div>
        </div>

        <Button onClick={refreshStats} disabled={loading}>
          Làm mới
        </Button>
      </div>

      {/* Period Selector */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Thời gian:</span>
          <div className="flex space-x-2">
            {[
              { value: '7days', label: '7 ngày' },
              { value: '30days', label: '30 ngày' },
              { value: '3months', label: '3 tháng' },
              { value: '6months', label: '6 tháng' },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => handlePeriodChange(period.value)}
                className={`px-3 py-1 text-sm rounded-lg ${
                  selectedPeriod === period.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {stats ? (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tổng yêu cầu
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalRequests}
                    </dd>
                  </dl>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Chờ phản hồi
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.pendingRequests}
                    </dd>
                  </dl>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Đã chấp nhận
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.acceptedRequests}
                    </dd>
                  </dl>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tỷ lệ chuyển đổi
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.conversionRate.toFixed(1)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Phân tích trạng thái
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Chờ phản hồi</span>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.pendingRequests}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Đã chấp nhận</span>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.acceptedRequests}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Đã từ chối</span>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.rejectedRequests}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Đã hết hạn</span>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.expiredRequests}
                  </span>
                </div>
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Hiệu suất
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      Thời gian phản hồi trung bình
                    </span>
                    <span className="text-sm font-medium">
                      {stats.averageResponseTime.toFixed(1)} giờ
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          ((24 - stats.averageResponseTime) / 24) * 100,
                          100,
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      Tỷ lệ chuyển đổi
                    </span>
                    <span className="text-sm font-medium">
                      {stats.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(stats.conversionRate, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Insights */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Nhận xét và gợi ý
            </h2>
            <div className="space-y-3">
              {stats.averageResponseTime > 24 && (
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Thời gian phản hồi chậm
                    </p>
                    <p className="text-sm text-yellow-700">
                      Bạn nên phản hồi các yêu cầu custom order trong vòng 24
                      giờ để tăng tỷ lệ chuyển đổi.
                    </p>
                  </div>
                </div>
              )}

              {stats.conversionRate < 30 && stats.totalRequests > 5 && (
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <ChartBarIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Tỷ lệ chuyển đổi thấp
                    </p>
                    <p className="text-sm text-blue-700">
                      Hãy xem xét điều chỉnh giá cả hoặc cải thiện phản hồi để
                      tăng tỷ lệ chấp nhận.
                    </p>
                  </div>
                </div>
              )}

              {stats.pendingRequests > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                  <XCircleIcon className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      Có yêu cầu chờ phản hồi
                    </p>
                    <p className="text-sm text-orange-700">
                      Bạn có {stats.pendingRequests} yêu cầu đang chờ phản hồi.
                      Hãy xử lý sớm để không bỏ lỡ cơ hội.
                    </p>
                  </div>
                </div>
              )}

              {stats.conversionRate > 70 && stats.totalRequests > 10 && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Hiệu suất tốt!
                    </p>
                    <p className="text-sm text-green-700">
                      Tỷ lệ chuyển đổi của bạn rất tốt. Hãy duy trì chất lượng
                      dịch vụ này.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-12 text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có dữ liệu thống kê
          </h3>
          <p className="text-gray-500">
            Bạn chưa có custom order nào trong khoảng thời gian này
          </p>
        </Card>
      )}
    </div>
  );
};
