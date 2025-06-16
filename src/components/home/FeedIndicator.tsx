import React from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface FeedIndicatorProps {
  showFallback: boolean;
}

export const FeedIndicator: React.FC<FeedIndicatorProps> = ({
  showFallback,
}) => {
  if (!showFallback) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <UserGroupIcon className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-blue-700">
            Bạn chưa theo dõi ai. Đang hiển thị bài viết phổ biến từ cộng đồng.{' '}
            <a
              href="/discover"
              className="font-medium underline hover:text-blue-600"
            >
              Khám phá nghệ nhân
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
