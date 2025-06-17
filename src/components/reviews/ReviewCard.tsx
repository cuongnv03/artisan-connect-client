import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  StarIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Review } from '../../types/review';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

interface ReviewCardProps {
  review: Review;
  showActions?: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  className?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showActions = false,
  onEdit,
  onDelete,
  className = '',
}) => {
  const [showFullComment, setShowFullComment] = useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIconSolid
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const shouldTruncateComment = review.comment && review.comment.length > 200;
  const displayComment =
    shouldTruncateComment && !showFullComment
      ? review.comment.substring(0, 200) + '...'
      : review.comment;

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <Avatar
          src={review.user?.avatarUrl}
          alt={`${review.user?.firstName} ${review.user?.lastName}`}
          size="md"
        />

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-gray-900">
                {review.user?.firstName} {review.user?.lastName}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center">
                  {renderStars(review.rating)}
                </div>
                {review.isVerifiedPurchase && (
                  <Badge variant="success" size="sm">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    Đã mua hàng
                  </Badge>
                )}
              </div>
            </div>

            {showActions && (
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(review)}
                    leftIcon={<PencilIcon className="w-4 h-4" />}
                  >
                    Sửa
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(review.id)}
                    leftIcon={<TrashIcon className="w-4 h-4" />}
                    className="text-red-600 hover:text-red-700"
                  >
                    Xóa
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          {review.title && (
            <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
          )}

          {/* Comment */}
          {review.comment && (
            <div className="mb-3">
              <p className="text-gray-700 leading-relaxed">{displayComment}</p>
              {shouldTruncateComment && (
                <button
                  onClick={() => setShowFullComment(!showFullComment)}
                  className="text-primary text-sm mt-1 hover:underline"
                >
                  {showFullComment ? 'Thu gọn' : 'Xem thêm'}
                </button>
              )}
            </div>
          )}

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex space-x-2 mb-3">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {formatDistanceToNow(new Date(review.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
            {review.helpfulCount > 0 && (
              <span>{review.helpfulCount} người thấy hữu ích</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
