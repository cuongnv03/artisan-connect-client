import React from 'react';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Dropdown';
import { Toggle } from '../../../ui/Toggle';

interface ShippingInfoEditorProps {
  shippingInfo?: Record<string, any> | null;
  onChange: (shippingInfo: Record<string, any>) => void;
}

export const ShippingInfoEditor: React.FC<ShippingInfoEditorProps> = ({
  shippingInfo = {},
  onChange,
}) => {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...shippingInfo,
      [field]: value,
    });
  };

  const shippingMethods = [
    { label: 'Giao hàng tiêu chuẩn', value: 'standard' },
    { label: 'Giao hàng nhanh', value: 'express' },
    { label: 'Giao hàng siêu tốc', value: 'same_day' },
    { label: 'Khách đến lấy', value: 'pickup' },
  ];

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Thông tin vận chuyển
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Phương thức vận chuyển"
          value={shippingInfo?.method || ''}
          onChange={(value) => handleChange('method', value)}
          options={[
            { label: 'Chọn phương thức', value: '' },
            ...shippingMethods,
          ]}
        />

        <Input
          label="Phí vận chuyển (VNĐ)"
          type="number"
          value={shippingInfo?.fee || ''}
          onChange={(e) =>
            handleChange('fee', e.target.value ? parseFloat(e.target.value) : 0)
          }
          min={0}
        />

        <Input
          label="Thời gian giao hàng (ngày)"
          type="number"
          value={shippingInfo?.deliveryDays || ''}
          onChange={(e) =>
            handleChange(
              'deliveryDays',
              e.target.value ? parseInt(e.target.value) : undefined,
            )
          }
          min={1}
        />

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">
              Miễn phí vận chuyển
            </label>
            <p className="text-sm text-gray-500">
              Miễn phí giao hàng cho sản phẩm này
            </p>
          </div>
          <Toggle
            checked={shippingInfo?.freeShipping || false}
            onChange={(checked) => handleChange('freeShipping', checked)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ghi chú vận chuyển
        </label>
        <textarea
          rows={3}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          value={shippingInfo?.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Ghi chú về đóng gói, vận chuyển..."
        />
      </div>
    </div>
  );
};
