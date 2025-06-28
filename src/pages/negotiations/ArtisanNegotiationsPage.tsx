import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePriceNegotiationsByType } from '../../hooks/price-negotiation/usePriceNegotiationsByType';
import { usePriceNegotiationStats } from '../../hooks/price-negotiation/usePriceNegotiationStats';
import { NegotiationList } from '../../components/negotiations/NegotiationList';
import {
  NegotiationSummary,
  NegotiationStatus,
} from '../../types/price-negotiation';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Dropdown';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { useNavigate } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';

export const ArtisanNegotiationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const {
    negotiations,
    loading,
    error,
    pagination,
    refetch,
    loadMore,
    hasMore,
  } = usePriceNegotiationsByType({
    type: 'received', // Get received negotiations
    page: 1,
    limit: 10,
    status:
      statusFilter !== 'ALL' ? (statusFilter as NegotiationStatus) : undefined,
    sortBy,
    sortOrder,
    enabled: !!authState.user,
  });

  // Get received negotiation stats
  const { stats, loading: statsLoading } = usePriceNegotiationStats({
    type: 'received', // Get received stats on this page
    userId: authState.user?.id,
  });

  const statusOptions = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Chờ phản hồi', value: NegotiationStatus.PENDING },
    { label: 'Đề nghị mới', value: NegotiationStatus.COUNTER_OFFERED },
    { label: 'Đã chấp nhận', value: NegotiationStatus.ACCEPTED },
    { label: 'Đã từ chối', value: NegotiationStatus.REJECTED },
    { label: 'Đã hết hạn', value: NegotiationStatus.EXPIRED },
  ];

  const sortOptions = [
    { label: 'Mới nhất', value: 'createdAt_desc' },
    { label: 'Cũ nhất', value: 'createdAt_asc' },
    { label: 'Trạng thái', value: 'status' },
    { label: 'Giá đề nghị', value: 'proposedPrice' },
    { label: 'Hết hạn', value: 'expiresAt' },
  ];

  const pendingCount = negotiations.filter(
    (n) => n.status === NegotiationStatus.PENDING,
  ).length;
  const counterCount = negotiations.filter(
    (n) => n.status === NegotiationStatus.COUNTER_OFFERED,
  ).length;

  const tabItems = [
    {
      key: 'ALL',
      label: 'Tất cả',
      content: null,
      badge: stats ? stats.totalNegotiations.toString() : '0',
    },
    {
      key: NegotiationStatus.PENDING,
      label: 'Chờ phản hồi',
      content: null,
      badge: stats ? stats.pendingNegotiations.toString() : '0',
      icon:
        stats && stats.pendingNegotiations > 0 ? (
          <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
        ) : undefined,
    },
    {
      key: NegotiationStatus.COUNTER_OFFERED,
      label: 'Đã phản hồi',
      content: null,
      badge: counterCount.toString(),
    },
    {
      key: NegotiationStatus.ACCEPTED,
      label: 'Đã chấp nhận',
      content: null,
      badge: stats ? stats.acceptedNegotiations.toString() : '0',
    },
    {
      key: NegotiationStatus.REJECTED,
      label: 'Đã từ chối',
      content: null,
      badge: stats ? stats.rejectedNegotiations.toString() : '0',
    },
  ];

  const handleNegotiationClick = (negotiation: NegotiationSummary) => {
    navigate(`/negotiations/${negotiation.id}`);
  };

  const handleSortChange = (value: string) => {
    if (value.includes('_')) {
      const [field, order] = value.split('_');
      setSortBy(field);
      setSortOrder(order as 'asc' | 'desc');
    } else {
      setSortBy(value);
    }
  };

  const filteredNegotiations = negotiations.filter((negotiation) => {
    const matchesSearch =
      negotiation.productName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      negotiation.customer?.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Count urgent negotiations (expiring soon)
  const urgentNegotiations = negotiations.filter((n) => {
    if (n.status !== NegotiationStatus.PENDING || !n.expiresAt) return false;
    const expiresAt = new Date(n.expiresAt);
    const now = new Date();
    const diffHours = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24; // Expiring within 24 hours
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header với gradient background */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 mb-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Thương lượng nhận được
              </h1>
              <p className="text-emerald-100 text-lg">
                Quản lý các yêu cầu thương lượng từ khách hàng
              </p>
            </div>
            <div className="hidden md:block">
              <InboxIcon className="w-16 h-16 text-white opacity-20" />
            </div>
          </div>

          {/* Quick stats */}
          {stats && !statsLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-2xl font-bold">{stats.totalNegotiations}</p>
                <p className="text-emerald-100 text-sm">Tổng nhận được</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-2xl font-bold">
                  {stats.pendingNegotiations}
                </p>
                <p className="text-emerald-100 text-sm">Chờ phản hồi</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-2xl font-bold">
                  {stats.totalNegotiations > 0
                    ? (
                        (stats.acceptedNegotiations / stats.totalNegotiations) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
                <p className="text-emerald-100 text-sm">Tỷ lệ chấp nhận</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-2xl font-bold">
                  {stats.averageDiscount.toFixed(1)}%
                </p>
                <p className="text-emerald-100 text-sm">Giảm giá TB</p>
              </div>
            </div>
          )}
        </div>

        {/* Urgent Notifications */}
        {urgentNegotiations.length > 0 && (
          <Card className="p-4 mb-6 border-orange-200 bg-orange-50">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mr-2" />
              <div>
                <h4 className="font-medium text-orange-900">
                  Yêu cầu cần phản hồi gấp
                </h4>
                <p className="text-sm text-orange-700">
                  {urgentNegotiations.length} thương lượng sẽ hết hạn trong 24
                  giờ tới
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() => setStatusFilter(NegotiationStatus.PENDING)}
              >
                Xem ngay
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Cards cho desktop */}
        {stats && !statsLoading && (
          <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng nhận được
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalNegotiations}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Chờ phản hồi
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pendingNegotiations}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tỷ lệ chấp nhận
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalNegotiations > 0
                      ? (
                          (stats.acceptedNegotiations /
                            stats.totalNegotiations) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Giảm giá TB
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageDiscount.toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm hoặc khách hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <select
                value={`${sortBy}${
                  sortBy === 'createdAt' ? `_${sortOrder}` : ''
                }`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
                className="px-3"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200 px-6">
            <nav className="flex space-x-8">
              {tabItems.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    statusFilter === tab.key
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    {tab.icon && <span className="mr-2">{tab.icon}</span>}
                    {tab.label}
                    {tab.badge && (
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          statusFilter === tab.key
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Negotiations List */}
        <div className="space-y-4">
          <NegotiationList
            negotiations={filteredNegotiations}
            userRole="ARTISAN"
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onRetry={refetch}
            onNegotiationClick={handleNegotiationClick}
            emptyMessage="Chưa có yêu cầu thương lượng nào"
            emptyDescription="Khách hàng có thể thương lượng giá trực tiếp từ trang sản phẩm của bạn"
          />
        </div>
      </div>
    </div>
  );
};
