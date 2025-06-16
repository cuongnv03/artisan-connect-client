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
        const result = await postService.getPosts({
          ...query,
          page: currentPage,
          limit: pagination.limit,
        });

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
      } finally {
        setLoading(false);
      }
    },
    [authState.isAuthenticated, query, pagination.page, pagination.limit],
  );

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [pagination.page, pagination.totalPages]);

  const refresh = useCallback(() => {
    loadPosts(true);
  }, [loadPosts]);

  useEffect(() => {
    loadPosts();
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
