import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlusIcon,
  ChatBubbleLeftIcon,
  CogIcon,
  MapPinIcon,
  CalendarIcon,
  GlobeAltIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../../contexts/AuthContext';
import { useToastContext } from '../../../contexts/ToastContext';
import { userService } from '../../../services/user.service';
import { UserProfileDto } from '../../../types/user';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';

interface ArtisanProfileHeaderProps {
  artisan: UserProfileDto;
  isOwnProfile: boolean;
}

export const ArtisanProfileHeader: React.FC<ArtisanProfileHeaderProps> = ({
  artisan,
  isOwnProfile,
}) => {
  const { state: authState } = useAuth();
  const { success, error } = useToastContext();
  const navigate = useNavigate();

  // Sử dụng state đơn giản như ArtisanSuggestions
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(artisan.followerCount);
  const [followingCount, setFollowingCount] = useState(artisan.followingCount);
  const [followLoading, setFollowLoading] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    if (!isOwnProfile) {
      loadFollowStats();
    } else {
      setStatsLoaded(true);
    }
  }, [artisan.id, isOwnProfile]);

  const loadFollowStats = async () => {
    try {
      setStatsLoaded(false);
      const stats = await userService.getFollowStats(artisan.id);
      setIsFollowing(stats.isFollowing || false);
      setFollowersCount(stats.followersCount || artisan.followerCount);
      setFollowingCount(stats.followingCount || artisan.followingCount);
      setStatsLoaded(true);
    } catch (err) {
      console.error('Error loading follow stats:', err);
      setIsFollowing(false);
      setStatsLoaded(true);
    }
  };

  const handleFollow = async () => {
    if (isOwnProfile || followLoading) return;

    setFollowLoading(true);

    try {
      if (isFollowing) {
        await userService.unfollowUser(artisan.id);
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
        success('Đã bỏ theo dõi');
      } else {
        await userService.followUser(artisan.id);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
        success('Đã theo dõi');
      }

      // Reload stats sau 500ms
      setTimeout(loadFollowStats, 500);
    } catch (err: any) {
      console.error('Error following user:', err);
      if (
        err.message?.includes('Already following') ||
        err.response?.status === 409
      ) {
        setIsFollowing(true);
        success('Bạn đã theo dõi người này rồi');
      } else {
        error(err.message || 'Có lỗi xảy ra khi thực hiện thao tác');
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (isOwnProfile) return;
    navigate(`/messages/${artisan.id}`);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ARTISAN':
        return 'Nghệ nhân';
      case 'ADMIN':
        return 'Quản trị viên';
      default:
        return 'Khách hàng';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ARTISAN':
        return 'primary';
      case 'ADMIN':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="p-0 mb-8 overflow-hidden">
      {/* Cover Image */}
      <div className="h-48 md:h-64 relative bg-gradient-to-r from-blue-500 to-purple-600">
        {artisan.profile?.coverUrl && (
          <img
            src={artisan.profile.coverUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>

      {/* Profile Info */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
          {/* Avatar */}
          <div className="flex-shrink-0 -mt-12 sm:-mt-16 mb-2 sm:mb-0">
            <Avatar
              src={artisan.avatarUrl}
              alt={`${artisan.firstName} ${artisan.lastName}`}
              size="2xl"
              className="border-4 border-white shadow-lg bg-white ring-2 ring-gray-100"
            />
          </div>

          {/* User Details */}
          <div className="flex-1 pt-2 sm:pt-4 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {artisan.firstName} {artisan.lastName}
                  </h1>
                  {artisan.isVerified && (
                    <CheckBadgeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
                  )}
                  <Badge
                    variant={getRoleBadgeVariant(artisan.role) as any}
                    size="sm"
                  >
                    {getRoleDisplayName(artisan.role)}
                  </Badge>
                </div>

                <p className="text-gray-600 mb-1 text-sm sm:text-base">
                  @{artisan.username}
                </p>

                {artisan.bio && (
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                    {artisan.bio}
                  </p>
                )}

                {/* Artisan Shop Info */}
                {artisan.artisanProfile && (
                  <div className="mb-3 sm:mb-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {artisan.artisanProfile.shopName}
                    </h3>
                    {artisan.artisanProfile.shopDescription && (
                      <p className="text-sm text-gray-600">
                        {artisan.artisanProfile.shopDescription}
                      </p>
                    )}
                  </div>
                )}

                {/* Additional profile info */}
                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  {artisan.profile?.location && (
                    <div className="flex items-center">
                      <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {artisan.profile.location}
                      </span>
                    </div>
                  )}
                  {artisan.profile?.website && (
                    <div className="flex items-center">
                      <GlobeAltIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <a
                        href={artisan.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        Website
                      </a>
                    </div>
                  )}
                  <div className="flex items-center">
                    <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    <span>
                      Tham gia{' '}
                      {new Date(artisan.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 sm:gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-semibold text-gray-900">
                      {followersCount}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      Người theo dõi
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-semibold text-gray-900">
                      {followingCount}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      Đang theo dõi
                    </div>
                  </div>
                  {artisan.artisanProfile && (
                    <>
                      <div className="text-center">
                        <div className="text-base sm:text-lg font-semibold text-gray-900">
                          {artisan.artisanProfile.reviewCount}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          Đánh giá
                        </div>
                      </div>
                      {artisan.artisanProfile.rating && (
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-semibold text-gray-900">
                            {artisan.artisanProfile.rating.toFixed(1)}⭐
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            Xếp hạng
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                {isOwnProfile ? (
                  <>
                    <Link to="/profile">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<PencilIcon className="w-4 h-4" />}
                      >
                        <span className="hidden sm:inline">
                          Quản lý thông tin
                        </span>
                        <span className="sm:hidden">Quản lý</span>
                      </Button>
                    </Link>
                    <Link to="/artisan/dashboard">
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<CogIcon className="w-4 h-4" />}
                      >
                        <span className="hidden sm:inline">Dashboard</span>
                        <span className="sm:hidden">
                          <CogIcon className="w-4 h-4" />
                        </span>
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button
                      variant={isFollowing ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={handleFollow}
                      loading={followLoading}
                      disabled={followLoading}
                      leftIcon={<UserPlusIcon className="w-4 h-4" />}
                    >
                      <span className="hidden sm:inline">
                        {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                      </span>
                      <span className="sm:hidden">
                        {isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendMessage}
                      leftIcon={<ChatBubbleLeftIcon className="w-4 h-4" />}
                    >
                      <span className="hidden sm:inline">Nhắn tin</span>
                      <span className="sm:hidden">
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                      </span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
