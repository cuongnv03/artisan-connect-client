import React, { useState } from 'react';
import { useForm } from '../../../hooks/useForm';
import { Input } from '../../../components/form/Input';
import { Button } from '../../../components/form/Button';
import { Alert } from '../../../components/feedback/Alert';
import { Address } from '../../../types/api.types';

interface AddressFormProps {
  initialAddress?: Address;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  initialAddress,
  onSubmit,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialValues = {
    fullName: initialAddress?.fullName || '',
    phone: initialAddress?.phone || '',
    street: initialAddress?.street || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    zipCode: initialAddress?.zipCode || '',
    country: initialAddress?.country || '',
    isDefault: initialAddress?.isDefault || false,
  };

  const validate = (values: any) => {
    const errors: Record<string, string> = {};

    if (!values.fullName) {
      errors.fullName = 'Full name is required';
    }

    if (!values.street) {
      errors.street = 'Street address is required';
    }

    if (!values.city) {
      errors.city = 'City is required';
    }

    if (!values.state) {
      errors.state = 'State/Province is required';
    }

    if (!values.zipCode) {
      errors.zipCode = 'ZIP/Postal code is required';
    }

    if (!values.country) {
      errors.country = 'Country is required';
    }

    return errors;
  };

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useForm({
      initialValues,
      validate,
      onSubmit: async (formValues) => {
        try {
          setIsSubmitting(true);
          setError(null);
          await onSubmit(formValues);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsSubmitting(false);
        }
      },
    });

  return (
    <div>
      {error && (
        <Alert
          type="error"
          variant="subtle"
          dismissible
          onDismiss={() => setError(null)}
          className="mb-6"
        >
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Full Name"
          name="fullName"
          id="fullName"
          value={values.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.fullName ? errors.fullName : ''}
          required
        />

        <Input
          label="Phone Number"
          name="phone"
          id="phone"
          value={values.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.phone ? errors.phone : ''}
          helperText="Optional"
        />

        <Input
          label="Street Address"
          name="street"
          id="street"
          value={values.street}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.street ? errors.street : ''}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="City"
            name="city"
            id="city"
            value={values.city}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.city ? errors.city : ''}
            required
          />

          <Input
            label="State/Province"
            name="state"
            id="state"
            value={values.state}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.state ? errors.state : ''}
            required
          />

          <Input
            label="ZIP/Postal Code"
            name="zipCode"
            id="zipCode"
            value={values.zipCode}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.zipCode ? errors.zipCode : ''}
            required
          />

          <Input
            label="Country"
            name="country"
            id="country"
            value={values.country}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.country ? errors.country : ''}
            required
          />
        </div>

        <div className="flex items-center">
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
            className="ml-2 block text-sm text-gray-700"
          >
            Set as default address
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={Object.keys(errors).length > 0}
          >
            {initialAddress ? 'Update Address' : 'Add Address'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
