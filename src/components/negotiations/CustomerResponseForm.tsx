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
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface CustomerResponseFormProps {
  negotiation: PriceNegotiationWithDetails;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CustomerResponseForm: React.FC<CustomerResponseFormProps> = ({
  negotiation,
  onSuccess,
  onCancel,
}) => {
  const { respondToNegotiation, loading } = usePriceNegotiation();

  // Get the negotiation history to show previous offers
  const negotiationHistory = (negotiation.negotiationHistory as any[]) || [];
  const lastOffer = negotiationHistory[negotiationHistory.length - 1];
  const previousOffers = negotiationHistory.slice(-3); // Show last 3 offers

  const validate = (
    values: RespondToNegotiationRequest & { counterPrice?: number },
  ) => {
    const errors: Record<string, string> = {};

    if (values.action === 'COUNTER') {
      if (!values.counterPrice || values.counterPrice <= 0) {
        errors.counterPrice = 'Vui lòng nhập giá đề nghị';
      } else if (values.counterPrice >= negotiation.originalPrice) {
        errors.counterPrice = 'Giá đề nghị phải thấp hơn giá gốc';
      } else if (values.counterPrice <= 0) {
        errors.counterPrice = 'Giá đề nghị phải lớn hơn 0';
      }
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
      customerResponse: '',
    },
    validate,
    onSubmit: async (data) => {
      const payload: RespondToNegotiationRequest = {
        action: data.action,
        customerResponse: data.customerResponse,
      };

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
        Phản hồi đề nghị từ nghệ nhân
      </h4>

      {/* Show negotiation history */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h5 className="font-medium text-blue-900 mb-3">Lịch sử thương lượng</h5>
        <div className="space-y-3">
          {previousOffers.reverse().map((offer, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === 0
                  ? 'bg-blue-100 border border-blue-300'
                  : 'bg-white border border-blue-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    offer.actor === 'customer' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                />
                <div>
                  <span className="font-medium">
                    {offer.actor === 'customer' ? 'Bạn' : 'Nghệ nhân'}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    {offer.action === 'PROPOSE'
                      ? 'đề nghị'
                      : offer.action === 'COUNTER'
                      ? 'phản hồi'
                      : offer.action.toLowerCase()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-primary">
                  {formatPrice(offer.newPrice || offer.price)}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(offer.timestamp).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current offer details */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
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
            {negotiation.variant && (
              <div className="mt-1">
                <div className="flex items-center gap-1 text-sm text-blue-700">
                  <SwatchIcon className="w-3 h-3" />
                  <span>
                    Tùy chọn: {negotiation.variant.name || 'Biến thể'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Giá gốc:</span>
            <p className="font-medium">
              {formatPrice(negotiation.originalPrice)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Nghệ nhân đề nghị:</span>
            <p className="font-medium text-blue-600">
              {formatPrice(negotiation.proposedPrice)}
            </p>
          </div>
        </div>

        {/* Show artisan's response message */}
        {negotiation.artisanResponse && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700 block mb-2">
              Lời nhắn từ nghệ nhân:
            </span>
            <p className="text-sm text-gray-600 bg-white p-3 rounded border">
              {negotiation.artisanResponse}
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
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
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
                  Đồng ý với giá {formatPrice(negotiation.proposedPrice)}
                </div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
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
                  Tiếp tục thương lượng với giá khác
                </div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
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
                  Không chấp nhận đề nghị này
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
              min={1}
              max={negotiation.originalPrice - 1}
              leftIcon={
                <ArrowTrendingDownIcon className="w-4 h-4 text-gray-400" />
              }
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
                  Bạn tiết kiệm:{' '}
                  {formatPrice(negotiation.originalPrice - values.counterPrice)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Response Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tin nhắn cho nghệ nhân (tùy chọn)
          </label>
          <textarea
            name="customerResponse"
            rows={3}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            value={values.customerResponse}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Cảm ơn bạn đã phản hồi..."
            maxLength={1000}
          />
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
            {values.action === 'ACCEPT' && 'Chấp nhận đề nghị'}
            {values.action === 'COUNTER' && 'Gửi đề nghị mới'}
            {values.action === 'REJECT' && 'Từ chối đề nghị'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
