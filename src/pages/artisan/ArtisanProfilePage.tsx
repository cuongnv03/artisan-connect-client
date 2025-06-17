import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArtisanProfileHeader } from '../../components/artisan/profile/ArtisanProfileHeader';
import { ArtisanProfileTabs } from '../../components/artisan/profile/ArtisanProfileTabs';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { userService } from '../../services/user.service';
import { UserProfileDto } from '../../types/user';

export const ArtisanProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { state: authState } = useAuth();
  const [artisan, setArtisan] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !userId || userId === authState.user?.id;
  const targetUserId = userId || authState.user?.id;

  useEffect(() => {
    if (targetUserId) {
      loadArtisanProfile();
    }
  }, [targetUserId]);

  const loadArtisanProfile = async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      const userProfile = await userService.getUserProfile(targetUserId);
      setArtisan(userProfile);
    } catch (err) {
      console.error('Error loading artisan profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải trang cá nhân...</p>
        </div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <EmptyState
        icon={<UserGroupIcon className="w-16 h-16" />}
        title="Không tìm thấy nghệ nhân"
        description="Nghệ nhân này không tồn tại hoặc đã bị xóa"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ArtisanProfileHeader artisan={artisan} isOwnProfile={isOwnProfile} />
      <ArtisanProfileTabs artisan={artisan} isOwnProfile={isOwnProfile} />
    </div>
  );
};
