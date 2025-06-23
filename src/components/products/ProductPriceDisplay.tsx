import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Badge } from '../ui/Badge';

interface ProductPriceDisplayProps {
  price: number;
  discountPrice?: number;
  allowNegotiation?: boolean;
  showNegotiationHint?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProductPriceDisplay: React.FC<ProductPriceDisplayProps> = ({
  price,
  discountPrice,
  allowNegotiation = false,
  showNegotiationHint = false,
  size = 'md',
  className = '',
}) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const currentPrice = discountPrice || price;
  const hasDiscount = discountPrice && discountPrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const sizeClasses = {
    sm: {
      current: 'text-lg font-bold',
      original: 'text-sm',
      hint: 'text-xs',
    },
    md: {
      current: 'text-2xl font-bold',
      original: 'text-lg',
      hint: 'text-sm',
    },
    lg: {
      current: 'text-3xl font-bold',
      original: 'text-xl',
      hint: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Price Display */}
      <div className="flex items-center gap-3">
        <span className={`${classes.current} text-red-600`}>
          {formatPrice(currentPrice)}
        </span>

        {hasDiscount && (
          <>
            <span className={`${classes.original} text-gray-500 line-through`}>
              {formatPrice(price)}
            </span>
            <Badge variant="danger" size="sm">
              -{discountPercent}%
            </Badge>
          </>
        )}
      </div>

      {/* Negotiation Hint */}
      {allowNegotiation && showNegotiationHint && (
        <p className={`${classes.hint} text-green-600 flex items-center gap-1`}>
          <ChatBubbleLeftRightIcon className="w-4 h-4" />
          Có thể thương lượng giá
        </p>
      )}
    </div>
  );
};
