import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { ReviewStatistics } from '../../types/review';
import { Card } from '../ui/Card';

interface ReviewStatsProps {
  statistics: ReviewStatistics;
  className?: string;
}

export const ReviewStats: React.FC<ReviewStatsProps> = ({
  statistics,
  className = '',
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getProgressWidth = (count: number) => {
    return statistics.totalReviews > 0
      ? (count / statistics.totalReviews) * 100
      : 0;
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start space-x-8">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {statistics.averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center mb-2">
            {renderStars(Math.round(statistics.averageRating))}
          </div>
          <div className="text-sm text-gray-600">
            {statistics.totalReviews} đánh giá
          </div>
          {statistics.verifiedPurchaseCount > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {statistics.verifiedPurchaseCount} đã mua hàng
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-3">Phân bố đánh giá</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count =
                statistics.ratingDistribution[
                  rating as keyof typeof statistics.ratingDistribution
                ];
              const width = getProgressWidth(count);

              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-12">
                    <span className="text-sm font-medium">{rating}</span>
                    <StarIcon className="w-3 h-3 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-8 text-right">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
