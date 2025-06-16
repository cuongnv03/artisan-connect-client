import React from 'react';
import { Post } from '../../../types/post';
import { PostCard } from './PostCard';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { Button } from '../../ui/Button';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';

interface PostsListProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  loading: boolean;
}

export const PostsList: React.FC<PostsListProps> = ({
  posts,
  onPostClick,
  hasMore,
  onLoadMore,
  loading,
}) => {
  const [targetRef] = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore,
  });

  return (
    <div className="space-y-6">
      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <PostCard
            key={`${post.id}-${index}`}
            post={post}
            onClick={onPostClick}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center py-6">
          <div ref={targetRef}>
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="md" />
                <span className="ml-2 text-gray-600">Đang tải thêm...</span>
              </div>
            ) : (
              <Button variant="outline" onClick={onLoadMore}>
                Xem thêm bài viết
              </Button>
            )}
          </div>
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500">Đã xem hết tất cả bài viết</p>
        </div>
      )}
    </div>
  );
};
