import React, { useState, useMemo } from 'react';
import { useForm } from '../../hooks/common/useForm';
import { usePriceNegotiation } from '../../hooks/price-negotiation/usePriceNegotiation';
import {
  CreateNegotiationRequest,
  PriceNegotiationWithDetails,
} from '../../types/price-negotiation';
import { Product, ProductVariant } from '../../types/product';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';

interface CreateNegotiationFormProps {
  product: Product;
  selectedVariant?: ProductVariant | null;
  onSuccess?: (negotiation?: PriceNegotiationWithDetails) => void; // UPDATED: Pass negotiation data
  onCancel?: () => void;
}

export const CreateNegotiationForm: React.FC<CreateNegotiationFormProps> = ({
  product,
  selectedVariant,
  onSuccess,
  onCancel,
}) => {
  const { createNegotiation, loading } = usePriceNegotiation();
  const [apiError, setApiError] = useState<string>('');

  // Calculate prices based on variant selection
  const {
    currentPrice,
    maxNegotiablePrice,
    minNegotiablePrice,
    displayImages,
  } = useMemo(() => {
    let price: number;
    let images: string[] = product.images;

    if (selectedVariant) {
      price = selectedVariant.discountPrice || selectedVariant.price;
      if (selectedVariant.images.length > 0) {
        images = selectedVariant.images;
      }
    } else {
      price = product.discountPrice || product.price;
    }

    return {
      currentPrice: price,
      maxNegotiablePrice: price * 0.95, // Maximum 5% discount
      minNegotiablePrice: price * 0.7, // Minimum 30% of original price
      displayImages: images,
    };
  }, [product, selectedVariant]);

  const availableQuantity = selectedVariant?.quantity || product.quantity;

  const validate = (values: CreateNegotiationRequest) => {
    const errors: Record<string, string> = {};

    if (!values.proposedPrice || values.proposedPrice <= 0) {
      errors.proposedPrice = 'Vui lòng nhập giá đề nghị';
    } else if (values.proposedPrice >= currentPrice) {
      errors.proposedPrice = 'Giá đề nghị phải thấp hơn giá hiện tại';
    } else if (values.proposedPrice < minNegotiablePrice) {
      errors.proposedPrice = `Giá đề nghị quá thấp. Tối thiểu ${formatPrice(
        minNegotiablePrice,
      )}`;
    }

    if (!values.quantity || values.quantity <= 0) {
      errors.quantity = 'Số lượng phải lớn hơn 0';
    } else if (values.quantity > availableQuantity) {
      errors.quantity = `Chỉ còn ${availableQuantity} sản phẩm${
        selectedVariant ? ` cho tùy chọn này` : ''
      }`;
    }

    if (values.customerReason && values.customerReason.length > 500) {
      errors.customerReason = 'Lý do không được quá 500 ký tự';
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
  } = useForm<CreateNegotiationRequest>({
    initialValues: {
      productId: product.id,
      variantId: selectedVariant?.id, // NEW: Include variant ID
      proposedPrice: Math.round(currentPrice * 0.85),
      quantity: 1,
      customerReason: '',
      expiresInDays: 3,
    },
    validate,
    onSubmit: async (data) => {
      try {
        setApiError('');
        const result = await createNegotiation(data);

        if (result && result.id) {
          resetForm();
          onSuccess?.(result); // UPDATED: Chỉ gọi callback, không navigate
        }
      } catch (error: any) {
        if (
          error.message?.includes('already have an active') ||
          error.message?.includes('Đã tìm thấy')
        ) {
          setApiError('Đã tìm thấy thương lượng hiện tại. Đang tải lại...');
          setTimeout(() => {
            resetForm();
            onSuccess?.(); // This will trigger refetch
          }, 1500);
        } else {
          setApiError(error.message || 'Có lỗi xảy ra khi tạo thương lượng');
        }
      }
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const savingAmount = currentPrice - values.proposedPrice;
  const savingPercent =
    values.proposedPrice > 0
      ? Math.round(((currentPrice - values.proposedPrice) / currentPrice) * 100)
      : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Thương lượng giá sản phẩm
        </h3>
      </div>

      {/* Product Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-start space-x-4">
          <img
            src={displayImages[0]}
            alt={product.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>

            {/* NEW: Variant information */}
            {selectedVariant && (
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <SwatchIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Tùy chọn: {selectedVariant.name || 'Biến thể đã chọn'}
                  </span>
                </div>
                {Object.keys(selectedVariant.attributes).length > 0 && (
                  <div className="text-xs text-gray-600">
                    {Object.entries(selectedVariant.attributes)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Giá hiện tại:</span>
                <p className="font-bold text-primary">
                  {formatPrice(currentPrice)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Còn lại:</span>
                <p className="font-medium">{availableQuantity}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <h4 className="font-medium text-red-900">
                Không thể tạo thương lượng
              </h4>
              <p className="text-sm text-red-700 mt-1">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Proposed Price */}
        <div>
          <Input
            name="proposedPrice"
            label="Giá bạn mong muốn"
            type="number"
            step="any"
            value={values.proposedPrice}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.proposedPrice ? errors.proposedPrice : undefined}
            required
            min={minNegotiablePrice}
            max={maxNegotiablePrice}
            leftIcon={<CurrencyDollarIcon className="w-4 h-4 text-gray-400" />}
          />

          {values.proposedPrice > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <Badge variant={savingPercent > 0 ? 'success' : 'secondary'}>
                {savingPercent > 0 ? `-${savingPercent}%` : 'Không giảm'}
              </Badge>
              <span className="text-sm text-gray-600">
                Tiết kiệm: {formatPrice(savingAmount)}
              </span>
            </div>
          )}

          <div className="mt-2 text-xs text-gray-500">
            Khoảng thương lượng: {formatPrice(minNegotiablePrice)} -{' '}
            {formatPrice(maxNegotiablePrice)}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <Input
            name="quantity"
            label="Số lượng"
            type="number"
            value={values.quantity}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.quantity ? errors.quantity : undefined}
            required
            min={1}
            max={availableQuantity}
          />
        </div>

        {/* Customer Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lý do thương lượng (tùy chọn)
          </label>
          <textarea
            name="customerReason"
            rows={3}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            value={values.customerReason}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Ví dụ: Mua số lượng lớn, khách hàng thân thiết, sinh viên..."
            maxLength={500}
          />
          {touched.customerReason && errors.customerReason && (
            <p className="mt-1 text-sm text-red-600">{errors.customerReason}</p>
          )}
        </div>

        {/* Expiration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thời hạn phản hồi
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[1, 3, 7].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setFieldValue('expiresInDays', days)}
                className={`p-3 rounded-lg border text-center ${
                  values.expiresInDays === days
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ClockIcon className="w-4 h-4 mx-auto mb-1" />
                <div className="text-sm font-medium">{days} ngày</div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Tóm tắt thương lượng
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Sản phẩm:</span>
              <span className="text-blue-900 font-medium">
                {product.name}
                {selectedVariant && ` (${selectedVariant.name || 'Tùy chọn'})`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Giá gốc:</span>
              <span className="text-blue-900 font-medium">
                {formatPrice(currentPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Giá đề nghị:</span>
              <span className="text-blue-900 font-bold">
                {formatPrice(values.proposedPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Số lượng:</span>
              <span className="text-blue-900 font-medium">
                {values.quantity}
              </span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-1">
              <span className="text-blue-700">Tổng tiết kiệm:</span>
              <span className="text-green-600 font-bold">
                {formatPrice(savingAmount * values.quantity)}
              </span>
            </div>
          </div>
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
            Gửi yêu cầu thương lượng
          </Button>
        </div>
      </form>
    </Card>
  );
};
