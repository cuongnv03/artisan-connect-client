import React from 'react';
import { Link } from 'react-router-dom';
import {
  NegotiationSummary,
  NegotiationStatus,
} from '../../types/price-negotiation';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  SwatchIcon,
  CalendarIcon,
  ArrowTrendingDownIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface NegotiationCardProps {
  negotiation: NegotiationSummary;
  userRole: 'CUSTOMER' | 'ARTISAN';
  showProduct?: boolean;
  showUser?: boolean;
  onClick?: () => void;
}

export const NegotiationCard: React.FC<NegotiationCardProps> = ({
  negotiation,
  userRole,
  showProduct = true,
  showUser = true,
  onClick,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusConfig = (status: NegotiationStatus) => {
    const configs = {
      [NegotiationStatus.PENDING]: {
        variant: 'warning' as const,
        label: 'Chờ phản hồi',
        icon: ClockIcon,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-800',
        iconColor: 'text-amber-600',
      },
      [NegotiationStatus.COUNTER_OFFERED]: {
        variant: 'info' as const,
        label: 'Đề nghị mới',
        icon: ArrowPathIcon,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
      },
      [NegotiationStatus.ACCEPTED]: {
        variant: 'success' as const,
        label: 'Đã chấp nhận',
        icon: CheckCircleIcon,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-600',
      },
      [NegotiationStatus.REJECTED]: {
        variant: 'danger' as const,
        label: 'Đã từ chối',
        icon: XCircleIcon,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
      },
      [NegotiationStatus.EXPIRED]: {
        variant: 'secondary' as const,
        label: 'Đã hết hạn',
        icon: ClockIcon,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-600',
        iconColor: 'text-gray-500',
      },
      [NegotiationStatus.COMPLETED]: {
        variant: 'success' as const,
        label: 'Đã hoàn thành',
        icon: CheckCircleIcon,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-600',
      },
    };

    return configs[status];
  };

  const statusConfig = getStatusConfig(negotiation.status);
  const StatusIcon = statusConfig.icon;

  const isExpired =
    negotiation.expiresAt && new Date(negotiation.expiresAt) < new Date();
  const discountPercent = Math.round(
    ((negotiation.originalPrice - negotiation.proposedPrice) /
      negotiation.originalPrice) *
      100,
  );

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group ${
        onClick ? 'cursor-pointer' : ''
      } ${statusConfig.borderColor}`}
      onClick={handleClick}
    >
      {/* Status Bar */}
      <div className={`h-1 ${statusConfig.bgColor}`} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {/* Product Image */}
            {showProduct && negotiation.productImages?.[0] && (
              <div className="relative flex-shrink-0">
                <img
                  src={negotiation.productImages[0]}
                  alt={negotiation.productName}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-gray-100"
                />
                {/* Variant Indicator */}
                {negotiation.variantId && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                    <SwatchIcon className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Product Name */}
              {showProduct && (
                <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                  {negotiation.productName}
                </h3>
              )}

              {/* Variant Info */}
              {negotiation.variantName && (
                <div className="flex items-center mb-2">
                  <SwatchIcon className="w-3 h-3 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-700 font-medium">
                    {negotiation.variantName}
                  </span>
                </div>
              )}

              {/* Variant Attributes */}
              {negotiation.variantAttributes &&
                Object.keys(negotiation.variantAttributes).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {Object.entries(negotiation.variantAttributes)
                      .slice(0, 2)
                      .map(([key, value]) => (
                        <span
                          key={key}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                        >
                          {key}: {value}
                        </span>
                      ))}
                    {Object.keys(negotiation.variantAttributes).length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500">
                        +{Object.keys(negotiation.variantAttributes).length - 2}
                      </span>
                    )}
                  </div>
                )}

              {/* User Info */}
              {showUser &&
                (userRole === 'CUSTOMER'
                  ? negotiation.artisan
                  : negotiation.customer) && (
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <UserIcon className="w-4 h-4 mr-1" />
                    <span className="mr-1">
                      {userRole === 'CUSTOMER' ? 'Nghệ nhân:' : 'Khách hàng:'}
                    </span>
                    <span className="font-medium text-gray-900">
                      {userRole === 'CUSTOMER'
                        ? negotiation.artisan?.name
                        : negotiation.customer?.name}
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}
          >
            <div className="flex items-center">
              <StatusIcon
                className={`w-3 h-3 mr-1 ${statusConfig.iconColor}`}
              />
              <span className={`text-xs font-medium ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Giá gốc</p>
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(negotiation.originalPrice)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Giá đề nghị</p>
              <p className="text-lg font-bold text-blue-600">
                {formatPrice(negotiation.proposedPrice)}
              </p>
            </div>
          </div>

          {/* Final Price */}
          {negotiation.finalPrice && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Giá thỏa thuận</p>
              <p className="text-xl font-bold text-green-600">
                {formatPrice(negotiation.finalPrice)}
              </p>
            </div>
          )}

          {/* Savings */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center">
              <ArrowTrendingDownIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-gray-600">
                Số lượng: {negotiation.quantity}
              </span>
            </div>
            {discountPercent > 0 && (
              <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
                <span className="text-sm font-semibold text-green-700">
                  -{discountPercent}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500 space-x-3">
            <div className="flex items-center">
              <CalendarIcon className="w-3 h-3 mr-1" />
              <span>
                {new Date(negotiation.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            {negotiation.expiresAt && (
              <div
                className={`flex items-center ${
                  isExpired ? 'text-red-600' : ''
                }`}
              >
                <ClockIcon className="w-3 h-3 mr-1" />
                <span>
                  Hết hạn:{' '}
                  {new Date(negotiation.expiresAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>

          <Link
            to={`/negotiations/${negotiation.id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <EyeIcon className="w-3 h-3 mr-1" />
            Chi tiết
          </Link>
        </div>

        {/* Urgent indicator */}
        {negotiation.status === NegotiationStatus.PENDING &&
          negotiation.expiresAt &&
          new Date(negotiation.expiresAt).getTime() - new Date().getTime() <
            24 * 60 * 60 * 1000 && (
            <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center text-orange-800">
                <ClockIcon className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium">
                  Sắp hết hạn! Cần phản hồi trong 24h
                </span>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
