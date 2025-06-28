import React from 'react';
import { useForm } from '../../hooks/common/useForm';
import { usePriceNegotiation } from '../../hooks/price-negotiation/usePriceNegotiation';
import { RespondToNegotiationRequest } from '../../types/price-negotiation';
import { PriceNegotiationWithDetails } from '../../types/price-negotiation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  SwatchIcon,
  UserIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface RespondToNegotiationFormProps {
  negotiation: PriceNegotiationWithDetails;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const RespondToNegotiationForm: React.FC<
  RespondToNegotiationFormProps
> = ({ negotiation, onSuccess, onCancel }) => {
  const { respondToNegotiation, loading } = usePriceNegotiation();

  // Get the negotiation history to show previous offers
  const negotiationHistory = (negotiation.negotiationHistory as any[]) || [];
  const previousOffers = negotiationHistory.slice(-5); // Show last 5 offers

  const validate = (
    values: RespondToNegotiationRequest & { counterPrice?: number },
  ) => {
    const errors: Record<string, string> = {};

    if (values.action === 'COUNTER') {
      if (!values.counterPrice || values.counterPrice <= 0) {
        errors.counterPrice = 'Vui lòng nhập giá đề nghị';
      } else if (values.counterPrice >= negotiation.originalPrice) {
        errors.counterPrice = 'Giá đề nghị phải thấp hơn giá gốc';
      } else if (values.counterPrice <= negotiation.proposedPrice) {
        errors.counterPrice = 'Giá đề nghị phải cao hơn giá khách hàng đề xuất';
      }
    }

    if (values.artisanResponse && values.artisanResponse.length > 1000) {
      errors.artisanResponse = 'Phản hồi không được quá 1000 ký tự';
    }

    return errors;
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useForm<RespondToNegotiationRequest & { counterPrice?: number }>({
    initialValues: {
      action: 'ACCEPT',
      counterPrice: Math.round(
        (negotiation.proposedPrice + negotiation.originalPrice) / 2,
      ),
      artisanResponse: '',
    },
    validate,
    onSubmit: async (data) => {
      // FIXED: Filter out counterPrice if action is not COUNTER
      const payload: RespondToNegotiationRequest = {
        action: data.action,
        artisanResponse: data.artisanResponse,
      };

      // Only include counterPrice if action is COUNTER
      if (data.action === 'COUNTER' && data.counterPrice) {
        payload.counterPrice = data.counterPrice;
      }

      await respondToNegotiation(negotiation.id, payload);
      resetForm();
      onSuccess?.();
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const counterDiscountPercent = values.counterPrice
    ? Math.round(
        ((negotiation.originalPrice - values.counterPrice) /
          negotiation.originalPrice) *
          100,
      )
    : 0;

  return (
    <Card className="p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        Phản hồi thương lượng
      </h4>

      {/* NEW: Negotiation History */}
      {previousOffers.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-200">
          <h5 className="font-medium text-blue-900 mb-3 flex items-center">
            <ClockIcon className="w-4 h-4 mr-2" />
            Lịch sử thương lượng
          </h5>
          <div className="space-y-3">
            {previousOffers.reverse().map((offer, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  index === 0
                    ? 'bg-blue-100 border-2 border-blue-300 shadow-sm'
                    : 'bg-white border border-blue-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        offer.actor === 'customer'
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <UserIcon
                      className={`w-4 h-4 ${
                        offer.actor === 'customer'
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {offer.actor === 'customer' ? 'Khách hàng' : 'Bạn'}
                      </span>
                      <Badge
                        size="sm"
                        variant={
                          offer.action === 'PROPOSE'
                            ? 'info'
                            : offer.action === 'COUNTER'
                            ? 'warning'
                            : offer.action === 'ACCEPT'
                            ? 'success'
                            : 'danger'
                        }
                      >
                        {offer.action === 'PROPOSE'
                          ? 'Đề nghị'
                          : offer.action === 'COUNTER'
                          ? 'Phản hồi'
                          : offer.action === 'ACCEPT'
                          ? 'Chấp nhận'
                          : 'Từ chối'}
                      </Badge>
                    </div>
                    {offer.response && (
                      <p className="text-xs text-gray-600 mt-1 max-w-xs truncate">
                        "{offer.response}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold ${
                      offer.actor === 'customer'
                        ? 'text-green-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {formatPrice(
                      offer.newPrice || offer.price || offer.acceptedPrice,
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(offer.timestamp).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-3 border-t border-blue-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-700 font-medium">
                Tổng số lượt thương lượng: {previousOffers.length}
              </span>
              <span className="text-blue-700">
                Tiết kiệm hiện tại:{' '}
                {formatPrice(
                  negotiation.originalPrice - negotiation.proposedPrice,
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Current Negotiation Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        {/* Product header with variant */}
        <div className="flex items-start space-x-3 mb-4">
          <img
            src={
              negotiation.variant?.images[0] || negotiation.product.images[0]
            }
            alt={negotiation.product.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <h5 className="font-medium text-gray-900">
              {negotiation.product.name}
            </h5>
            {/* NEW: Variant information */}
            {negotiation.variant && (
              <div className="mt-1">
                <div className="flex items-center gap-1 text-sm text-blue-700">
                  <SwatchIcon className="w-3 h-3" />
                  <span>
                    Tùy chọn: {negotiation.variant.name || 'Biến thể'}
                  </span>
                </div>
                {Object.keys(negotiation.variant.attributes).length > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    {Object.entries(negotiation.variant.attributes)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Price grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Giá gốc của bạn:</span>
            <p className="font-medium">
              {formatPrice(negotiation.originalPrice)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Khách hàng đề nghị:</span>
            <p className="font-medium text-blue-600">
              {formatPrice(negotiation.proposedPrice)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Số lượng:</span>
            <p className="font-medium">{negotiation.quantity}</p>
          </div>
          <div>
            <span className="text-gray-600">Khách hàng muốn tiết kiệm:</span>
            <p className="font-medium text-green-600">
              {formatPrice(
                (negotiation.originalPrice - negotiation.proposedPrice) *
                  negotiation.quantity,
              )}
            </p>
          </div>
        </div>

        {/* Customer info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <UserIcon className="w-5 h-5 text-gray-500" />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Khách hàng:
              </span>
              <p className="font-medium text-gray-900">
                {negotiation.customer.firstName} {negotiation.customer.lastName}
                <span className="text-gray-500 ml-2">
                  @{negotiation.customer.username}
                </span>
              </p>
            </div>
          </div>
        </div>

        {negotiation.customerReason && (
          <div className="pt-4 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700 block mb-2">
              Lý do từ khách hàng:
            </span>
            <p className="text-sm text-gray-600 bg-white p-3 rounded border">
              {negotiation.customerReason}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Action Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Phản hồi của bạn
          </label>
          <div className="space-y-3">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="action"
                value="ACCEPT"
                checked={values.action === 'ACCEPT'}
                onChange={handleChange}
                className="h-4 w-4 text-primary"
              />
              <CheckCircleIcon className="w-5 h-5 text-green-600 ml-2 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Chấp nhận</div>
                <div className="text-sm text-gray-600">
                  Đồng ý bán với giá {formatPrice(negotiation.proposedPrice)}
                </div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="action"
                value="COUNTER"
                checked={values.action === 'COUNTER'}
                onChange={handleChange}
                className="h-4 w-4 text-primary"
              />
              <ArrowPathIcon className="w-5 h-5 text-blue-600 ml-2 mr-3" />
              <div>
                <div className="font-medium text-gray-900">
                  Đề nghị giá khác
                </div>
                <div className="text-sm text-gray-600">
                  Gửi mức giá phù hợp hơn cho cả hai bên
                </div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="action"
                value="REJECT"
                checked={values.action === 'REJECT'}
                onChange={handleChange}
                className="h-4 w-4 text-primary"
              />
              <XCircleIcon className="w-5 h-5 text-red-600 ml-2 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Từ chối</div>
                <div className="text-sm text-gray-600">
                  Không thể chấp nhận yêu cầu này
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Counter Price Input */}
        {values.action === 'COUNTER' && (
          <div>
            <Input
              name="counterPrice"
              label="Giá bạn đề nghị"
              type="number"
              value={values.counterPrice || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.counterPrice ? errors.counterPrice : undefined}
              required
              min={negotiation.proposedPrice + 1}
              max={negotiation.originalPrice - 1}
            />
            {values.counterPrice && values.counterPrice > 0 && (
              <div className="mt-2 flex items-center justify-between">
                <Badge
                  variant={counterDiscountPercent > 0 ? 'success' : 'secondary'}
                >
                  {counterDiscountPercent > 0
                    ? `-${counterDiscountPercent}%`
                    : 'Không giảm'}
                </Badge>
                <span className="text-sm text-gray-600">
                  Khách tiết kiệm:{' '}
                  {formatPrice(
                    (negotiation.originalPrice - values.counterPrice) *
                      negotiation.quantity,
                  )}
                </span>
              </div>
            )}

            {/* Price comparison */}
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-700 space-y-1">
                <div className="flex justify-between">
                  <span>Khách đề nghị:</span>
                  <span className="font-medium">
                    {formatPrice(negotiation.proposedPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bạn đề nghị:</span>
                  <span className="font-medium">
                    {formatPrice(values.counterPrice || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Giá gốc:</span>
                  <span className="font-medium">
                    {formatPrice(negotiation.originalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Response Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tin nhắn cho khách hàng (tùy chọn)
          </label>
          <textarea
            name="artisanResponse"
            rows={3}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            value={values.artisanResponse}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Cảm ơn bạn đã quan tâm đến sản phẩm của tôi..."
            maxLength={1000}
          />
          {touched.artisanResponse && errors.artisanResponse && (
            <p className="mt-1 text-sm text-red-600">
              {errors.artisanResponse}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              onCancel?.();
            }}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            loading={loading || isSubmitting}
            disabled={loading || isSubmitting}
            className="flex-1"
          >
            {values.action === 'ACCEPT' && 'Chấp nhận thương lượng'}
            {values.action === 'COUNTER' && 'Gửi đề nghị mới'}
            {values.action === 'REJECT' && 'Từ chối thương lượng'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
