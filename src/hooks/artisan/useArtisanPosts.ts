import { useState, useEffect } from 'react';
import { postService } from '../../services/post.service';
import { Post, PostType } from '../../types/post';

interface PostFilters {
  type: PostType | '';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const useArtisanPosts = (artisanId: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PostFilters>({
    type: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    loadPosts();
  }, [artisanId, filters]);

  const loadPosts = async (reset = true) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const result = await postService.getPosts({
        userId: artisanId,
        page: currentPage,
        limit: 12,
        type: filters.type || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      if (reset) {
        setPosts(result.data);
        setPage(1);
      } else {
        setPosts((prev) => [...prev, ...result.data]);
      }

      setHasMore(currentPage < result.meta.totalPages);
      setPage((prev) => (reset ? 2 : prev + 1));
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = () => {
    if (!loading && hasMore) {
      loadPosts(false);
    }
  };

  return {
    posts,
    loading,
    hasMore,
    filters,
    setFilters,
    loadPosts: () => loadPosts(true),
    loadMorePosts,
  };
};
