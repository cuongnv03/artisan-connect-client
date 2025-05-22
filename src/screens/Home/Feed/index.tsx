import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { PostCard } from '../../../components/data/PostCard';
import { Loader } from '../../../components/feedback/Loader';
import { Alert } from '../../../components/feedback/Alert';
import { PostService } from '../../../services/post.service';
import { Button } from '../../../components/form/Button';
import { FeedEmpty } from './components/FeedEmpty';
import { FeedFilterBar } from './components/FilterBar';
import { PostType } from '../../../types/post.types';

export const NewsFeed: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Transform filter to API params
  const getFilterParams = () => {
    let params: any = { followedOnly: true };

    if (selectedFilter && selectedFilter !== 'all') {
      params.type = selectedFilter as PostType;
    }

    return params;
  };

  // Fetch posts
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery(
    ['feed', page, selectedFilter],
    () =>
      PostService.getPosts({
        page,
        limit: 10,
        ...getFilterParams(),
      }),
    {
      keepPreviousData: true,
      staleTime: 60000, // 1 minute
    },
  );

  // Handle post interactions
  const handleLikePost = async (postId: string) => {
    try {
      await PostService.likePost(postId);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleSavePost = async (postId: string) => {
    try {
      await PostService.savePost(postId);
    } catch (err) {
      console.error('Failed to save post:', err);
    }
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setPage(1); // Reset to first page when filter changes
  };

  // Render empty state if no posts
  if (data?.data.length === 0 && !isLoading) {
    return <FeedEmpty />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Filter Bar */}
      <FeedFilterBar
        selected={selectedFilter || 'all'}
        onChange={handleFilterChange}
      />

      {/* Error State */}
      {isError && (
        <Alert
          type="error"
          variant="subtle"
          className="mb-4"
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          }
        >
          {(error as Error).message || 'Failed to load posts'}
        </Alert>
      )}

      {/* Post List */}
      <div className="space-y-6">
        {data?.data.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLikePost}
            onSave={handleSavePost}
            onComment={() => {}}
            onShare={() => {}}
          />
        ))}
      </div>

      {/* Loading States */}
      {isLoading && <Loader size="lg" className="my-8" />}
      {isFetching && !isLoading && (
        <div className="text-center my-4">
          <Loader size="sm" />
        </div>
      )}

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-between items-center my-8">
          <Button
            variant="outline"
            disabled={page === 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>

          <span className="text-sm text-gray-500">
            Page {page} of {data.meta.totalPages}
          </span>

          <Button
            variant="outline"
            disabled={page >= data.meta.totalPages || isLoading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
