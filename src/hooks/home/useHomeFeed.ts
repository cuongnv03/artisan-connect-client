import { useState, useEffect, useCallback } from 'react';
import { Post, PostPaginationResult } from '../../types';
import { postService } from '../../services/post.service';
import { useToastContext } from '../../contexts/ToastContext';

export const useHomeFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { error: showError } = useToastContext();

  const loadPosts = useCallback(
    async (pageNum = 1, reset = true) => {
      try {
        if (pageNum === 1) {
          if (reset) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }
        } else {
          setLoadingMore(true);
        }

        setError(null);
        let response: PostPaginationResult;

        try {
          // Try to load followed posts first
          response = await postService.getFollowedPosts({
            page: pageNum,
            limit: 10,
            sortBy: 'publishedAt',
            sortOrder: 'desc',
          });

          if (pageNum === 1 && response.data.length === 0) {
            // No followed posts, fallback to general posts
            setShowFallback(true);
            response = await postService.getPosts({
              page: pageNum,
              limit: 10,
              sortBy: 'publishedAt',
              sortOrder: 'desc',
              status: 'PUBLISHED',
            });
          } else {
            setShowFallback(false);
          }
        } catch (followedError) {
          // Fallback to general posts if followed posts fail
          console.warn(
            'Failed to load followed posts, falling back to general posts',
          );
          setShowFallback(true);
          response = await postService.getPosts({
            page: pageNum,
            limit: 10,
            sortBy: 'publishedAt',
            sortOrder: 'desc',
            status: 'PUBLISHED',
          });
        }

        if (reset) {
          setPosts(response.data);
        } else {
          setPosts((prev) => [...prev, ...response.data]);
        }

        setHasMore(pageNum < response.meta.totalPages);
        setCurrentPage(pageNum);
        setTotalPages(response.meta.totalPages);
      } catch (err: any) {
        console.error('Error loading posts:', err);
        const errorMessage = err.message || 'Không thể tải bảng tin';
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [showError],
  );

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && currentPage < totalPages) {
      loadPosts(currentPage + 1, false);
    }
  }, [loadingMore, hasMore, currentPage, totalPages, loadPosts]);

  const refresh = useCallback(() => {
    loadPosts(1, false);
  }, [loadPosts]);

  const reload = useCallback(() => {
    loadPosts(1, true);
  }, [loadPosts]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return {
    posts,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    showFallback,
    error,
    loadMore,
    refresh,
    reload,
  };
};
