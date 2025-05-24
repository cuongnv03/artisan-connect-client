import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { postService } from '../../services/post.service';
import { Post, PaginatedResponse } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { PostCard } from '../../components/common/PostCard';
import {
  PlusIcon,
  SparklesIcon,
  UserGroupIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

export const HomePage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (pageNum = 1, reset = true) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response: PaginatedResponse<Post> =
        await postService.getFollowedPosts({
          page: pageNum,
          limit: 10,
          sortBy: 'publishedAt',
          sortOrder: 'desc',
        });

      if (reset) {
        setPosts(response.data);
      } else {
        setPosts((prev) => [...prev, ...response.data]);
      }

      setHasMore(pageNum < response.meta.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(page + 1, false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải bảng tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-vietnamese text-white rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {getGreeting()}, {user?.firstName}! 👋
              </h1>
              <p className="text-gray-100">
                Khám phá những câu chuyện mới từ cộng đồng nghệ nhân
              </p>
            </div>
            <div className="hidden md:block">
              <SparklesIcon className="w-16 h-16 text-gold-300 opacity-80" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button
            variant="outline"
            className="justify-start p-4 h-auto"
            leftIcon={<PlusIcon className="w-5 h-5" />}
            onClick={() => (window.location.href = '/create-post')}
          >
            <div className="text-left">
              <div className="font-medium">Tạo bài viết</div>
              <div className="text-sm text-gray-500">
                Chia sẻ câu chuyện của bạn
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start p-4 h-auto"
            leftIcon={<UserGroupIcon className="w-5 h-5" />}
            onClick={() => (window.location.href = '/discover')}
          >
            <div className="text-left">
              <div className="font-medium">Khám phá</div>
              <div className="text-sm text-gray-500">Tìm nghệ nhân mới</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start p-4 h-auto"
            leftIcon={<HeartIcon className="w-5 h-5" />}
            onClick={() => (window.location.href = '/shop')}
          >
            <div className="text-left">
              <div className="font-medium">Cửa hàng</div>
              <div className="text-sm text-gray-500">Sản phẩm thủ công</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có bài viết nào
            </h3>
            <p className="text-gray-500 mb-6">
              Hãy theo dõi các nghệ nhân để xem những câu chuyện thú vị từ họ
            </p>
            <Button onClick={() => (window.location.href = '/discover')}>
              Khám phá nghệ nhân
            </Button>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center py-6">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  loading={loadingMore}
                >
                  Xem thêm bài viết
                </Button>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="text-center py-6 text-gray-500">
                🎉 Bạn đã xem hết tất cả bài viết mới
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
