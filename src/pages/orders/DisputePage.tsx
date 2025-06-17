import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useOrderDisputeDetail } from '../../hooks/orders/useOrderDisputes';
import { UpdateDisputeRequest, DisputeStatus } from '../../types/order';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Dropdown';
import { useAuth } from '../../contexts/AuthContext';

export const DisputePage: React.FC = () => {
  const { disputeId } = useParams<{ disputeId: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState<UpdateDisputeRequest>({
    status: DisputeStatus.OPEN,
    resolution: '',
  });

  const { dispute, loading, updating, updateDispute, formatDate } =
    useOrderDisputeDetail(disputeId!);

  const handleUpdateDispute = async () => {
    if (!dispute) return;

    try {
      await updateDispute(updateData);
      setShowUpdateModal(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getStatusColor = (status: DisputeStatus) => {
    const colors = {
      [DisputeStatus.OPEN]: 'warning',
      [DisputeStatus.UNDER_REVIEW]: 'info',
      [DisputeStatus.RESOLVED]: 'success',
      [DisputeStatus.CLOSED]: 'secondary',
    };
    return colors[status] as any;
  };

  const getStatusLabel = (status: DisputeStatus) => {
    const labels = {
      [DisputeStatus.OPEN]: 'Đang mở',
      [DisputeStatus.UNDER_REVIEW]: 'Đang xem xét',
      [DisputeStatus.RESOLVED]: 'Đã giải quyết',
      [DisputeStatus.CLOSED]: 'Đã đóng',
    };
    return labels[status];
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      PRODUCT_NOT_RECEIVED: 'Không nhận được sản phẩm',
      PRODUCT_DAMAGED: 'Sản phẩm bị hỏng',
      PRODUCT_NOT_AS_DESCRIBED: 'Sản phẩm không như mô tả',
      DELIVERY_ISSUE: 'Vấn đề giao hàng',
      SELLER_ISSUE: 'Vấn đề với người bán',
      OTHER: 'Khác',
    };
    return labels[type] || type;
  };

  const canUpdateDispute = () => {
    if (!dispute || !state.user) return false;

    // Admin can update all disputes
    if (state.user.role === 'ADMIN') return true;

    // Sellers can respond to disputes
    if (state.user.role === 'ARTISAN') {
      // Check if user is seller in the disputed order
      return true; // This should be validated on the backend
    }

    return false;
  };

  const getAvailableStatuses = () => {
    if (!dispute || !state.user) return [];

    if (state.user.role === 'ADMIN') {
      return [
        { label: 'Đang xem xét', value: DisputeStatus.UNDER_REVIEW },
        { label: 'Đã giải quyết', value: DisputeStatus.RESOLVED },
        { label: 'Đã đóng', value: DisputeStatus.CLOSED },
      ];
    }

    if (state.user.role === 'ARTISAN') {
      return [{ label: 'Đang xem xét', value: DisputeStatus.UNDER_REVIEW }];
    }

    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải thông tin khiếu nại...</p>
        </div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy khiếu nại
        </h3>
        <p className="text-gray-500 mb-6">
          Khiếu nại này không tồn tại hoặc bạn không có quyền xem
        </p>
        <Button onClick={() => navigate('/orders')}>Quay lại đơn hàng</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to={`/orders/${dispute.order.id}`}>
            <Button
              variant="ghost"
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
              className="mr-4"
            >
              Quay lại đơn hàng
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Khiếu nại #{dispute.id.slice(-8)}
            </h1>
            <p className="text-gray-500">
              Đơn hàng #{dispute.order.orderNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant={getStatusColor(dispute.status)}>
            {getStatusLabel(dispute.status)}
          </Badge>

          {canUpdateDispute() && (
            <Button
              onClick={() => setShowUpdateModal(true)}
              leftIcon={<DocumentTextIcon className="w-4 h-4" />}
            >
              Cập nhật
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dispute Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Chi tiết khiếu nại
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Loại khiếu nại
                </label>
                <p className="mt-1 text-gray-900">
                  {getTypeLabel(dispute.type)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Lý do khiếu nại
                </label>
                <p className="mt-1 text-gray-900">{dispute.reason}</p>
              </div>

              {dispute.evidence && dispute.evidence.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Bằng chứng ({dispute.evidence.length})
                  </label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {dispute.evidence.map((evidence, index) => (
                      <a
                        key={index}
                        href={evidence}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={evidence}
                          alt={`Bằng chứng ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border hover:opacity-80"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {dispute.resolution && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Giải pháp
                  </label>
                  <p className="mt-1 text-gray-900">{dispute.resolution}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Communication Section */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              Trao đổi
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Để trao đổi trực tiếp về khiếu nại này, vui lòng liên hệ qua hệ
                thống tin nhắn hoặc email hỗ trợ khách hàng.
              </p>
              <div className="mt-3 flex space-x-3">
                <Button variant="outline" size="sm">
                  Gửi tin nhắn
                </Button>
                <Button variant="outline" size="sm">
                  Liên hệ hỗ trợ
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Dispute Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin khiếu nại
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Người khiếu nại:</span>
                <p className="font-medium">
                  {dispute.complainant.firstName} {dispute.complainant.lastName}
                </p>
                <p className="text-gray-600">{dispute.complainant.email}</p>
              </div>

              <div>
                <span className="text-gray-500">Ngày tạo:</span>
                <p className="font-medium">{formatDate(dispute.createdAt)}</p>
              </div>

              <div>
                <span className="text-gray-500">Cập nhật cuối:</span>
                <p className="font-medium">{formatDate(dispute.updatedAt)}</p>
              </div>

              {dispute.resolvedAt && (
                <div>
                  <span className="text-gray-500">Ngày giải quyết:</span>
                  <p className="font-medium">
                    {formatDate(dispute.resolvedAt)}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thao tác nhanh
            </h3>

            <div className="space-y-3">
              <Button
                variant="outline"
                fullWidth
                leftIcon={<DocumentTextIcon className="w-4 h-4" />}
                onClick={() =>
                  window.open(`/orders/${dispute.order.id}`, '_blank')
                }
              >
                Xem đơn hàng
              </Button>

              <Button
                variant="outline"
                fullWidth
                leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
              >
                Liên hệ hỗ trợ
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Update Dispute Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Cập nhật khiếu nại"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái mới
            </label>
            <Select
              value={updateData.status}
              onChange={(value) =>
                setUpdateData({ ...updateData, status: value as DisputeStatus })
              }
              options={getAvailableStatuses()}
              placeholder="Chọn trạng thái"
            />
          </div>

          {(updateData.status === DisputeStatus.RESOLVED ||
            updateData.status === DisputeStatus.CLOSED) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giải pháp/Ghi chú
              </label>
              <Input
                as="textarea"
                rows={4}
                value={updateData.resolution}
                onChange={(e) =>
                  setUpdateData({ ...updateData, resolution: e.target.value })
                }
                placeholder="Mô tả giải pháp hoặc lý do đóng khiếu nại..."
                required
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowUpdateModal(false)}
              disabled={updating}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateDispute}
              loading={updating}
              leftIcon={<CheckCircleIcon className="w-4 h-4" />}
            >
              Cập nhật khiếu nại
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
