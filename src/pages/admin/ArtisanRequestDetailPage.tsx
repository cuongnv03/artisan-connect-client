import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
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
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Avatar } from '../../components/ui/Avatar';
import { useToastContext } from '../../contexts/ToastContext';
import { artisanService } from '../../services/artisan.service';
import {
  ArtisanUpgradeRequest,
  UpgradeRequestStatus,
} from '../../types/artisan';
import { User } from '../../types/auth';

interface RequestWithUser extends ArtisanUpgradeRequest {
  user: User;
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
  [UpgradeRequestStatus.PENDING]: {
    label: 'Chờ duyệt',
    color: 'warning' as const,
  },
  [UpgradeRequestStatus.APPROVED]: {
    label: 'Đã duyệt',
    color: 'success' as const,
  },
  [UpgradeRequestStatus.REJECTED]: {
    label: 'Từ chối',
    color: 'danger' as const,
  },
};

export const ArtisanRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToastContext();

  const [request, setRequest] = useState<RequestWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (id) {
      loadRequest(id);
    }
  }, [id]);

  const loadRequest = async (requestId: string) => {
    try {
      const response = await artisanService.getUpgradeRequestById(requestId);
      setRequest(response);
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi tải thông tin yêu cầu');
      navigate('/admin/artisan-requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!request || !id) return;

    setProcessing(true);
    try {
      await artisanService.approveUpgradeRequest(id, reviewNote || '');
      success(
        `Đã duyệt yêu cầu của ${request.user.firstName} ${request.user.lastName}`,
      );
      navigate('/admin/artisan-requests');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi duyệt yêu cầu');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!request || !id) return;

    if (!reviewNote.trim()) {
      error('Vui lòng nhập lý do từ chối');
      return;
    }

    setProcessing(true);
    try {
      await artisanService.rejectUpgradeRequest(id, reviewNote);
      success(
        `Đã từ chối yêu cầu của ${request.user.firstName} ${request.user.lastName}`,
      );
      navigate('/admin/artisan-requests');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi từ chối yêu cầu');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getDisplaySpecialties = (specialties: string[]) => {
    return specialties.map((s) => SPECIALTY_DISPLAY[s] || s).join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải thông tin yêu cầu...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Không tìm thấy yêu cầu
        </h2>
        <p className="text-gray-600 mb-4">
          Yêu cầu nâng cấp nghệ nhân không tồn tại hoặc đã bị xóa.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/artisan-requests')}
          leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/artisan-requests')}
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết yêu cầu nâng cấp
            </h1>
            <p className="text-gray-600">
              Xem xét và đánh giá yêu cầu trở thành nghệ nhân
            </p>
          </div>
        </div>
        <Badge variant={STATUS_CONFIG[request.status].color}>
          {STATUS_CONFIG[request.status].label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Info */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Thông tin người dùng
            </h3>

            <div className="flex items-start space-x-4">
              <Avatar
                src={request.user.avatarUrl}
                alt={`${request.user.firstName} ${request.user.lastName}`}
                size="xl"
              />

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
                  <p className="font-medium">{formatDate(request.createdAt)}</p>
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
            request.socialMedia?.facebook ||
            request.socialMedia?.instagram ||
            request.socialMedia?.youtube) && (
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
                      className="text-primary hover:underline break-all"
                    >
                      {request.website}
                    </a>
                  </div>
                )}

                {request.socialMedia?.facebook && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Facebook</p>
                    <a
                      href={request.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {request.socialMedia.facebook}
                    </a>
                  </div>
                )}

                {request.socialMedia?.instagram && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Instagram</p>
                    <a
                      href={request.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {request.socialMedia.instagram}
                    </a>
                  </div>
                )}

                {request.socialMedia?.youtube && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">YouTube</p>
                    <a
                      href={request.socialMedia.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {request.socialMedia.youtube}
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Review Actions */}
          {request.status === UpgradeRequestStatus.PENDING && (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Xét duyệt yêu cầu
              </h3>

              <div className="space-y-4">
                {/* Review Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú xét duyệt{' '}
                    {showRejectForm && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    placeholder={
                      showRejectForm
                        ? 'Nhập lý do từ chối...'
                        : 'Thêm ghi chú về quyết định của bạn...'
                    }
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {showRejectForm ? (
                    <>
                      <Button
                        variant="error"
                        className="w-full"
                        onClick={handleReject}
                        loading={processing}
                        leftIcon={<XCircleIcon className="w-4 h-4" />}
                      >
                        Xác nhận từ chối
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setShowRejectForm(false);
                          setReviewNote('');
                        }}
                        disabled={processing}
                      >
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleApprove}
                        loading={processing}
                        leftIcon={<CheckCircleIcon className="w-4 h-4" />}
                      >
                        Duyệt yêu cầu
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowRejectForm(true)}
                        disabled={processing}
                        leftIcon={<XCircleIcon className="w-4 h-4" />}
                      >
                        Từ chối yêu cầu
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Review History */}
          {request.status !== UpgradeRequestStatus.PENDING && (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Lịch sử xét duyệt
              </h3>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      request.status === UpgradeRequestStatus.APPROVED
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <div>
                    <p className="font-medium">
                      {request.status === UpgradeRequestStatus.APPROVED
                        ? 'Đã duyệt'
                        : 'Đã từ chối'}
                    </p>
                    <p className="text-sm text-gray-500">
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
                          {request.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Thống kê nhanh
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Hình ảnh:</span>
                <span className="text-sm font-medium">
                  {request.images.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Chứng chỉ:</span>
                <span className="text-sm font-medium">
                  {request.certificates.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Chuyên môn:</span>
                <span className="text-sm font-medium">
                  {request.specialties.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Kinh nghiệm:</span>
                <span className="text-sm font-medium">
                  {request.experience} năm
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
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
              <XCircleIcon className="w-8 h-8" />
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              {selectedImageIndex + 1} / {request.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
