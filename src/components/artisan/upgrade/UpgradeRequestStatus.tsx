import React from 'react';
import { Link } from 'react-router-dom';
import {
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { UpgradeRequestStatus as StatusEnum } from '../../../types/artisan';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

interface UpgradeRequestStatusProps {
  request: {
    hasRequest: boolean;
    status?: StatusEnum;
    createdAt?: string;
    updatedAt?: string;
    adminNotes?: string;
    reviewedAt?: string;
  };
  onCreateNewRequest?: () => void; // Thêm prop này
}

export const UpgradeRequestStatus: React.FC<UpgradeRequestStatusProps> = ({
  request,
  onCreateNewRequest,
}) => {
  const getStatusBadge = (status: StatusEnum) => {
    const statusConfig = {
      [StatusEnum.PENDING]: {
        variant: 'warning' as const,
        text: 'Đang chờ duyệt',
        icon: ClockIcon,
      },
      [StatusEnum.APPROVED]: {
        variant: 'success' as const,
        text: 'Đã được duyệt',
        icon: CheckCircleIcon,
      },
      [StatusEnum.REJECTED]: {
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

  if (!request.hasRequest || !request.status) return null;

  return (
    <Card className="p-8 text-center">
      <div className="mb-6">
        <StarIcon className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Yêu cầu nâng cấp nghệ nhân
        </h1>
        <div className="mb-4">{getStatusBadge(request.status)}</div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Thông tin yêu cầu</h3>

        <div className="space-y-2 text-sm text-gray-600">
          {request.createdAt && (
            <p>
              <strong>Ngày gửi:</strong> {formatDate(request.createdAt)}
            </p>
          )}
          {request.updatedAt && (
            <p>
              <strong>Cập nhật lần cuối:</strong>{' '}
              {formatDate(request.updatedAt)}
            </p>
          )}
          {request.reviewedAt && (
            <p>
              <strong>Ngày xem xét:</strong> {formatDate(request.reviewedAt)}
            </p>
          )}
        </div>
      </div>

      {request.status === StatusEnum.PENDING && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            ⏳ Yêu cầu của bạn đang được xem xét. Chúng tôi sẽ thông báo kết quả
            trong vòng 2-3 ngày làm việc.
          </p>
        </div>
      )}

      {request.status === StatusEnum.APPROVED && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 text-sm">
            🎉 Chúc mừng! Tài khoản của bạn đã được nâng cấp thành nghệ nhân.
            Bạn có thể bắt đầu tạo sản phẩm và tùy chỉnh trang cá nhân.
          </p>
        </div>
      )}

      {/* Thêm phần cho trường hợp bị từ chối */}
      {request.status === StatusEnum.REJECTED && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm mb-4">
            ❌ Yêu cầu nâng cấp của bạn đã bị từ chối. Bạn có thể xem lý do bên
            dưới và gửi yêu cầu mới.
          </p>
          {onCreateNewRequest && (
            <Button
              onClick={onCreateNewRequest}
              leftIcon={<PlusIcon className="w-4 h-4" />}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Gửi yêu cầu mới
            </Button>
          )}
        </div>
      )}

      {request.adminNotes && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">
            Ghi chú từ quản trị viên:
          </h4>
          <p className="text-sm text-gray-600">{request.adminNotes}</p>
        </div>
      )}

      <div className="flex justify-center space-x-3">
        <Button
          variant="ghost"
          onClick={() => (window.location.href = '/profile')}
        >
          Quay lại trang cá nhân
        </Button>

        {request.status === StatusEnum.APPROVED && (
          <Button onClick={() => (window.location.href = '/artisan/dashboard')}>
            Đến bảng điều khiển nghệ nhân
          </Button>
        )}
      </div>
    </Card>
  );
};
