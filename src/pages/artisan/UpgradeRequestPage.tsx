import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { artisanService } from '../../services/artisan.service';
import {
  ArtisanUpgradeRequest,
  UpgradeRequestStatus,
} from '../../types/artisan';
import { useForm } from '../../hooks/useForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

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

export const UpgradeRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { success, error } = useToastContext();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] =
    useState<ArtisanUpgradeRequest | null>(null);

  const { values, handleChange, handleSubmit, errors } =
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
        }

        if (!values.shopDescription.trim()) {
          errors.shopDescription = 'Mô tả cửa hàng là bắt buộc';
        } else if (values.shopDescription.length < 50) {
          errors.shopDescription = 'Mô tả phải có ít nhất 50 ký tự';
        }

        if (!values.specialties.trim()) {
          errors.specialties = 'Chuyên môn là bắt buộc';
        }

        if (!values.experience.trim()) {
          errors.experience = 'Kinh nghiệm là bắt buộc';
        }

        if (!values.reason.trim()) {
          errors.reason = 'Lý do là bắt buộc';
        } else if (values.reason.length < 100) {
          errors.reason = 'Lý do phải có ít nhất 100 ký tự';
        }

        return errors;
      },
      onSubmit: handleSubmitRequest,
    });

  useEffect(() => {
    checkExistingRequest();
  }, []);

  const checkExistingRequest = async () => {
    try {
      const request = await artisanService.getUpgradeRequestStatus();
      setExistingRequest(request);
    } catch (err) {
      // No existing request, user can create new one
    } finally {
      setLoading(false);
    }
  };

  async function handleSubmitRequest(data: UpgradeFormData) {
    setSubmitting(true);
    try {
      const requestData = {
        shopName: data.shopName,
        shopDescription: data.shopDescription,
        specialties: data.specialties.split(',').map((s) => s.trim()),
        experience: parseInt(data.experience) || undefined,
        website: data.website || undefined,
        reason: data.reason,
        socialMedia: {
          facebook: data.facebook || undefined,
          instagram: data.instagram || undefined,
          youtube: data.youtube || undefined,
        },
      };

      if (
        existingRequest &&
        existingRequest.status === UpgradeRequestStatus.REJECTED
      ) {
        await artisanService.updateUpgradeRequest(requestData);
        success('Cập nhật yêu cầu thành công!');
      } else {
        await artisanService.requestUpgrade(requestData);
        success('Gửi yêu cầu thành công!');
      }

      navigate('/profile');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  }

  const getStatusBadge = (status: UpgradeRequestStatus) => {
    const statusConfig = {
      [UpgradeRequestStatus.PENDING]: {
        variant: 'warning' as const,
        text: 'Đang chờ duyệt',
        icon: ClockIcon,
      },
      [UpgradeRequestStatus.APPROVED]: {
        variant: 'success' as const,
        text: 'Đã được duyệt',
        icon: CheckCircleIcon,
      },
      [UpgradeRequestStatus.REJECTED]: {
        variant: 'danger' as const,
        text: 'Đã bị từ chối',
        icon: XCircleIcon,
      },
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="inline-flex items-center">
        <IconComponent className="w-4 h-4 mr-1" />
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang kiểm tra trạng thái...</p>
        </div>
      </div>
    );
  }

  // Show existing request status if exists and not rejected
  if (
    existingRequest &&
    existingRequest.status !== UpgradeRequestStatus.REJECTED
  ) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <StarIcon className="w-16 h-16 text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Yêu cầu nâng cấp nghệ nhân
            </h1>
            <div className="mb-4">{getStatusBadge(existingRequest.status)}</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Thông tin yêu cầu
            </h3>

            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Tên cửa hàng:</strong> {existingRequest.shopName}
              </p>
              <p>
                <strong>Chuyên môn:</strong>{' '}
                {existingRequest.specialties.join(', ')}
              </p>
              <p>
                <strong>Kinh nghiệm:</strong> {existingRequest.experience} năm
              </p>
              <p>
                <strong>Ngày gửi:</strong>{' '}
                {new Date(existingRequest.createdAt).toLocaleDateString(
                  'vi-VN',
                )}
              </p>
            </div>
          </div>

          {existingRequest.status === UpgradeRequestStatus.PENDING && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                ⏳ Yêu cầu của bạn đang được xem xét. Chúng tôi sẽ thông báo kết
                quả trong vòng 2-3 ngày làm việc.
              </p>
            </div>
          )}

          {existingRequest.status === UpgradeRequestStatus.APPROVED && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">
                🎉 Chúc mừng! Tài khoản của bạn đã được nâng cấp thành nghệ
                nhân.
              </p>
            </div>
          )}

          {existingRequest.adminNotes && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">
                Ghi chú từ quản trị viên:
              </h4>
              <p className="text-sm text-gray-600">
                {existingRequest.adminNotes}
              </p>
            </div>
          )}

          <Button variant="ghost" onClick={() => navigate('/profile')}>
            Quay lại trang cá nhân
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <StarIcon className="w-16 h-16 text-accent mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Trở thành nghệ nhân
        </h1>
        <p className="text-lg text-gray-600">
          Chia sẻ câu chuyện và bán sản phẩm thủ công của bạn
        </p>
      </div>

      {/* Benefits */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-accent/5 to-secondary/5">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quyền lợi nghệ nhân
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-gray-700">Tạo và bán sản phẩm</span>
          </div>
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-gray-700">Tùy chỉnh trang cá nhân</span>
          </div>
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-gray-700">Thống kê chi tiết</span>
          </div>
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-gray-700">Hỗ trợ ưu tiên</span>
          </div>
        </div>
      </Card>

      {/* Application Form */}
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
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
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

            <Input
              label="Chuyên môn/Lĩnh vực"
              name="specialties"
              value={values.specialties}
              onChange={handleChange}
              error={errors.specialties}
              placeholder="VD: Gốm sứ, Thêu tay, Đồ gỗ (phân cách bằng dấu phẩy)"
              helperText="Các lĩnh vực bạn chuyên về, phân cách bằng dấu phẩy"
              required
            />

            <Input
              label="Số năm kinh nghiệm"
              name="experience"
              type="number"
              value={values.experience}
              onChange={handleChange}
              error={errors.experience}
              placeholder="VD: 5"
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
                value={values.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
              />

              <Input
                label="Instagram"
                name="instagram"
                value={values.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
              />

              <Input
                label="YouTube"
                name="youtube"
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
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
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
              onClick={() => navigate('/profile')}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              loading={submitting}
              leftIcon={<StarIcon className="w-4 h-4" />}
            >
              {existingRequest ? 'Cập nhật yêu cầu' : 'Gửi yêu cầu'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
