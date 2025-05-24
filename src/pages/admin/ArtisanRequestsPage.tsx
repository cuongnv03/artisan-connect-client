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
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import { useToastContext } from '../../contexts/ToastContext';
import { artisanService } from '../../services/artisan.service';

interface RequestWithUser extends ArtisanUpgradeRequest {
  user: User;
}

export const ArtisanRequestsPage: React.FC = () => {
  const { success, error } = useToastContext();
  const [requests, setRequests] = useState<RequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<RequestWithUser | null>(null);
  const [detailModal, setDetailModal] = useState(false);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject' | null;
    adminNotes: string;
  }>({
    isOpen: false,
    action: null,
    adminNotes: '',
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const result = await artisanService.getUpgradeRequests(1, 50);
      setRequests(result.data);
    } catch (err) {
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      await artisanService.approveUpgradeRequest(
        selectedRequest.id,
        actionModal.adminNotes,
      );

      success(
        `Đã duyệt yêu cầu của ${selectedRequest.user.firstName} ${selectedRequest.user.lastName}`,
      );
      setActionModal({ isOpen: false, action: null, adminNotes: '' });
      setSelectedRequest(null);
      loadRequests();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi duyệt yêu cầu');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      await artisanService.rejectUpgradeRequest(
        selectedRequest.id,
        actionModal.adminNotes,
      );

      success(
        `Đã từ chối yêu cầu của ${selectedRequest.user.firstName} ${selectedRequest.user.lastName}`,
      );
      setActionModal({ isOpen: false, action: null, adminNotes: '' });
      setSelectedRequest(null);
      loadRequests();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi từ chối yêu cầu');
    } finally {
      setProcessing(false);
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
                        <strong>Tên cửa hàng:</strong> {request.shopName}
                      </p>

                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Chuyên môn:</strong>{' '}
                        {request.specialties.join(', ')}
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
                            className="text-sm text-blue-600 hover:text-blue-700"
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
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setDetailModal(true);
                      }}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setActionModal({
                          isOpen: true,
                          action: 'reject',
                          adminNotes: '',
                        });
                      }}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Từ chối
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setActionModal({
                          isOpen: true,
                          action: 'approve',
                          adminNotes: '',
                        });
                      }}
                    >
                      Duyệt
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
                        {request.shopName} • {request.specialties.join(', ')}
                      </p>

                      <p className="text-xs text-gray-500">
                        Xử lý lúc:{' '}
                        {request.reviewedAt && formatDate(request.reviewedAt)}
                      </p>

                      {request.adminNotes && (
                        <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                          <strong>Ghi chú:</strong> {request.adminNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request);
                      setDetailModal(true);
                    }}
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        title="Chi tiết yêu cầu"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <Avatar
                src={selectedRequest.user.avatarUrl}
                alt={`${selectedRequest.user.firstName} ${selectedRequest.user.lastName}`}
                size="xl"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedRequest.user.firstName}{' '}
                  {selectedRequest.user.lastName}
                </h3>
                <p className="text-gray-600">{selectedRequest.user.email}</p>
                <p className="text-sm text-gray-500">
                  Tham gia từ {formatDate(selectedRequest.user.createdAt)}
                </p>
              </div>
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Thông tin cửa hàng
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Tên:</strong> {selectedRequest.shopName}
                  </p>
                  <p>
                    <strong>Mô tả:</strong> {selectedRequest.shopDescription}
                  </p>
                  <p>
                    <strong>Chuyên môn:</strong>{' '}
                    {selectedRequest.specialties.join(', ')}
                  </p>
                  <p>
                    <strong>Kinh nghiệm:</strong> {selectedRequest.experience}{' '}
                    năm
                  </p>
                  {selectedRequest.website && (
                    <p>
                      <strong>Website:</strong> {selectedRequest.website}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Mạng xã hội</h4>
                <div className="space-y-2 text-sm">
                  {selectedRequest.socialMedia?.facebook && (
                    <p>
                      <strong>Facebook:</strong>{' '}
                      {selectedRequest.socialMedia.facebook}
                    </p>
                  )}
                  {selectedRequest.socialMedia?.instagram && (
                    <p>
                      <strong>Instagram:</strong>{' '}
                      {selectedRequest.socialMedia.instagram}
                    </p>
                  )}
                  {selectedRequest.socialMedia?.youtube && (
                    <p>
                      <strong>YouTube:</strong>{' '}
                      {selectedRequest.socialMedia.youtube}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {selectedRequest.reason && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Lý do đăng ký
                </h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {selectedRequest.reason}
                </p>
              </div>
            )}

            {selectedRequest.adminNotes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Ghi chú admin
                </h4>
                <p className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg">
                  {selectedRequest.adminNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() =>
          setActionModal({ isOpen: false, action: null, adminNotes: '' })
        }
        title={
          actionModal.action === 'approve' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {actionModal.action === 'approve'
              ? 'Bạn có chắc chắn muốn duyệt yêu cầu này?'
              : 'Bạn có chắc chắn muốn từ chối yêu cầu này?'}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              rows={4}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
              placeholder="Nhập ghi chú cho quyết định của bạn..."
              value={actionModal.adminNotes}
              onChange={(e) =>
                setActionModal((prev) => ({
                  ...prev,
                  adminNotes: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() =>
                setActionModal({ isOpen: false, action: null, adminNotes: '' })
              }
            >
              Hủy
            </Button>
            <Button
              variant={actionModal.action === 'approve' ? 'primary' : 'danger'}
              onClick={
                actionModal.action === 'approve'
                  ? handleApproveRequest
                  : handleRejectRequest
              }
              loading={processing}
            >
              {actionModal.action === 'approve' ? 'Duyệt' : 'Từ chối'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
