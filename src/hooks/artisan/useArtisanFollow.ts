import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastContext } from '../../contexts/ToastContext';
import { userService } from '../../services/user.service';
import { UserProfileDto } from '../../types/user';

interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
}

interface UseArtisanFollowProps {
  artisan: UserProfileDto;
  isOwnProfile: boolean;
}

export const useArtisanFollow = ({
  artisan,
  isOwnProfile,
}: UseArtisanFollowProps) => {
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const [followStats, setFollowStats] = useState<FollowStats>({
    followersCount: artisan.followerCount,
    followingCount: artisan.followingCount,
    isFollowing: false,
    isFollowedBy: false,
  });
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!isOwnProfile) {
      loadFollowStats();
    }
  }, [artisan.id, isOwnProfile]);

  const loadFollowStats = async () => {
    try {
      const stats = await userService.getFollowStats(artisan.id);
      setFollowStats(stats);
    } catch (err) {
      console.error('Error loading follow stats:', err);
    }
  };

  const handleFollow = async () => {
    if (isOwnProfile || followLoading) return;

    setFollowLoading(true);
    try {
      if (followStats.isFollowing) {
        await userService.unfollowUser(artisan.id);
        setFollowStats((prev) => ({
          ...prev,
          isFollowing: false,
          followersCount: Math.max(0, prev.followersCount - 1),
        }));
        success('Đã bỏ theo dõi');
      } else {
        await userService.followUser(artisan.id);
        setFollowStats((prev) => ({
          ...prev,
          isFollowing: true,
          followersCount: prev.followersCount + 1,
        }));
        success('Đã theo dõi');
      }

      // Reload stats for consistency
      setTimeout(loadFollowStats, 500);
    } catch (err: any) {
      console.error('Error following user:', err);
      if (
        err.message?.includes('Already following') ||
        err.response?.status === 409
      ) {
        setFollowStats((prev) => ({ ...prev, isFollowing: true }));
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

  return {
    followStats,
    followLoading,
    handleFollow,
    handleSendMessage,
    refreshStats: loadFollowStats,
  };
};
