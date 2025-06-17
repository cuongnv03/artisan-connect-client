import React from 'react';
import {
  BriefcaseIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useForm } from '../../../hooks/useForm';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card } from '../../ui/Card';

const ARTISAN_SPECIALTIES = [
  'Gốm sứ',
  'Thêu tay',
  'Đồ gỗ',
  'Tranh vẽ',
  'Đồ da',
  'Trang sức',
  'Đan lát',
  'Điêu khắc',
  'Khắc gỗ',
  'Dệt thổ cẩm',
  'Làm bánh',
  'Nến thơm',
  'Soap handmade',
  'Đồ decor',
  'Khác',
];

interface UpgradeFormData {
  shopName: string;
  shopDescription: string;
  specialties: string;
  experience: string;
  website: string;
  reason: string;
  facebook: string;
  instagram: string;
  youtube: string;
}

interface UpgradeRequestFormProps {
  onSubmit: (data: UpgradeFormData) => Promise<void>;
  loading: boolean;
}

export const UpgradeRequestForm: React.FC<UpgradeRequestFormProps> = ({
  onSubmit,
  loading,
}) => {
  const { values, handleChange, handleSubmit, errors, setFieldValue } =
    useForm<UpgradeFormData>({
      initialValues: {
        shopName: '',
        shopDescription: '',
        specialties: '',
        experience: '',
        website: '',
        reason: '',
        facebook: '',
        instagram: '',
        youtube: '',
      },
      validate: (values) => {
        const errors: Record<string, string> = {};

        if (!values.shopName.trim()) {
          errors.shopName = 'Tên cửa hàng là bắt buộc';
        } else if (values.shopName.length < 3) {
          errors.shopName = 'Tên cửa hàng phải có ít nhất 3 ký tự';
        } else if (values.shopName.length > 100) {
          errors.shopName = 'Tên cửa hàng không được quá 100 ký tự';
        }

        if (!values.shopDescription.trim()) {
          errors.shopDescription = 'Mô tả cửa hàng là bắt buộc';
        } else if (values.shopDescription.length < 50) {
          errors.shopDescription = 'Mô tả phải có ít nhất 50 ký tự';
        } else if (values.shopDescription.length > 1000) {
          errors.shopDescription = 'Mô tả không được quá 1000 ký tự';
        }

        if (!values.specialties.trim()) {
          errors.specialties = 'Chuyên môn là bắt buộc';
        }

        if (!values.experience.trim()) {
          errors.experience = 'Kinh nghiệm là bắt buộc';
        } else {
          const exp = parseInt(values.experience);
          if (isNaN(exp) || exp < 0) {
            errors.experience = 'Kinh nghiệm phải là số và không được âm';
          } else if (exp > 100) {
            errors.experience = 'Kinh nghiệm không được quá 100 năm';
          }
        }

        if (!values.reason.trim()) {
          errors.reason = 'Lý do là bắt buộc';
        } else if (values.reason.length < 100) {
          errors.reason = 'Lý do phải có ít nhất 100 ký tự';
        } else if (values.reason.length > 1000) {
          errors.reason = 'Lý do không được quá 1000 ký tự';
        }

        return errors;
      },
      onSubmit,
    });

  return (
    <Card className="p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Thông tin đăng ký
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BriefcaseIcon className="w-5 h-5 mr-2" />
            Thông tin cơ bản
          </h3>

          <Input
            label="Tên cửa hàng"
            name="shopName"
            value={values.shopName}
            onChange={handleChange}
            error={errors.shopName}
            placeholder="VD: Gốm sứ Bát Tràng"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả cửa hàng <span className="text-red-500">*</span>
            </label>
            <textarea
              name="shopDescription"
              rows={4}
              className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                errors.shopDescription
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : ''
              }`}
              placeholder="Giới thiệu về cửa hàng, sản phẩm chính, phong cách... (tối thiểu 50 ký tự)"
              value={values.shopDescription}
              onChange={handleChange}
            />
            {errors.shopDescription && (
              <p className="mt-1 text-sm text-red-600">
                {errors.shopDescription}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {values.shopDescription.length}/50 ký tự tối thiểu
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chuyên môn/Lĩnh vực <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="specialties"
              className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                errors.specialties
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : ''
              }`}
              placeholder="VD: Gốm sứ, Thêu tay, Đồ gỗ (phân cách bằng dấu phẩy)"
              value={values.specialties}
              onChange={handleChange}
            />
            {errors.specialties && (
              <p className="mt-1 text-sm text-red-600">{errors.specialties}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Các lĩnh vực bạn chuyên về, phân cách bằng dấu phẩy (tối đa 5)
            </p>

            {/* Specialty suggestions */}
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Gợi ý:</p>
              <div className="flex flex-wrap gap-1">
                {ARTISAN_SPECIALTIES.slice(0, 8).map((specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => {
                      const current = values.specialties;
                      const newSpecialties = current
                        ? `${current}, ${specialty}`
                        : specialty;
                      setFieldValue('specialties', newSpecialties);
                    }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Input
            label="Số năm kinh nghiệm"
            name="experience"
            type="number"
            value={values.experience}
            onChange={handleChange}
            error={errors.experience}
            placeholder="VD: 5"
            min="0"
            max="100"
            required
          />
        </div>

        {/* Online Presence */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <GlobeAltIcon className="w-5 h-5 mr-2" />
            Hiện diện trực tuyến
          </h3>

          <Input
            label="Website"
            name="website"
            type="url"
            value={values.website}
            onChange={handleChange}
            placeholder="https://example.com"
            helperText="Website hoặc blog cá nhân (nếu có)"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Facebook"
              name="facebook"
              type="url"
              value={values.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/..."
            />

            <Input
              label="Instagram"
              name="instagram"
              type="url"
              value={values.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/..."
            />

            <Input
              label="YouTube"
              name="youtube"
              type="url"
              value={values.youtube}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>

        {/* Motivation */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Động lực và mục tiêu
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lý do muốn trở thành nghệ nhân{' '}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              rows={5}
              className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                errors.reason
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : ''
              }`}
              placeholder="Chia sẻ về passion, mục tiêu và kế hoạch phát triển của bạn... (tối thiểu 100 ký tự)"
              value={values.reason}
              onChange={handleChange}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {values.reason.length}/100 ký tự tối thiểu
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => (window.location.href = '/profile')}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            loading={loading}
            leftIcon={<StarIcon className="w-4 h-4" />}
          >
            Gửi yêu cầu
          </Button>
        </div>
      </form>
    </Card>
  );
};
