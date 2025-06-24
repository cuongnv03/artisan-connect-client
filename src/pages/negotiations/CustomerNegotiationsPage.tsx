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
} from '@heroicons/react/24/outline';

export const CustomerNegotiationsPage: React.FC = () => {
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
    type: 'sent', // Always get sent negotiations
    page: 1,
    limit: 10,
    status:
      statusFilter !== 'ALL' ? (statusFilter as NegotiationStatus) : undefined,
    sortBy,
    sortOrder,
    enabled: !!authState.user,
  });

  const { stats, loading: statsLoading } = usePriceNegotiationStats({
    userId: authState.user?.id,
    userRole: 'CUSTOMER',
  });

  const pageTitle =
    authState.user?.role === 'ARTISAN'
      ? 'Thương lượng đã gửi'
      : 'Thương lượng giá';

  const pageDescription =
    authState.user?.role === 'ARTISAN'
      ? 'Quản lý các yêu cầu thương lượng bạn đã gửi cho nghệ nhân khác'
      : 'Quản lý các yêu cầu thương lượng của bạn';

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
      // Keep current sort order for other fields
    }
  };

  const filteredNegotiations = negotiations.filter((negotiation) =>
    negotiation.productName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header với gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 mb-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
              <p className="text-blue-100 text-lg">{pageDescription}</p>
            </div>
            <div className="hidden md:block">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-white opacity-20" />
            </div>
          </div>

          {/* Quick stats */}
          {stats && !statsLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-2xl font-bold">{stats.totalNegotiations}</p>
                <p className="text-blue-100 text-sm">Tổng thương lượng</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-2xl font-bold">
                  {stats.pendingNegotiations}
                </p>
                <p className="text-blue-100 text-sm">Chờ phản hồi</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-2xl font-bold">
                  {stats.successRate.toFixed(1)}%
                </p>
                <p className="text-blue-100 text-sm">Tỷ lệ thành công</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-2xl font-bold">
                  {stats.averageDiscount.toFixed(1)}%
                </p>
                <p className="text-blue-100 text-sm">Tiết kiệm TB</p>
              </div>
            </div>
          )}
        </div>

        {/* Filters với design mới */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <select
                value={`${sortBy}${
                  sortBy === 'createdAt' ? `_${sortOrder}` : ''
                }`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

        {/* Status Tabs với design mới */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200 px-6">
            <nav className="flex space-x-8">
              {tabItems.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    statusFilter === tab.key
                      ? 'border-blue-500 text-blue-600'
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
                            ? 'bg-blue-100 text-blue-600'
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

        {/* Negotiations List với spacing tốt hơn */}
        <div className="space-y-4">
          <NegotiationList
            negotiations={filteredNegotiations}
            userRole="CUSTOMER"
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onRetry={refetch}
            onNegotiationClick={handleNegotiationClick}
            emptyMessage="Chưa có thương lượng nào"
            emptyDescription="Thương lượng giá trực tiếp từ trang sản phẩm để tiết kiệm chi phí"
          />
        </div>
      </div>
    </div>
  );
};
