import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Review, CreateReviewDto, UpdateReviewDto } from '../../types/review';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FileUpload } from '../common/FileUpload';

interface ReviewFormProps {
  review?: Review | null;
  productId?: string;
  onSubmit: (data: CreateReviewDto | UpdateReviewDto) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  review,
  productId,
  onSubmit,
  onCancel,
  loading = false,
  className = '',
}) => {
  const [rating, setRating] = useState(review?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState(review?.title || '');
  const [comment, setComment] = useState(review?.comment || '');
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setTitle(review.title || '');
      setComment(review.comment || '');
    }
  }, [review]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      return;
    }

    const imageUrls: string[] = []; // TODO: Upload images first

    const data = review
      ? {
          rating,
          title: title.trim() || undefined,
          comment: comment.trim() || undefined,
          images: imageUrls,
        }
      : {
          productId: productId!,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim() || undefined,
          images: imageUrls,
        };

    await onSubmit(data as any);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isHovered = hoveredRating >= starNumber;
      const isSelected = rating >= starNumber;

      return (
        <button
          key={index}
          type="button"
          className="text-2xl focus:outline-none"
          onMouseEnter={() => setHoveredRating(starNumber)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(starNumber)}
        >
          {isSelected || isHovered ? (
            <StarIconSolid className="w-8 h-8 text-yellow-400" />
          ) : (
            <StarIcon className="w-8 h-8 text-gray-300" />
          )}
        </button>
      );
    });
  };

  return (
    <Card className={`p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đánh giá của bạn *
          </label>
          <div className="flex items-center space-x-1">{renderStars()}</div>
          {rating === 0 && (
            <p className="text-red-500 text-sm mt-1">
              Vui lòng chọn số sao đánh giá
            </p>
          )}
        </div>

        {/* Title */}
        <Input
          label="Tiêu đề đánh giá"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tóm tắt đánh giá của bạn..."
          maxLength={200}
          helperText={`${title.length}/200 ký tự`}
        />

        {/* Comment */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nội dung đánh giá
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            maxLength={2000}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/2000 ký tự
          </p>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hình ảnh (tùy chọn)
          </label>
          <FileUpload
            files={images}
            onFilesChange={setImages}
            accept="image"
            multiple={true}
            maxFiles={5}
            maxSize={5}
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Hủy
            </Button>
          )}
          <Button type="submit" loading={loading} disabled={rating === 0}>
            {review ? 'Cập nhật' : 'Gửi đánh giá'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
