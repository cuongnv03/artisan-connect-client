import React from 'react';
import { NegotiationSummary } from '../../types/price-negotiation';
import { NegotiationCard } from './NegotiationCard';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

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
      <div className="text-center py-12">
        <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500 mb-6">{emptyDescription}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Làm mới
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
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
          >
            {loadingMore ? 'Đang tải...' : 'Xem thêm'}
          </Button>
        </div>
      )}
    </div>
  );
};
