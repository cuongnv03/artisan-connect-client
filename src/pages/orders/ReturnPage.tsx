import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowUturnLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useOrderReturnDetail } from '../../hooks/orders/useOrderReturns';
import { UpdateReturnRequest, ReturnStatus } from '../../types/order';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Dropdown';
import { useAuth } from '../../contexts/AuthContext';

export const ReturnPage: React.FC = () => {
  const { returnId } = useParams<{ returnId: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState<UpdateReturnRequest>({
    status: ReturnStatus.REQUESTED,
    refundAmount: undefined,
    refundReason: '',
  });

  const {
    returnRequest,
    loading,
    updating,
    updateReturn,
    formatPrice,
    formatDate,
  } = useOrderReturnDetail(returnId!);

  const handleUpdateReturn = async () => {
    if (!returnRequest) return;

    try {
      await updateReturn(updateData);
      setShowUpdateModal(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getStatusColor = (status: ReturnStatus) => {
    const colors = {
      [ReturnStatus.REQUESTED]: 'warning',
      [ReturnStatus.APPROVED]: 'info',
      [ReturnStatus.REJECTED]: 'danger',
      [ReturnStatus.PRODUCT_RETURNED]: 'info',
      [ReturnStatus.REFUND_PROCESSED]: 'success',
    };
    return colors[status] as any;
  };

  const getStatusLabel = (status: ReturnStatus) => {
    const labels = {
      [ReturnStatus.REQUESTED]: 'Yêu cầu',
      [ReturnStatus.APPROVED]: 'Đã chấp nhận',
      [ReturnStatus.REJECTED]: 'Từ chối',
      [ReturnStatus.PRODUCT_RETURNED]: 'Đã trả hàng',
      [ReturnStatus.REFUND_PROCESSED]: 'Đã hoàn tiền',
    };
    return labels[status];
  };

  const getReasonLabel = (reason: string) => {
    const labels = {
      DEFECTIVE: 'Sản phẩm lỗi',
      NOT_AS_DESCRIBED: 'Không như mô tả',
      WRONG_ITEM: 'Sai sản phẩm',
      DAMAGED_IN_SHIPPING: 'Hỏng trong vận chuyển',
      CHANGED_MIND: 'Đổi ý',
      OTHER: 'Khác',
    };
    return labels[reason] || reason;
  };

  const canUpdateReturn = () => {
    if (!returnRequest || !state.user) return false;

    // Admin can update all returns
    if (state.user.role === 'ADMIN') return true;

    // Sellers can approve/reject returns
    if (state.user.role === 'ARTISAN') {
      // Check if user is seller in the returned order
      return true; // This should be validated on the backend
    }

    return false;
  };

  const getAvailableStatuses = () => {
    if (!returnRequest || !state.user) return [];

    if (state.user.role === 'ADMIN') {
      return [
        { label: 'Đã chấp nhận', value: ReturnStatus.APPROVED },
        { label: 'Từ chối', value: ReturnStatus.REJECTED },
        { label: 'Đã trả hàng', value: ReturnStatus.PRODUCT_RETURNED },
        { label: 'Đã hoàn tiền', value: ReturnStatus.REFUND_PROCESSED },
      ];
    }

    if (state.user.role === 'ARTISAN') {
      return [
        { label: 'Đã chấp nhận', value: ReturnStatus.APPROVED },
        { label: 'Từ chối', value: ReturnStatus.REJECTED },
      ];
    }

    return [];
  };

  const getStatusIcon = (status: ReturnStatus) => {
    switch (status) {
      case ReturnStatus.APPROVED:
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case ReturnStatus.REJECTED:
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case ReturnStatus.REFUND_PROCESSED:
        return <CurrencyDollarIcon className="w-5 h-5 text-green-500" />;
      default:
        return <ArrowUturnLeftIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            Đang tải thông tin yêu cầu trả hàng...
          </p>
        </div>
      </div>
    );
  }

  if (!returnRequest) {
    return (
      <div className="text-center py-12">
        <ArrowUturnLeftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy yêu cầu trả hàng
        </h3>
        <p className="text-gray-500 mb-6">
          Yêu cầu trả hàng này không tồn tại hoặc bạn không có quyền xem
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
          <Link to={`/orders/${returnRequest.order.id}`}>
            <Button
              variant="ghost"
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
              className="mr-4"
            >
              Quay lại đơn hàng
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ArrowUturnLeftIcon className="w-6 h-6 mr-2" />
              Yêu cầu trả hàng #{returnRequest.id.slice(-8)}
            </h1>
            <p className="text-gray-500">
              Đơn hàng #{returnRequest.order.orderNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge
            variant={getStatusColor(returnRequest.status)}
            className="flex items-center"
          >
            {getStatusIcon(returnRequest.status)}
            <span className="ml-1">{getStatusLabel(returnRequest.status)}</span>
          </Badge>

          {canUpdateReturn() && (
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
          {/* Return Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Chi tiết yêu cầu trả hàng
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Lý do trả hàng
                </label>
                <p className="mt-1 text-gray-900">
                  {getReasonLabel(returnRequest.reason)}
                </p>
              </div>

              {returnRequest.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Mô tả chi tiết
                  </label>
                  <p className="mt-1 text-gray-900">
                    {returnRequest.description}
                  </p>
                </div>
              )}

              {returnRequest.evidence && returnRequest.evidence.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Hình ảnh bằng chứng ({returnRequest.evidence.length})
                  </label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {returnRequest.evidence.map((evidence, index) => (
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
            </div>
          </Card>

          {/* Refund Information */}
          {(returnRequest.status === ReturnStatus.APPROVED ||
            returnRequest.status === ReturnStatus.REFUND_PROCESSED) && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                Thông tin hoàn tiền
              </h2>

              <div className="space-y-3">
                {returnRequest.refundAmount && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Số tiền hoàn
                    </label>
                    <p className="mt-1 text-lg font-semibold text-green-600">
                      {formatPrice(returnRequest.refundAmount)}
                    </p>
                  </div>
                )}

                {returnRequest.refundReason && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Lý do hoàn tiền
                    </label>
                    <p className="mt-1 text-gray-900">
                      {returnRequest.refundReason}
                    </p>
                  </div>
                )}

                {returnRequest.status === ReturnStatus.REFUND_PROCESSED && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-green-800 font-medium">
                        Đã hoàn tiền thành công
                      </span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Số tiền sẽ được hoàn về tài khoản của bạn trong 3-5 ngày
                      làm việc
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Return Process Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tiến trình trả hàng
            </h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Yêu cầu được tạo</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(returnRequest.createdAt)}
                  </p>
                </div>
              </div>

              {returnRequest.status !== ReturnStatus.REQUESTED && (
                <div className="flex items-start space-x-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      returnRequest.status === ReturnStatus.APPROVED
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {returnRequest.status === ReturnStatus.APPROVED ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {returnRequest.status === ReturnStatus.APPROVED
                        ? 'Yêu cầu được chấp nhận'
                        : returnRequest.status === ReturnStatus.REJECTED
                        ? 'Yêu cầu bị từ chối'
                        : getStatusLabel(returnRequest.status)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(returnRequest.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Return Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin yêu cầu
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Người yêu cầu:</span>
                <p className="font-medium">
                  {returnRequest.requester.firstName}{' '}
                  {returnRequest.requester.lastName}
                </p>
                <p className="text-gray-600">{returnRequest.requester.email}</p>
              </div>

              <div>
                <span className="text-gray-500">Ngày yêu cầu:</span>
                <p className="font-medium">
                  {formatDate(returnRequest.createdAt)}
                </p>
              </div>

              <div>
                <span className="text-gray-500">Cập nhật cuối:</span>
                <p className="font-medium">
                  {formatDate(returnRequest.updatedAt)}
                </p>
              </div>

              {returnRequest.approvedBy && (
                <div>
                  <span className="text-gray-500">Được xử lý bởi:</span>
                  <p className="font-medium">Admin</p>
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
                  window.open(`/orders/${returnRequest.order.id}`, '_blank')
                }
              >
                Xem đơn hàng
              </Button>

              <Button
                variant="outline"
                fullWidth
                leftIcon={<ArrowUturnLeftIcon className="w-4 h-4" />}
              >
                In yêu cầu trả hàng
              </Button>
            </div>
          </Card>

          {/* Help */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Cần hỗ trợ?</h3>
            <p className="text-blue-800 text-sm mb-4">
              Nếu bạn có thắc mắc về quy trình trả hàng, hãy liên hệ với chúng
              tôi.
            </p>
            <Button variant="outline" size="sm" fullWidth>
              Liên hệ hỗ trợ
            </Button>
          </Card>
        </div>
      </div>

      {/* Update Return Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Cập nhật yêu cầu trả hàng"
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
                setUpdateData({ ...updateData, status: value as ReturnStatus })
              }
              options={getAvailableStatuses()}
              placeholder="Chọn trạng thái"
            />
          </div>

          {updateData.status === ReturnStatus.REFUND_PROCESSED && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền hoàn
              </label>
              <Input
                type="number"
                value={updateData.refundAmount || ''}
                onChange={(e) =>
                  setUpdateData({
                    ...updateData,
                    refundAmount: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Nhập số tiền hoàn..."
                min="0"
                step="1000"
              />
            </div>
          )}

          {(updateData.status === ReturnStatus.REJECTED ||
            updateData.status === ReturnStatus.REFUND_PROCESSED) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {updateData.status === ReturnStatus.REJECTED
                  ? 'Lý do từ chối'
                  : 'Ghi chú hoàn tiền'}
              </label>
              <Input
                as="textarea"
                rows={3}
                value={updateData.refundReason}
                onChange={(e) =>
                  setUpdateData({ ...updateData, refundReason: e.target.value })
                }
                placeholder={
                  updateData.status === ReturnStatus.REJECTED
                    ? 'Nhập lý do từ chối...'
                    : 'Nhập ghi chú về việc hoàn tiền...'
                }
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
              onClick={handleUpdateReturn}
              loading={updating}
              leftIcon={<CheckCircleIcon className="w-4 h-4" />}
            >
              Cập nhật yêu cầu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
