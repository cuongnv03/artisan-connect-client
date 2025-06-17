import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfileManagement } from '../../hooks/profile/useProfileManagement';
import { useForm } from '../../hooks/useForm';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { UpdateUserDto } from '../../types/user';

export const BasicInfoSection: React.FC = () => {
  const { state: authState } = useAuth();
  const { updateBasicProfile, loading } = useProfileManagement();

  const { values, handleChange, handleSubmit, errors } = useForm<UpdateUserDto>(
    {
      initialValues: {
        firstName: authState.user?.firstName || '',
        lastName: authState.user?.lastName || '',
        bio: authState.user?.bio || '',
        phone: authState.user?.phone || '',
      },
      validate: (values) => {
        const errors: Record<string, string> = {};
        if (!values.firstName?.trim()) errors.firstName = 'Tên là bắt buộc';
        if (!values.lastName?.trim()) errors.lastName = 'Họ là bắt buộc';
        return errors;
      },
      onSubmit: updateBasicProfile,
    },
  );

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Thông tin cơ bản
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Họ"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
          />
          <Input
            label="Tên"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giới thiệu bản thân
          </label>
          <textarea
            name="bio"
            rows={3}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="Viết vài dòng về bản thân..."
            value={values.bio}
            onChange={handleChange}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {values.bio?.length || 0}/500 ký tự
          </p>
        </div>

        <Input
          label="Số điện thoại"
          name="phone"
          type="tel"
          value={values.phone}
          onChange={handleChange}
          placeholder="Ví dụ: 0987654321"
        />

        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Card>
  );
};
