import React from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import { useProfileManagement } from '../../hooks/profile/useProfileManagement';
import { useForm } from '../../hooks/common/useForm';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { UpdateProfileDto } from '../../types/user';

export const ExtendedInfoSection: React.FC = () => {
  const { state } = useProfile();
  const { updateExtendedProfile, loading } = useProfileManagement();

  const { values, handleChange, handleSubmit, errors } =
    useForm<UpdateProfileDto>({
      initialValues: {
        location: state.profile?.location || '',
        website: state.profile?.website || '',
        dateOfBirth: state.profile?.dateOfBirth
          ? new Date(state.profile.dateOfBirth).toISOString().split('T')[0]
          : '',
        gender: state.profile?.gender || '',
      },
      validate: (values) => {
        const errors: Record<string, string> = {};
        if (values.website && values.website.trim()) {
          if (
            !values.website.startsWith('http://') &&
            !values.website.startsWith('https://')
          ) {
            errors.website = 'Website phải bắt đầu với http:// hoặc https://';
          }
        }
        return errors;
      },
      onSubmit: updateExtendedProfile,
    });

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Thông tin mở rộng
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Địa chỉ"
          name="location"
          value={values.location}
          onChange={handleChange}
          placeholder="Ví dụ: Hà Nội, Việt Nam"
        />

        <Input
          label="Website"
          name="website"
          type="url"
          value={values.website}
          onChange={handleChange}
          error={errors.website}
          placeholder="https://example.com"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Ngày sinh"
            name="dateOfBirth"
            type="date"
            value={values.dateOfBirth}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giới tính
            </label>
            <select
              name="gender"
              value={values.gender}
              onChange={handleChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
              <option value="prefer_not_to_say">Không muốn tiết lộ</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            Cập nhật thông tin
          </Button>
        </div>
      </form>
    </Card>
  );
};
