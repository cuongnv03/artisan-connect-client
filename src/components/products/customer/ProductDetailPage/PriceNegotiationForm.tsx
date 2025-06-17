import React, { useState } from 'react';
import { useForm } from '../../../../hooks/common/useForm';
import { usePriceNegotiation } from '../../../../hooks/price-negotiation/usePriceNegotiation';
import { CreateNegotiationRequest } from '../../../../types/price-negotiation';
import { Product } from '../../../../types/product';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface PriceNegotiationFormProps {
  product: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PriceNegotiationForm: React.FC<PriceNegotiationFormProps> = ({
  product,
  onSuccess,
  onCancel,
}) => {
  const { createNegotiation, loading } = usePriceNegotiation();
  const [showForm, setShowForm] = useState(false);

  const currentPrice = product.discountPrice || product.price;
  const minAcceptablePrice = currentPrice * 0.3; // 30% of original price

  const validate = (values: CreateNegotiationRequest) => {
    const errors: Record<string, string> = {};

    if (!values.proposedPrice || values.proposedPrice <= 0) {
      errors.proposedPrice = 'Vui lòng nhập giá đề nghị';
    } else if (values.proposedPrice >= currentPrice) {
      errors.proposedPrice = 'Giá đề nghị phải thấp hơn giá hiện tại';
    } else if (values.proposedPrice < minAcceptablePrice) {
      errors.proposedPrice = `Giá đề nghị quá thấp (tối thiểu ${formatPrice(
        minAcceptablePrice,
      )})`;
    }

    if (
      values.quantity &&
      (values.quantity <= 0 || values.quantity > product.quantity)
    ) {
      errors.quantity = `Số lượng phải từ 1 đến ${product.quantity}`;
    }

    if (values.customerReason && values.customerReason.length > 1000) {
      errors.customerReason = 'Lý do không được quá 1000 ký tự';
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
    resetForm,
  } = useForm<CreateNegotiationRequest>({
    initialValues: {
      productId: product.id,
      proposedPrice: Math.round(currentPrice * 0.8), // Default 20% discount
      quantity: 1,
      customerReason: '',
      expiresInDays: 3,
    },
    validate,
    onSubmit: async (data) => {
      await createNegotiation(data);
      resetForm();
      setShowForm(false);
      onSuccess?.();
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const discountPercent = Math.round(
    ((currentPrice - values.proposedPrice) / currentPrice) * 100,
  );

  if (!product.allowNegotiation) {
    return null;
  }

  if (!showForm) {
    return (
      <Card className="p-4 border border-blue-200 bg-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <h4 className="font-medium text-blue-900">Thương lượng giá</h4>
              <p className="text-sm text-blue-700">
                Sản phẩm này cho phép thương lượng giá
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
          >
            Thương lượng
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary mr-2" />
        <h4 className="font-semibold text-gray-900">
          Thương lượng giá sản phẩm
        </h4>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Price Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Giá hiện tại:</span>
            <span className="font-semibold">{formatPrice(currentPrice)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Giá tối thiểu:</span>
            <span className="text-sm text-gray-500">
              {formatPrice(minAcceptablePrice)}
            </span>
          </div>
        </div>

        {/* Proposed Price */}
        <div>
          <Input
            name="proposedPrice"
            label="Giá đề nghị"
            type="number"
            value={values.proposedPrice}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.proposedPrice ? errors.proposedPrice : undefined}
            required
            min={minAcceptablePrice}
            max={currentPrice - 1}
          />
          {values.proposedPrice > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <Badge variant={discountPercent > 0 ? 'success' : 'secondary'}>
                {discountPercent > 0 ? `-${discountPercent}%` : 'Không giảm'}
              </Badge>
              <span className="text-sm text-gray-600">
                Tiết kiệm: {formatPrice(currentPrice - values.proposedPrice)}
              </span>
            </div>
          )}
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
            min={1}
            max={product.quantity}
          />
        </div>

        {/* Reason */}
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
            placeholder="VD: Mua số lượng lớn, khách hàng thân thiết..."
            maxLength={1000}
          />
          {touched.customerReason && errors.customerReason && (
            <p className="mt-1 text-sm text-red-600">{errors.customerReason}</p>
          )}
        </div>

        {/* Expiration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thời hạn chờ phản hồi
          </label>
          <select
            name="expiresInDays"
            value={values.expiresInDays}
            onChange={handleChange}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value={1}>1 ngày</option>
            <option value={2}>2 ngày</option>
            <option value={3}>3 ngày</option>
            <option value={5}>5 ngày</option>
            <option value={7}>7 ngày</option>
          </select>
        </div>

        {/* Warning */}
        <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Lưu ý khi thương lượng:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Nghệ nhân có thể chấp nhận, từ chối hoặc đề nghị giá khác</li>
              <li>Yêu cầu sẽ hết hạn sau thời gian đã chọn</li>
              <li>Bạn chỉ có thể có 1 yêu cầu thương lượng cho mỗi sản phẩm</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowForm(false);
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
            leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
            className="flex-1"
          >
            Gửi yêu cầu thương lượng
          </Button>
        </div>
      </form>
    </Card>
  );
};
