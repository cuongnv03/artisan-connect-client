import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Address, CreateAddressRequest } from '../../types/user';

interface AddressFormProps {
  address?: Address | null;
  onSubmit: (data: CreateAddressRequest) => Promise<void>;
  onCancel: () => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSubmit,
  onCancel,
}) => {
  const { state: authState } = useAuth();
  const [submitting, setSubmitting] = React.useState(false);

  const { values, handleChange, handleSubmit, errors } =
    useForm<CreateAddressRequest>({
      initialValues: {
        fullName:
          address?.fullName ||
          `${authState.user?.firstName || ''} ${
            authState.user?.lastName || ''
          }`.trim(),
        phone: address?.phone || authState.user?.phone || '',
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        zipCode: address?.zipCode || '',
        country: address?.country || 'Việt Nam',
        isDefault: address?.isDefault || false,
      },
      validate: (values) => {
        const errors: Record<string, string> = {};
        if (!values.fullName.trim()) errors.fullName = 'Họ tên là bắt buộc';
        if (!values.street.trim()) errors.street = 'Địa chỉ cụ thể là bắt buộc';
        if (!values.city.trim()) errors.city = 'Thành phố là bắt buộc';
        if (!values.state.trim()) errors.state = 'Tỉnh/Thành phố là bắt buộc';
        if (!values.zipCode.trim()) errors.zipCode = 'Mã bưu điện là bắt buộc';
        if (!values.country.trim()) errors.country = 'Quốc gia là bắt buộc';
        return errors;
      },
      onSubmit: async (data) => {
        setSubmitting(true);
        try {
          await onSubmit(data);
        } finally {
          setSubmitting(false);
        }
      },
    });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Họ và tên"
        name="fullName"
        value={values.fullName}
        onChange={handleChange}
        error={errors.fullName}
        required
      />

      <Input
        label="Số điện thoại"
        name="phone"
        type="tel"
        value={values.phone}
        onChange={handleChange}
        placeholder="Ví dụ: 0987654321"
      />

      <Input
        label="Địa chỉ cụ thể"
        name="street"
        value={values.street}
        onChange={handleChange}
        error={errors.street}
        required
        placeholder="Số nhà, tên đường, phường/xã"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Thành phố"
          name="city"
          value={values.city}
          onChange={handleChange}
          error={errors.city}
          required
        />

        <Input
          label="Tỉnh/Thành phố"
          name="state"
          value={values.state}
          onChange={handleChange}
          error={errors.state}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Mã bưu điện"
          name="zipCode"
          value={values.zipCode}
          onChange={handleChange}
          error={errors.zipCode}
          required
        />

        <Input
          label="Quốc gia"
          name="country"
          value={values.country}
          onChange={handleChange}
          error={errors.country}
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={values.isDefault}
          onChange={handleChange}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
          Đặt làm địa chỉ mặc định
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Hủy
        </Button>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {address ? 'Cập nhật' : 'Thêm địa chỉ'}
        </Button>
      </div>
    </form>
  );
};
