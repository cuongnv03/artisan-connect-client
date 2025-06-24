import React from 'react';
import { NegotiationSummary } from '../../types/price-negotiation';
import { NegotiationCard } from './NegotiationCard';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import {
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface NegotiationListProps {
  negotiations: NegotiationSummary[];
  userRole: 'CUSTOMER' | 'ARTISAN';
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  onNegotiationClick?: (negotiation: NegotiationSummary) => void;
}

export const NegotiationList: React.FC<NegotiationListProps> = ({
  negotiations,
  userRole,
  loading = false,
  error,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  emptyMessage = 'Chưa có thương lượng nào',
  emptyDescription = 'Các thương lượng giá sẽ hiển thị tại đây',
  onRetry,
  onNegotiationClick,
}) => {
  if (loading && negotiations.length === 0) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Đang tải thương lượng...</p>
      </div>
    );
  }

  if (error && negotiations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Thử lại
          </Button>
        )}
      </div>
    );
  }

  if (negotiations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="mx-auto h-24 w-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-500 mb-6">{emptyDescription}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              leftIcon={<ArrowPathIcon className="w-4 h-4" />}
            >
              Làm mới
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid layout cho negotiations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {negotiations.map((negotiation) => (
          <NegotiationCard
            key={negotiation.id}
            negotiation={negotiation}
            userRole={userRole}
            onClick={() => onNegotiationClick?.(negotiation)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <Button
            onClick={onLoadMore}
            loading={loadingMore}
            variant="outline"
            disabled={loadingMore}
            className="px-8 py-3"
          >
            {loadingMore ? 'Đang tải...' : 'Xem thêm'}
          </Button>
        </div>
      )}
    </div>
  );
};
