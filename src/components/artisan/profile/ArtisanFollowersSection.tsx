import React from 'react';
import { Link } from 'react-router-dom';
import { useArtisanFollowers } from '../../../hooks/artisan/useArtisanFollowers';
import { Card } from '../../ui/Card';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { EmptyState } from '../../common/EmptyState';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { UserProfileDto } from '../../../types/user';

interface ArtisanFollowersSectionProps {
  artisan: UserProfileDto;
}

export const ArtisanFollowersSection: React.FC<
  ArtisanFollowersSectionProps
> = ({ artisan }) => {
  const {
    followers,
    following,
    activeTab,
    setActiveTab,
    loading,
    hasMore,
    loadMore,
  } = useArtisanFollowers(artisan.id);

  const currentList = activeTab === 'followers' ? followers : following;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-fit">
        <button
          onClick={() => setActiveTab('followers')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'followers'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Người theo dõi ({artisan.followerCount})
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'following'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Đang theo dõi ({artisan.followingCount})
        </button>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {currentList.length > 0 ? (
          <>
            {currentList.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar
                      src={user.avatarUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      size="md"
                    />
                    <div>
                      <Link
                        to={`/artisan/${user.id}`}
                        className="font-medium text-gray-900 hover:text-primary"
                      >
                        {user.firstName} {user.lastName}
                      </Link>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                      {user.bio && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {user.role === 'ARTISAN' && (
                      <Badge variant="primary" size="sm">
                        Nghệ nhân
                      </Badge>
                    )}
                    {user.isVerified && (
                      <Badge variant="success" size="sm">
                        Đã xác minh
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {hasMore && (
              <div className="flex justify-center py-4">
                {loading ? (
                  <LoadingSpinner size="md" />
                ) : (
                  <Button variant="outline" onClick={loadMore}>
                    Tải thêm
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title={
              activeTab === 'followers'
                ? 'Chưa có người theo dõi'
                : 'Chưa theo dõi ai'
            }
            description={
              activeTab === 'followers'
                ? 'Nghệ nhân này chưa có người theo dõi nào.'
                : 'Nghệ nhân này chưa theo dõi ai.'
            }
          />
        )}
      </div>
    </div>
  );
};
