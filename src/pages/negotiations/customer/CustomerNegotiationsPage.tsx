import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { usePriceNegotiations } from '../../../hooks/price-negotiation/usePriceNegotiations';
import { usePriceNegotiationStats } from '../../../hooks/price-negotiation/usePriceNegotiationStats';
import { NegotiationList } from '../../../components/negotiations/common/NegotiationList';
import {
  NegotiationSummary,
  NegotiationStatus,
} from '../../../types/price-negotiation';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Dropdown';
import { Card } from '../../../components/ui/Card';
import { Tabs } from '../../../components/ui/Tabs';
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
  } = usePriceNegotiations({
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

  const statusOptions = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Chờ phản hồi', value: NegotiationStatus.PENDING },
    { label: 'Đề nghị mới', value: NegotiationStatus.COUNTER_OFFERED },
    { label: 'Đã chấp nhận', value: NegotiationStatus.ACCEPTED },
    { label: 'Đã từ chối', value: NegotiationStatus.REJECTED },
    { label: 'Đã hết hạn', value: NegotiationStatus.EXPIRED },
  ];

  const sortOptions = [
    { label: 'Mới nhất', value: 'createdAt' },
    { label: 'Cũ nhất', value: 'createdAt' },
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

  const filteredNegotiations = negotiations.filter((negotiation) =>
    negotiation.productName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thương lượng giá</h1>
          <p className="text-gray-600">
            Quản lý các yêu cầu thương lượng của bạn
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Tổng thương lượng
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
                  Tỷ lệ thành công
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.successRate.toFixed(1)}%
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
                  Tiết kiệm TB
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
      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
              }
            />
          </div>

          <div className="flex space-x-4">
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              options={sortOptions}
            />
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Status Tabs */}
      <Tabs
        items={tabItems}
        activeKey={statusFilter}
        onChange={setStatusFilter}
        className="mb-6"
      />

      {/* Negotiations List */}
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
  );
};
