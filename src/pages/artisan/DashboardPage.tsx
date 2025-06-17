import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useArtisanDashboard } from '../../hooks/artisan/useArtisanDashboard';
import { DashboardOverview } from '../../components/artisan/dashboard/DashboardOverview';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const { state: authState } = useAuth();
  const { dashboardData, analyticsData, loading, refreshDashboard } =
    useArtisanDashboard();

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
          <Link to="/products/manage/create">
            <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
              Thêm sản phẩm mới
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={refreshDashboard}
            leftIcon={<ChartBarIcon className="w-4 h-4" />}
          >
            Làm mới
          </Button>
        </div>
      </div>

      <DashboardOverview
        dashboardData={dashboardData}
        analyticsData={analyticsData}
        loading={loading}
      />
    </div>
  );
};
