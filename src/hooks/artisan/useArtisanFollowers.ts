import { useState, useEffect } from 'react';
import { userService } from '../../services/user.service';
import { User } from '../../types/auth';

type TabType = 'followers' | 'following';

export const useArtisanFollowers = (artisanId: string) => {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('followers');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [artisanId, activeTab]);

  const loadData = async (reset = true) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;

      let result;
      if (activeTab === 'followers') {
        result = await userService.getFollowers(artisanId, currentPage, 20);
      } else {
        result = await userService.getFollowing(artisanId, currentPage, 20);
      }

      const newData = result.data;

      if (activeTab === 'followers') {
        if (reset) {
          setFollowers(newData);
        } else {
          setFollowers((prev) => [...prev, ...newData]);
        }
      } else {
        if (reset) {
          setFollowing(newData);
        } else {
          setFollowing((prev) => [...prev, ...newData]);
        }
      }

      setHasMore(currentPage < result.meta.totalPages);
      setPage(reset ? 2 : currentPage + 1);
    } catch (err) {
      console.error('Error loading followers/following:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadData(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
    setHasMore(true);
  };

  return {
    followers,
    following,
    activeTab,
    setActiveTab: handleTabChange,
    loading,
    hasMore,
    loadMore,
  };
};
