import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastContext } from '../../contexts/ToastContext';
import { userService } from '../../services/user.service';
import { UserProfileDto } from '../../types/user';

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

  // Đơn giản hóa state như ArtisanSuggestions
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

      // Reload stats sau 500ms để đảm bảo consistency
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

  // Trả về object tương thích với ArtisanProfileHeader
  return {
    followStats: {
      followersCount,
      followingCount,
      isFollowing,
      isFollowedBy: false, // Không cần thiết cho UI hiện tại
    },
    followLoading,
    statsLoaded,
    handleFollow,
    handleSendMessage,
    refreshStats: loadFollowStats,
  };
};
