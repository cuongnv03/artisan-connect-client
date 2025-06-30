import React from 'react';
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  StarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { AdminUserDetailDto } from '../../types/admin-user';
import { UserRole, UserStatus } from '../../types/auth';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';
import {
  formatDate,
  formatPrice,
  formatRelativeTime,
} from '../../utils/format';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUserDetailDto | null;
  loading?: boolean;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
  loading = false,
}) => {
  if (!user) return null;

  const getRoleBadge = (role: UserRole) => {
    const configs = {
      [UserRole.ADMIN]: { variant: 'danger' as const, text: 'Quản trị viên' },
      [UserRole.ARTISAN]: { variant: 'primary' as const, text: 'Nghệ nhân' },
      [UserRole.CUSTOMER]: {
        variant: 'secondary' as const,
        text: 'Khách hàng',
      },
    };
    const config = configs[role];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getStatusBadge = (status: UserStatus) => {
    const configs = {
      [UserStatus.ACTIVE]: { variant: 'success' as const, text: 'Hoạt động' },
      [UserStatus.INACTIVE]: {
        variant: 'secondary' as const,
        text: 'Không hoạt động',
      },
      [UserStatus.SUSPENDED]: { variant: 'warning' as const, text: 'Đình chỉ' },
      [UserStatus.DELETED]: { variant: 'danger' as const, text: 'Đã xóa' },
    };
    const config = configs[status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={`Chi tiết người dùng: ${user.firstName} ${user.lastName}`}
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar
                src={user.avatarUrl || undefined}
                alt={`${user.firstName} ${user.lastName}`}
                size="xl"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  {user.isVerified && (
                    <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
                  )}
                </div>

                <div className="flex items-center space-x-4 mb-3">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                  {user.emailVerified && (
                    <Badge variant="success" size="sm">
                      Email đã xác minh
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    {user.email}
                  </div>
                  <div className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-2" />@{user.username}
                  </div>
                  {user.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      {user.phone}
                    </div>
                  )}
                  {user.profile?.location && (
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      {user.profile.location}
                    </div>
                  )}
                </div>

                {user.bio && <p className="mt-3 text-gray-700">{user.bio}</p>}
              </div>
            </div>
          </Card>

          {/* Stats for all users */}
          <Card className="p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Thống kê hoạt động
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {user.stats?.postsCount || 0}
                </div>
                <div className="text-sm text-gray-500">Bài viết</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {user.stats?.productsCount || 0}
                </div>
                <div className="text-sm text-gray-500">Sản phẩm</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {user.stats?.ordersCount || 0}
                </div>
                <div className="text-sm text-gray-500">Đơn mua</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {user.stats?.salesCount || 0}
                </div>
                <div className="text-sm text-gray-500">Đơn bán</div>
              </div>
            </div>
          </Card>

          {/* Artisan Profile - Only for ARTISAN role */}
          {user.role === UserRole.ARTISAN && user.artisanProfile && (
            <Card className="p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BuildingStorefrontIcon className="w-5 h-5 mr-2" />
                Thông tin nghệ nhân
              </h4>

              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">
                    {user.artisanProfile.shopName}
                    {user.artisanProfile.isVerified && (
                      <ShieldCheckIcon className="w-4 h-4 text-blue-500 inline ml-2" />
                    )}
                  </h5>
                  {user.artisanProfile.shopDescription && (
                    <p className="text-gray-600 text-sm">
                      {user.artisanProfile.shopDescription}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">
                      {user.artisanProfile.rating?.toFixed(1) || 'N/A'}(
                      {user.artisanProfile.reviewCount} đánh giá)
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-500">Tổng doanh thu: </span>
                    <span className="font-medium">
                      {formatPrice(user.artisanProfile.totalSales)}
                    </span>
                  </div>

                  {user.artisanProfile.experience && (
                    <div className="text-sm">
                      <span className="text-gray-500">Kinh nghiệm: </span>
                      <span className="font-medium">
                        {user.artisanProfile.experience} năm
                      </span>
                    </div>
                  )}
                </div>

                {user.artisanProfile.specialties.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500 block mb-2">
                      Chuyên môn:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {user.artisanProfile.specialties.map(
                        (specialty, index) => (
                          <Badge key={index} variant="secondary" size="sm">
                            {specialty}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {user.artisanProfile.website && (
                  <div className="flex items-center text-sm">
                    <GlobeAltIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <a
                      href={user.artisanProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {user.artisanProfile.website}
                    </a>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Profile Details */}
          {user.profile && (
            <Card className="p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Thông tin cá nhân
              </h4>

              <div className="space-y-3">
                {user.profile.dateOfBirth && (
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      Ngày sinh: {formatDate(user.profile.dateOfBirth)}
                    </span>
                  </div>
                )}

                {user.profile.gender && (
                  <div className="text-sm">
                    <span className="text-gray-500">Giới tính: </span>
                    <span className="capitalize">{user.profile.gender}</span>
                  </div>
                )}

                {user.profile.website && (
                  <div className="flex items-center text-sm">
                    <GlobeAltIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <a
                      href={user.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {user.profile.website}
                    </a>
                  </div>
                )}

                {user.profile.socialLinks &&
                  Object.keys(user.profile.socialLinks).length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500 block mb-2">
                        Mạng xã hội:
                      </span>
                      <div className="space-y-1">
                        {Object.entries(user.profile.socialLinks).map(
                          ([platform, url]) => (
                            <div key={platform} className="text-sm">
                              <span className="capitalize text-gray-500">
                                {platform}:{' '}
                              </span>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {url}
                              </a>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {user.profile.addresses.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500 block mb-2">
                      Địa chỉ:
                    </span>
                    <div className="space-y-2">
                      {user.profile.addresses.map((address) => (
                        <div
                          key={address.id}
                          className="text-sm bg-gray-50 p-3 rounded"
                        >
                          <div className="font-medium">
                            {address.fullName}
                            {address.isDefault && (
                              <Badge
                                variant="primary"
                                size="sm"
                                className="ml-2"
                              >
                                Mặc định
                              </Badge>
                            )}
                          </div>
                          <div className="text-gray-600">
                            {address.street}, {address.city}, {address.state}{' '}
                            {address.zipCode}
                          </div>
                          {address.phone && (
                            <div className="text-gray-600">
                              SĐT: {address.phone}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Metadata */}
          <Card className="p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Thông tin hệ thống
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Ngày tham gia: </span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-500">Cập nhật cuối: </span>
                <span>{formatRelativeTime(user.updatedAt)}</span>
              </div>
              {user.lastSeenAt && (
                <div>
                  <span className="text-gray-500">Truy cập cuối: </span>
                  <span>{formatRelativeTime(user.lastSeenAt)}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">ID: </span>
                <span className="font-mono text-xs">{user.id}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Modal>
  );
};
