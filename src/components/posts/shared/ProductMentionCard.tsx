import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { ProductMention } from '../../../types/post';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { Avatar } from '../../ui/Avatar';
import { formatPrice } from '../../../utils/format';

interface ProductMentionCardProps {
  mention: ProductMention;
  className?: string;
}

export const ProductMentionCard: React.FC<ProductMentionCardProps> = ({
  mention,
  className = '',
}) => {
  const { product } = mention;

  const renderRating = (rating?: number, reviewCount: number = 0) => {
    const stars = [];
    const ratingValue = rating || 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(ratingValue)) {
        stars.push(
          <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />,
        );
      } else if (i - 0.5 <= ratingValue) {
        stars.push(
          <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />,
        );
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
      }
    }

    return (
      <div className="flex items-center">
        <div className="flex">{stars}</div>
        <span className="ml-1 text-xs text-gray-500">({reviewCount})</span>
      </div>
    );
  };

  const discountPercentage = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  return (
    <Card
      className={`group hover:shadow-md transition-all duration-300 ${className}`}
    >
      <Link to={`/shop/${product.id}`} className="block p-4">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg mb-3">
          <img
            src={product.images?.[0] || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2">
              <Badge variant="danger" size="sm">
                -{discountPercentage}%
              </Badge>
            </div>
          )}
          {product.status === 'OUT_OF_STOCK' && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" size="sm">
                Hết hàng
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h4 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h4>

          {/* Context Text */}
          {mention.contextText && (
            <p className="text-sm text-gray-600 mb-2 italic">
              "{mention.contextText}"
            </p>
          )}

          {/* Rating */}
          <div className="mb-2">
            {renderRating(product.avgRating, product.reviewCount)}
          </div>

          {/* Price */}
          <div className="flex items-center mb-3">
            {product.discountPrice ? (
              <>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through ml-2">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Seller Info */}
          <div className="flex items-center">
            <Avatar
              src={product.seller.avatarUrl}
              alt={`${product.seller.firstName} ${product.seller.lastName}`}
              size="xs"
            />
            <div className="ml-2 min-w-0 flex-1">
              <p className="text-xs text-gray-600 truncate">
                {product.seller.artisanProfile?.shopName ||
                  `${product.seller.firstName} ${product.seller.lastName}`}
              </p>
              {product.seller.artisanProfile?.isVerified && (
                <Badge variant="success" size="sm" className="mt-1">
                  Đã xác thực
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};
