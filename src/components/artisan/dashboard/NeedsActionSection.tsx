import React from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  ScaleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

interface ActionItem {
  count: number;
  label: string;
  link: string;
  icon: React.ReactNode;
  color: string;
}

interface NeedsActionSectionProps {
  pendingOrderCount: number;
  pendingCustomOrderCount: number;
  pendingNegotiationCount: number;
}

export const NeedsActionSection: React.FC<NeedsActionSectionProps> = ({
  pendingOrderCount,
  pendingCustomOrderCount,
  pendingNegotiationCount,
}) => {
  const total =
    pendingOrderCount + pendingCustomOrderCount + pendingNegotiationCount;

  if (total === 0) return null;

  const items: ActionItem[] = [
    {
      count: pendingOrderCount,
      label: 'đơn hàng chờ xác nhận',
      link: '/orders',
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
    {
      count: pendingCustomOrderCount,
      label: 'yêu cầu đặt hàng tùy chỉnh',
      link: '/custom-orders/received',
      icon: <WrenchScrewdriverIcon className="w-5 h-5" />,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      count: pendingNegotiationCount,
      label: 'thương lượng giá đang chờ',
      link: '/negotiations/received',
      icon: <ScaleIcon className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
  ].filter((item) => item.count > 0);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <div className="flex items-center mb-4">
        <ExclamationCircleIcon className="w-5 h-5 text-amber-600 mr-2" />
        <h2 className="text-lg font-semibold text-amber-900">
          Cần xử lý ({total})
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link
            key={item.link}
            to={item.link}
            className={`flex items-center p-4 rounded-lg border ${item.color} hover:shadow-sm transition-shadow`}
          >
            <div className="mr-3 flex-shrink-0">{item.icon}</div>
            <div>
              <div className="text-2xl font-bold">{item.count}</div>
              <div className="text-sm">{item.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
