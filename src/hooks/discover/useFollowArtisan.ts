import { useState, useCallback } from 'react';
import { userService } from '../../services/user.service';
import { useToastContext } from '../../contexts/ToastContext';

interface FollowState {
  isFollowing: boolean;
  loading: boolean;
}

export const useFollowArtisan = () => {
  const [followStates, setFollowStates] = useState<Record<string, FollowState>>(
    {},
  );
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const { success, error } = useToastContext();

  const getFollowState = useCallback(
    (userId: string): FollowState => {
      return followStates[userId] || { isFollowing: false, loading: false };
    },
    [followStates],
  );

  const handleFollow = useCallback(
    async (userId: string) => {
      setFollowLoading(userId);

      try {
        const currentState = getFollowState(userId);

        if (currentState.isFollowing) {
          await userService.unfollowUser(userId);
          setFollowStates((prev) => ({
            ...prev,
            [userId]: { isFollowing: false, loading: false },
          }));
          success('Đã bỏ theo dõi');
        } else {
          await userService.followUser(userId);
          setFollowStates((prev) => ({
            ...prev,
            [userId]: { isFollowing: true, loading: false },
          }));
          success('Đã theo dõi');
        }
      } catch (err: any) {
        console.error('Error following user:', err);
        error(err.message || 'Có lỗi xảy ra khi thực hiện thao tác');
      } finally {
        setFollowLoading(null);
      }
    },
    [getFollowState, success, error],
  );

  return {
    followStates,
    followLoading,
    getFollowState,
    handleFollow,
  };
};
