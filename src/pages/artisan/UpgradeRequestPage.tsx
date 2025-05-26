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
  UpgradeRequestStatus,
  UpgradeRequestStatusResponse,
} from '../../types/artisan';
import { useForm } from '../../hooks/useForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import {
  ARTISAN_SPECIALTIES,
  mapSpecialtyToServer,
  mapSpecialtyToDisplay,
} from '../../utils/constants';

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
    useState<UpgradeRequestStatusResponse | null>(null);

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
        } else {
          const specialtyList = values.specialties
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s);
          if (specialtyList.length === 0) {
            errors.specialties = 'Phải có ít nhất 1 chuyên môn';
          } else if (specialtyList.length > 5) {
            errors.specialties = 'Tối đa 5 chuyên môn';
          } else {
            // Validate specialties are valid
            const invalidSpecialties = specialtyList.filter(
              (s) => !ARTISAN_SPECIALTIES.includes(s),
            );
            if (invalidSpecialties.length > 0) {
              errors.specialties = `Chuyên môn không hợp lệ: ${invalidSpecialties.join(
                ', ',
              )}`;
            }
          }
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

        if (values.website && values.website.trim()) {
          try {
            new URL(values.website);
          } catch {
            errors.website = 'Website phải là URL hợp lệ';
          }
        }

        if (!values.reason.trim()) {
          errors.reason = 'Lý do là bắt buộc';
        } else if (values.reason.length < 100) {
          errors.reason = 'Lý do phải có ít nhất 100 ký tự';
        } else if (values.reason.length > 1000) {
          errors.reason = 'Lý do không được quá 1000 ký tự';
        }

        // Validate social media URLs
        [
          { field: 'facebook', name: 'Facebook' },
          { field: 'instagram', name: 'Instagram' },
          { field: 'youtube', name: 'YouTube' },
        ].forEach(({ field, name }) => {
          const value = values[field as keyof UpgradeFormData];
          if (value && value.trim()) {
            try {
              new URL(value);
            } catch {
              errors[field] = `${name} phải là URL hợp lệ`;
            }
          }
        });

        return errors;
      },
      onSubmit: handleSubmitRequest,
    });

  useEffect(() => {
    checkExistingRequest();
  }, []);

  const checkExistingRequest = async () => {
    try {
      setLoading(true);
      const request = await artisanService.getUpgradeRequestStatus();
      setExistingRequest(request);

      // If request exists and is rejected, populate form with existing data
      if (request && request.status === UpgradeRequestStatus.REJECTED) {
        // Note: We might need to fetch full request details if we want to populate form
        // For now, we'll let user fill the form again
      }
    } catch (err: any) {
      // 404 means no existing request, which is fine
      if (err.status !== 404) {
        console.error('Error checking upgrade request status:', err);
        error('Không thể kiểm tra trạng thái yêu cầu');
      }
    } finally {
      setLoading(false);
    }
  };

  async function handleSubmitRequest(data: UpgradeFormData) {
    setSubmitting(true);
    try {
      // Transform form data to API format
      const specialtyList = data.specialties
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s)
        .map(mapSpecialtyToServer);

      const socialMedia: Record<string, string> = {};
      if (data.facebook.trim()) socialMedia.facebook = data.facebook.trim();
      if (data.instagram.trim()) socialMedia.instagram = data.instagram.trim();
      if (data.youtube.trim()) socialMedia.youtube = data.youtube.trim();

      const requestData = {
        shopName: data.shopName.trim(),
        shopDescription: data.shopDescription.trim(),
        specialties: specialtyList,
        experience: parseInt(data.experience) || undefined,
        website: data.website.trim() || undefined,
        reason: data.reason.trim(),
        socialMedia:
          Object.keys(socialMedia).length > 0 ? socialMedia : undefined,
      };

      if (
        existingRequest &&
        existingRequest.status === UpgradeRequestStatus.REJECTED
      ) {
        await artisanService.updateUpgradeRequest(requestData);
        success(
          'Cập nhật yêu cầu thành công! Chúng tôi sẽ xem xét lại yêu cầu của bạn.',
        );
      } else {
        await artisanService.requestUpgrade(requestData);
        success(
          'Gửi yêu cầu thành công! Chúng tôi sẽ xem xét trong vòng 2-3 ngày làm việc.',
        );
      }

      // Navigate to profile or a success page
      navigate('/profile');
    } catch (err: any) {
      console.error('Error submitting upgrade request:', err);
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

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
    existingRequest.hasRequest &&
    existingRequest.status !== UpgradeRequestStatus.REJECTED
  ) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <StarIcon className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Yêu cầu nâng cấp nghệ nhân
            </h1>
            <div className="mb-4">
              {getStatusBadge(existingRequest.status!)}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Thông tin yêu cầu
            </h3>

            <div className="space-y-2 text-sm text-gray-600">
              {existingRequest.createdAt && (
                <p>
                  <strong>Ngày gửi:</strong>{' '}
                  {formatDate(existingRequest.createdAt)}
                </p>
              )}
              {existingRequest.updatedAt && (
                <p>
                  <strong>Cập nhật lần cuối:</strong>{' '}
                  {formatDate(existingRequest.updatedAt)}
                </p>
              )}
              {existingRequest.reviewedAt && (
                <p>
                  <strong>Ngày xem xét:</strong>{' '}
                  {formatDate(existingRequest.reviewedAt)}
                </p>
              )}
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
                nhân. Bạn có thể bắt đầu tạo sản phẩm và tùy chỉnh trang cá
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

          <div className="flex justify-center space-x-3">
            <Button variant="ghost" onClick={() => navigate('/profile')}>
              Quay lại trang cá nhân
            </Button>

            {existingRequest.status === UpgradeRequestStatus.APPROVED && (
              <Button onClick={() => navigate('/artisan/dashboard')}>
                Đến bảng điều khiển nghệ nhân
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <StarIcon className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Trở thành nghệ nhân
        </h1>
        <p className="text-lg text-gray-600">
          Chia sẻ câu chuyện và bán sản phẩm thủ công của bạn
        </p>
      </div>

      {/* Benefits */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-primary/5 to-secondary/5">
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
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-gray-700">Công cụ marketing</span>
          </div>
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-gray-700">Cộng đồng nghệ nhân</span>
          </div>
        </div>
      </Card>

      {/* Show message if resubmitting after rejection */}
      {existingRequest &&
        existingRequest.status === UpgradeRequestStatus.REJECTED && (
          <Card className="p-4 mb-6 bg-orange-50 border border-orange-200">
            <div className="flex items-start">
              <XCircleIcon className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-900 mb-1">
                  Yêu cầu trước đã bị từ chối
                </h3>
                <p className="text-sm text-orange-700 mb-2">
                  Vui lòng xem xét lại thông tin và gửi yêu cầu mới.
                </p>
                {existingRequest.adminNotes && (
                  <div className="bg-orange-100 rounded p-2">
                    <p className="text-sm text-orange-800">
                      <strong>Ghi chú từ admin:</strong>{' '}
                      {existingRequest.adminNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

      {/* Application Form */}
      <Card className="p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {existingRequest?.status === UpgradeRequestStatus.REJECTED
            ? 'Gửi lại yêu cầu'
            : 'Thông tin đăng ký'}
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
                <p className="mt-1 text-sm text-red-600">
                  {errors.specialties}
                </p>
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
              error={errors.website}
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
                error={errors.facebook}
                placeholder="https://facebook.com/..."
              />

              <Input
                label="Instagram"
                name="instagram"
                type="url"
                value={values.instagram}
                onChange={handleChange}
                error={errors.instagram}
                placeholder="https://instagram.com/..."
              />

              <Input
                label="YouTube"
                name="youtube"
                type="url"
                value={values.youtube}
                onChange={handleChange}
                error={errors.youtube}
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
              onClick={() => navigate('/profile')}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              loading={submitting}
              leftIcon={<StarIcon className="w-4 h-4" />}
            >
              {existingRequest?.status === UpgradeRequestStatus.REJECTED
                ? 'Gửi lại yêu cầu'
                : 'Gửi yêu cầu'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
