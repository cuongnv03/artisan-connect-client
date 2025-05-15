import React from 'react';
import { useForm } from '../../hooks/useForm';
import { Input } from '../../components/form/Input';
import { Button } from '../../components/form/Button';
import { AddressService } from '../../services/address.service';
import { CreateAddressRequest } from '@/types/profile.types';
import { useToast } from '../../hooks/useToast';

interface AddressFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const toast = useToast();

  // Validation function
  const validate = (values: CreateAddressRequest) => {
    const errors: Record<string, string> = {};

    if (!values.fullName) errors.fullName = 'Full name is required';
    if (!values.street) errors.street = 'Street address is required';
    if (!values.city) errors.city = 'City is required';
    if (!values.state) errors.state = 'State/Province is required';
    if (!values.zipCode) errors.zipCode = 'ZIP/Postal code is required';
    if (!values.country) errors.country = 'Country is required';

    return errors;
  };

  // Form hook
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = useForm<CreateAddressRequest>({
    initialValues: {
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: true,
    },
    validate,
    onSubmit: async (formValues) => {
      try {
        await AddressService.createAddress(formValues);
        toast.success('Address added successfully');
        if (onSuccess) onSuccess();
      } catch (error) {
        toast.error('Failed to add address');
        console.error('Address creation error:', error);
      }
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input
            label="Full Name"
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.fullName}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Phone Number (optional)"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phone}
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Street Address"
            name="street"
            value={values.street}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.street}
            required
          />
        </div>

        <Input
          label="City"
          name="city"
          value={values.city}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.city}
          required
        />

        <Input
          label="State/Province"
          name="state"
          value={values.state}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.state}
          required
        />

        <Input
          label="ZIP/Postal Code"
          name="zipCode"
          value={values.zipCode}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.zipCode}
          required
        />

        <Input
          label="Country"
          name="country"
          value={values.country}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.country}
          required
        />

        <div className="md:col-span-2 flex items-center">
          <input
            id="isDefault"
            name="isDefault"
            type="checkbox"
            checked={values.isDefault}
            onChange={handleChange}
            className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
          />
          <label
            htmlFor="isDefault"
            className="ml-2 block text-sm text-gray-900"
          >
            Set as default address
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} type="button">
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" isLoading={isSubmitting}>
          Save Address
        </Button>
      </div>
    </form>
  );
};
