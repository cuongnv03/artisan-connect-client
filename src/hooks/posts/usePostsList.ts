import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { postService } from '../../services/post.service';
import { Post, GetPostsQuery } from '../../types/post';

export const usePostsList = (query: GetPostsQuery = {}) => {
  const { state: authState } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
    limit: 20,
  });

  const loadPosts = useCallback(
    async (resetPage = false) => {
      if (!authState.isAuthenticated) return;

      setLoading(true);
      try {
        const currentPage = resetPage ? 1 : pagination.page;

        // Use my posts API for personal posts management
        const isMyPosts = !query.userId && !query.followedOnly;

        let result;
        if (isMyPosts) {
          const response = await postService.getMyPosts({
            ...query,
            page: currentPage,
            limit: pagination.limit,
          });
          result = response.posts;
        } else {
          result = await postService.getPosts({
            ...query,
            page: currentPage,
            limit: pagination.limit,
          });
        }

        if (resetPage) {
          setPosts(result.data);
        } else {
          setPosts((prev) => [...prev, ...result.data]);
        }

        setPagination({
          total: result.meta.total,
          page: result.meta.page,
          totalPages: result.meta.totalPages,
          limit: result.meta.limit,
        });
      } catch (error) {
        console.error('Error loading posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    },
    [authState.isAuthenticated, query, pagination.limit], // Remove pagination.page from dependencies
  );

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages && !loading) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [pagination.page, pagination.totalPages, loading]);

  const refresh = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadPosts(true);
  }, [loadPosts]);

  // Load posts when query changes or page changes
  useEffect(() => {
    if (pagination.page === 1) {
      loadPosts(true);
    } else {
      loadPosts(false);
    }
  }, [JSON.stringify(query)]); // Use JSON.stringify to detect deep changes

  // Load more when page changes (but not on first load)
  useEffect(() => {
    if (pagination.page > 1) {
      loadPosts(false);
    }
  }, [pagination.page]);

  return {
    posts,
    loading,
    pagination,
    loadMore,
    refresh,
    hasMore: pagination.page < pagination.totalPages,
  };
};
