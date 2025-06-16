import React from 'react';
import { Post } from '../../../types/post';
import { PostCard } from './PostCard';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { EmptyState } from '../../common/EmptyState';
import { PlusIcon } from '@heroicons/react/24/outline';

interface PostsListProps {
  posts: Post[];
  loading: boolean;
  onUpdate: () => void;
  onCreateNew?: () => void;
}

export const PostsList: React.FC<PostsListProps> = ({
  posts,
  loading,
  onUpdate,
  onCreateNew,
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<PlusIcon className="w-16 h-16" />}
        title="Bạn chưa có bài viết nào"
        description="Hãy tạo bài viết đầu tiên để chia sẻ câu chuyện của bạn"
        action={
          onCreateNew
            ? {
                label: 'Tạo bài viết đầu tiên',
                onClick: onCreateNew,
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onUpdate={onUpdate} />
      ))}
    </div>
  );
};
