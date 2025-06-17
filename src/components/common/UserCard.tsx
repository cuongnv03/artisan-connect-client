import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlusIcon,
  MapPinIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { User } from '../../types/auth';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface UserCardProps {
  user: User;
  showFollowButton?: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  followLoading?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  showFollowButton = true,
  isFollowing = false,
  onFollow,
  followLoading = false,
}) => {
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

  // Chỉ người có role ARTISAN mới có thể xem được profile link
  const getProfileLink = () => {
    if (user.role === 'ARTISAN') {
      return `/artisan/${user.id}`; // SỬA: sử dụng đúng đường dẫn
    }
    return `/profile/${user.id}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* User Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Avatar
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
              size="lg"
            />
            <div className="ml-3">
              <Link
                to={getProfileLink()}
                className="font-semibold text-gray-900 hover:text-primary"
              >
                {user.firstName} {user.lastName}
              </Link>
              <p className="text-sm text-gray-500">@{user.username}</p>
              <Badge
                variant={getRoleBadgeVariant(user.role) as any}
                size="sm"
                className="mt-1"
              >
                {getRoleDisplayName(user.role)}
              </Badge>
            </div>
          </div>

          {showFollowButton && user.role === 'ARTISAN' && (
            <Button
              variant={isFollowing ? 'secondary' : 'outline'}
              size="sm"
              onClick={onFollow}
              loading={followLoading}
              leftIcon={<UserPlusIcon className="w-4 h-4" />}
            >
              {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
            </Button>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{user.bio}</p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>{user.followerCount} người theo dõi</span>
            <span>{user.followingCount} đang theo dõi</span>
          </div>
          {user.isVerified && (
            <Badge variant="success" size="sm">
              Đã xác minh
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};
