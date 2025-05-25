import React from 'react';
import { Link } from 'react-router-dom';
import {
  StarIcon,
  MapPinIcon,
  UserPlusIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { ArtisanProfile } from '../../types/artisan';
import { User } from '../../types/auth';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ArtisanCardProps {
  artisan: ArtisanProfile & { user: User };
  showFollowButton?: boolean;
}

export const ArtisanCard: React.FC<ArtisanCardProps> = ({
  artisan,
  showFollowButton = true,
}) => {
  const handleFollow = async () => {
    try {
      // TODO: Implement follow logic
      console.log('Follow artisan:', artisan.id);
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      {/* Cover Image */}
      {artisan.shopBannerUrl && (
        <div className="h-32 bg-gradient-to-r from-primary to-primary-dark rounded-t-lg relative overflow-hidden">
          <img
            src={artisan.shopBannerUrl}
            alt={artisan.shopName}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Profile Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <Avatar
              src={artisan.user.avatarUrl}
              alt={`${artisan.user.firstName} ${artisan.user.lastName}`}
              size="lg"
              className={
                artisan.shopBannerUrl ? '-mt-8 border-4 border-white' : ''
              }
            />
            <div className="ml-3">
              <div className="flex items-center">
                <Link
                  to={`/artisans/${artisan.id}`}
                  className="font-semibold text-gray-900 hover:text-primary"
                >
                  {artisan.user.firstName} {artisan.user.lastName}
                </Link>
                {artisan.isVerified && (
                  <CheckBadgeIcon className="w-5 h-5 text-blue-500 ml-1" />
                )}
              </div>
              <p className="text-sm text-gray-500">{artisan.shopName}</p>
            </div>
          </div>

          {showFollowButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFollow}
              leftIcon={<UserPlusIcon className="w-4 h-4" />}
            >
              Theo dõi
            </Button>
          )}
        </div>

        {/* Shop Description */}
        {artisan.shopDescription && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {artisan.shopDescription}
          </p>
        )}

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-4">
          {artisan.specialties.slice(0, 3).map((specialty) => (
            <Badge key={specialty} variant="secondary" size="sm">
              {specialty}
            </Badge>
          ))}
          {artisan.specialties.length > 3 && (
            <Badge variant="secondary" size="sm">
              +{artisan.specialties.length - 3}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <StarIconSolid className="w-4 h-4 text-yellow-400 mr-1" />
              <span>{artisan.rating?.toFixed(1) || 'N/A'}</span>
              <span className="ml-1">({artisan.reviewCount})</span>
            </div>
            {artisan.experience && (
              <span>{artisan.experience} năm kinh nghiệm</span>
            )}
          </div>
          <div className="text-primary font-medium">
            {formatPrice(artisan.totalSales)}
          </div>
        </div>
      </div>
    </Card>
  );
};
