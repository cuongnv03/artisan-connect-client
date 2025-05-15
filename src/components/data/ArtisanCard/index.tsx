import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { Card } from '../../common/Card';
import { Avatar } from '../../common/Avatar';
import { Badge } from '../../common/Badge';
import { Button } from '../../form/Button';
import { FollowService } from '../../../services/follow.service';
import { UserWithArtisanProfile } from '../../../types/user.types';
import { StarIcon, CheckIcon } from '@heroicons/react/24/solid';

interface ArtisanCardProps {
  artisan: UserWithArtisanProfile;
}

export const ArtisanCard: React.FC<ArtisanCardProps> = ({ artisan }) => {
  const queryClient = useQueryClient();

  // Follow/unfollow mutation
  const followMutation = useMutation(
    (action: 'follow' | 'unfollow') =>
      action === 'follow'
        ? FollowService.followUser(artisan.id)
        : FollowService.unfollowUser(artisan.id),
    {
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries(['discover-artisans']);
        queryClient.invalidateQueries(['following']);
      },
    },
  );

  const handleFollowToggle = () => {
    followMutation.mutate(artisan.isFollowing ? 'unfollow' : 'follow');
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      {/* Cover image if available */}
      {artisan.artisanProfile?.shopBannerUrl && (
        <div className="h-32 -mx-6 -mt-6 mb-4 relative">
          <img
            src={artisan.artisanProfile.shopBannerUrl}
            alt={
              artisan.artisanProfile.shopName || `${artisan.firstName}'s shop`
            }
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-start">
        <Avatar
          src={artisan.avatarUrl}
          firstName={artisan.firstName}
          lastName={artisan.lastName}
          size="lg"
          status={artisan.artisanProfile?.isVerified ? 'online' : undefined}
        />

        <div className="ml-4 flex-1 min-w-0">
          <Link to={`/artisan/${artisan.id}`} className="block group">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-accent truncate">
              {artisan.artisanProfile?.shopName ||
                `${artisan.firstName} ${artisan.lastName}`}
            </h3>
          </Link>

          <div className="flex items-center mt-1 flex-wrap">
            {artisan.artisanProfile?.isVerified && (
              <Badge variant="info" size="sm" rounded className="mr-2 mb-1">
                <CheckIcon className="h-3 w-3 mr-1" /> Verified
              </Badge>
            )}

            {artisan.artisanProfile?.rating && (
              <span className="flex items-center text-sm text-gray-600 mr-2 mb-1">
                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                {artisan.artisanProfile.rating}
                <span className="text-xs text-gray-500 ml-1">
                  ({artisan.artisanProfile.reviewCount})
                </span>
              </span>
            )}

            <span className="text-sm text-gray-600 mb-1">
              {artisan.followerCount} followers
            </span>
          </div>

          {artisan.artisanProfile?.specialties && (
            <div className="mt-2 flex flex-wrap gap-1">
              {artisan.artisanProfile.specialties
                .slice(0, 3)
                .map((specialty, index) => (
                  <Badge key={index} variant="default" size="sm" rounded>
                    {specialty}
                  </Badge>
                ))}
              {artisan.artisanProfile.specialties.length > 3 && (
                <Badge variant="default" size="sm" rounded>
                  +{artisan.artisanProfile.specialties.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Button
          variant={artisan.isFollowing ? 'outline' : 'primary'}
          size="sm"
          isFullWidth
          onClick={handleFollowToggle}
          isLoading={followMutation.isLoading}
        >
          {artisan.isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>
    </Card>
  );
};
