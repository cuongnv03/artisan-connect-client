import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  GlobeAltIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  ArtisanUpgradeRequest,
  UpgradeRequestStatus,
} from '../../types/artisan';
import { User } from '../../types/auth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Avatar } from '../../components/ui/Avatar';
import { useToastContext } from '../../contexts/ToastContext';
import { artisanService } from '../../services/artisan.service';
import { useNavigate } from 'react-router-dom';

interface RequestWithUser extends ArtisanUpgradeRequest {
  user: User;
}

// Map backend specialties to Vietnamese for display
const SPECIALTY_DISPLAY: Record<string, string> = {
  pottery: 'Gốm sứ',
  embroidery: 'Thêu tay',
  woodworking: 'Đồ gỗ',
  painting: 'Tranh vẽ',
  leatherwork: 'Đồ da',
  jewelry: 'Trang sức',
  knitting: 'Đan lát',
  sculpture: 'Điêu khắc',
  textiles: 'Dệt thổ cẩm',
  metalwork: 'Đồ kim loại',
  glasswork: 'Đồ thủy tinh',
  calligraphy: 'Chữ thư pháp',
  photography: 'Chụp ảnh',
  ceramics: 'Gốm',
  other: 'Khác',
};

export const ArtisanRequestsPage: React.FC = () => {
  const { error } = useToastContext();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const result = await artisanService.getUpgradeRequests(1, 50);
      setRequests(result.data);
    } catch (err) {
      console.error('Error loading requests:', err);
      error('Có lỗi xảy ra khi tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: UpgradeRequestStatus) => {
    const configs = {
      [UpgradeRequestStatus.PENDING]: {
        variant: 'warning' as const,
        text: 'Chờ duyệt',
      },
      [UpgradeRequestStatus.APPROVED]: {
        variant: 'success' as const,
        text: 'Đã duyệt',
      },
      [UpgradeRequestStatus.REJECTED]: {
        variant: 'danger' as const,
        text: 'Đã từ chối',
      },
    };
    const config = configs[status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDisplaySpecialties = (specialties: string[]) => {
    return specialties.map((s) => SPECIALTY_DISPLAY[s] || s).join(', ');
  };

  const handleViewDetails = (requestId: string) => {
    navigate(`/admin/artisan-requests/${requestId}`);
  };

  const pendingRequests = requests.filter(
    (req) => req.status === UpgradeRequestStatus.PENDING,
  );
  const processedRequests = requests.filter(
    (req) => req.status !== UpgradeRequestStatus.PENDING,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải yêu cầu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Yêu cầu nâng cấp nghệ nhân
        </h1>
        <p className="text-gray-600">
          Xem xét và duyệt yêu cầu trở thành nghệ nhân
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Chờ duyệt</p>
              <p className="text-2xl font-semibold text-gray-900">
                {pendingRequests.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Đã duyệt</p>
              <p className="text-2xl font-semibold text-gray-900">
                {
                  requests.filter(
                    (r) => r.status === UpgradeRequestStatus.APPROVED,
                  ).length
                }
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <XCircleIcon className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Đã từ chối</p>
              <p className="text-2xl font-semibold text-gray-900">
                {
                  requests.filter(
                    (r) => r.status === UpgradeRequestStatus.REJECTED,
                  ).length
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Empty State */}
      {requests.length === 0 && (
        <Card className="p-12 text-center">
          <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có yêu cầu nào
          </h3>
          <p className="text-gray-500">
            Hiện tại chưa có yêu cầu nâng cấp nghệ nhân nào được gửi.
          </p>
        </Card>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Yêu cầu chờ duyệt ({pendingRequests.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar
                      src={request.user.avatarUrl}
                      alt={`${request.user.firstName} ${request.user.lastName}`}
                      size="lg"
                    />

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {request.user.firstName} {request.user.lastName}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>

                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Email:</strong> {request.user.email}
                      </p>

                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Tên cửa hàng:</strong> {request.shopName}
                      </p>

                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Chuyên môn:</strong>{' '}
                        {getDisplaySpecialties(request.specialties)}
                      </p>

                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Kinh nghiệm:</strong> {request.experience} năm
                      </p>

                      {request.website && (
                        <div className="flex items-center mt-2">
                          <GlobeAltIcon className="w-4 h-4 text-gray-400 mr-1" />
                          <a
                            href={request.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 truncate max-w-xs"
                          >
                            {request.website}
                          </a>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        Gửi lúc: {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewDetails(request.id)}
                      leftIcon={<EyeIcon className="w-4 h-4" />}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Yêu cầu đã xử lý ({processedRequests.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {processedRequests.map((request) => (
              <div key={request.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar
                      src={request.user.avatarUrl}
                      alt={`${request.user.firstName} ${request.user.lastName}`}
                      size="md"
                    />

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {request.user.firstName} {request.user.lastName}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>

                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Email:</strong> {request.user.email}
                      </p>

                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Cửa hàng:</strong> {request.shopName}
                      </p>

                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Chuyên môn:</strong>{' '}
                        {getDisplaySpecialties(request.specialties)}
                      </p>

                      <p className="text-xs text-gray-500 mt-2">
                        Xử lý lúc:{' '}
                        {request.reviewedAt && formatDate(request.reviewedAt)}
                        {request.reviewedBy && (
                          <>
                            {' '}
                            bởi {request.reviewedBy.firstName}{' '}
                            {request.reviewedBy.lastName}
                          </>
                        )}
                      </p>

                      {request.adminNotes && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Ghi chú:</strong> {request.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(request.id)}
                      leftIcon={<EyeIcon className="w-4 h-4" />}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
