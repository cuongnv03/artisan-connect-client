import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { usePostModal } from '../../hooks/posts';
import { PostCard as CustomerPostCard } from '../posts/customer/PostCard';
import { PostCard } from '../posts/artisan/PostCard';
import { PostModal } from '../posts/customer/PostModal';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface HomeFeedProps {
  posts: Post[];
  hasMore: boolean;
  loadingMore: boolean;
  showFallback: boolean;
  onLoadMore: () => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  posts,
  hasMore,
  loadingMore,
  showFallback,
  onLoadMore,
}) => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { selectedPost, isOpen, openModal, closeModal } = usePostModal();

  const handlePostClick = (post: Post) => {
    if (authState.user?.role === 'ARTISAN') {
      // Artisan chuyển tới trang detail riêng
      navigate(`/posts/manage/${post.id}`);
    } else {
      // Customer mở modal
      openModal(post);
    }
  };

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<UserGroupIcon className="w-16 h-16" />}
        title="Chưa có bài viết nào"
        description={
          showFallback
            ? 'Hiện tại chưa có bài viết nào trong cộng đồng. Hãy là người đầu tiên chia sẻ!'
            : 'Những người bạn theo dõi chưa có bài viết mới. Hãy khám phá thêm nghệ nhân!'
        }
        action={{
          label: showFallback ? 'Tạo bài viết đầu tiên' : 'Khám phá nghệ nhân',
          onClick: () => navigate(showFallback ? '/posts/create' : '/discover'),
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) =>
        authState.user?.role === 'CUSTOMER' ? (
          <CustomerPostCard
            key={`${post.id}-${index}`}
            post={post}
            onClick={handlePostClick}
          />
        ) : (
          <PostCard
            key={`${post.id}-${index}`}
            post={post}
            showAuthor={true}
            onClick={() => handlePostClick(post)}
          />
        ),
      )}

      {/* Modal for customers */}
      {authState.user?.role === 'CUSTOMER' && (
        <PostModal post={selectedPost} isOpen={isOpen} onClose={closeModal} />
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center py-6">
          <Button variant="outline" onClick={onLoadMore} loading={loadingMore}>
            {loadingMore ? 'Đang tải...' : 'Xem thêm bài viết'}
          </Button>
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-600">
            <SparklesIcon className="w-5 h-5 mr-2" />
            <span className="text-sm">
              {showFallback
                ? 'Bạn đã xem hết tất cả bài viết'
                : 'Bạn đã xem hết bài viết mới từ những người bạn theo dõi'}
            </span>
          </div>
          {!showFallback && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/discover')}
                leftIcon={<UserGroupIcon className="w-4 h-4" />}
              >
                Khám phá thêm nghệ nhân
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
