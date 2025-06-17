import React, { useState } from 'react';
import {
  XMarkIcon,
  UserIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  PhotoIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';

interface UpgradeRequest {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    phone?: string;
  };
  shopName: string;
  shopDescription: string;
  specialties: string[];
  experience: number;
  website?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  reason: string;
  images: string[];
  certificates: string[];
  identityProof: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  reviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  reviewNote?: string;
}

interface UpgradeRequestDetailModalProps {
  request: UpgradeRequest;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, note?: string) => Promise<void>;
  onReject: (id: string, note: string) => Promise<void>;
  loading?: boolean;
}

// Map backend specialties to Vietnamese
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

const STATUS_CONFIG = {
  pending: { label: 'Chờ duyệt', color: 'warning' as const },
  approved: { label: 'Đã duyệt', color: 'success' as const },
  rejected: { label: 'Từ chối', color: 'error' as const },
};

export const UpgradeRequestDetailModal: React.FC<
  UpgradeRequestDetailModalProps
> = ({ request, isOpen, onClose, onApprove, onReject, loading = false }) => {
  const [reviewNote, setReviewNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getDisplaySpecialties = (specialties: string[]) => {
    return specialties.map((s) => SPECIALTY_DISPLAY[s] || s).join(', ');
  };

  const handleApprove = async () => {
    await onApprove(request.id, reviewNote || undefined);
    onClose();
  };

  const handleReject = async () => {
    if (!reviewNote.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    await onReject(request.id, reviewNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Chi tiết yêu cầu nâng cấp
            </h2>
            <Badge variant={STATUS_CONFIG[request.status].color}>
              {STATUS_CONFIG[request.status].label}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-8">
            {/* User Info */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Thông tin người dùng
              </h3>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {request.user.avatarUrl ? (
                    <img
                      src={request.user.avatarUrl}
                      alt={`${request.user.firstName} ${request.user.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Họ tên</p>
                    <p className="font-medium">
                      {request.user.firstName} {request.user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{request.user.email}</p>
                  </div>
                  {request.user.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                      <p className="font-medium">{request.user.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Ngày gửi yêu cầu</p>
                    <p className="font-medium">
                      {formatDate(request.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Shop Info */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BriefcaseIcon className="w-5 h-5 mr-2" />
                Thông tin cửa hàng
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tên cửa hàng</p>
                  <p className="font-medium text-lg">{request.shopName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Chuyên môn</p>
                  <p className="font-medium">
                    {getDisplaySpecialties(request.specialties)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Kinh nghiệm</p>
                  <p className="font-medium">{request.experience} năm</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Mô tả cửa hàng</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {request.shopDescription}
                  </p>
                </div>
              </div>
            </Card>

            {/* Online Presence */}
            {(request.website ||
              request.facebook ||
              request.instagram ||
              request.youtube) && (
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <GlobeAltIcon className="w-5 h-5 mr-2" />
                  Hiện diện trực tuyến
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {request.website && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Website</p>
                      <a
                        href={request.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {request.website}
                      </a>
                    </div>
                  )}

                  {request.facebook && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Facebook</p>
                      <a
                        href={request.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {request.facebook}
                      </a>
                    </div>
                  )}

                  {request.instagram && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Instagram</p>
                      <a
                        href={request.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {request.instagram}
                      </a>
                    </div>
                  )}

                  {request.youtube && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">YouTube</p>
                      <a
                        href={request.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {request.youtube}
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Images */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <PhotoIcon className="w-5 h-5 mr-2" />
                Hình ảnh sản phẩm/workspace ({request.images.length})
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {request.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`Sản phẩm ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                      <EyeIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Certificates */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Chứng chỉ, bằng cấp ({request.certificates.length})
              </h3>

              <div className="space-y-3">
                {request.certificates.map((certificate, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <ShieldCheckIcon className="w-6 h-6 text-green-500" />
                      <span className="font-medium">Chứng chỉ {index + 1}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(certificate, '_blank')}
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Xem
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Identity Proof */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Giấy tờ tuy thân
              </h3>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-6 h-6 text-blue-500" />
                  <span className="font-medium">CMND/CCCD/Hộ chiếu</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(request.identityProof, '_blank')}
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  Xem
                </Button>
              </div>
            </Card>

            {/* Motivation */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Lý do muốn trở thành nghệ nhân
              </h3>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {request.reason}
                </p>
              </div>
            </Card>

            {/* Review History */}
            {request.status !== 'pending' && (
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  Lịch sử xét duyệt
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        request.status === 'approved'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <div>
                      <p className="font-medium">
                        {request.status === 'approved'
                          ? 'Đã duyệt'
                          : 'Đã từ chối'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(request.updatedAt)}
                        {request.reviewedBy && (
                          <>
                            {' '}
                            bởi {request.reviewedBy.firstName}{' '}
                            {request.reviewedBy.lastName}
                          </>
                        )}
                      </p>
                      {request.reviewNote && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            {request.reviewNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {request.status === 'pending' && (
          <div className="border-t bg-gray-50 p-6">
            <div className="space-y-4">
              {/* Review Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú xét duyệt (tùy chọn)
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  placeholder="Thêm ghi chú về quyết định của bạn..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                {showRejectForm ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRejectForm(false);
                        setReviewNote('');
                      }}
                      disabled={loading}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="error"
                      onClick={handleReject}
                      loading={loading}
                      leftIcon={<XCircleIcon className="w-4 h-4" />}
                    >
                      Xác nhận từ chối
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectForm(true)}
                      disabled={loading}
                      leftIcon={<XCircleIcon className="w-4 h-4" />}
                    >
                      Từ chối
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleApprove}
                      loading={loading}
                      leftIcon={<CheckCircleIcon className="w-4 h-4" />}
                    >
                      Duyệt yêu cầu
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <img
              src={request.images[selectedImageIndex]}
              alt={`Sản phẩm ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
