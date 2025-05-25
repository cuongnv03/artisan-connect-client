import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { postService } from '../../services/post.service';
import { Post, PostPaginationResult } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { PostCard } from '../../components/common/PostCard';
import { EmptyState } from '../../components/common/EmptyState';
import {
  PlusIcon,
  SparklesIcon,
  UserGroupIcon,
  HeartIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export const HomePage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const { error: showError } = useToastContext();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (pageNum = 1, reset = true) => {
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

      let response: PostPaginationResult;
      try {
        response = await postService.getFollowedPosts({
          page: pageNum,
          limit: 10,
          sortBy: 'publishedAt',
          sortOrder: 'desc',
        });

        if (pageNum === 1 && response.data.length === 0) {
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
      showError(err.message || 'Không thể tải bảng tin');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore && currentPage < totalPages) {
      loadPosts(currentPage + 1, false);
    }
  };

  const handleRefresh = () => {
    loadPosts(1, false);
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
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-vietnamese text-white rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-white">
                {getGreeting()}, {user?.firstName}! 👋
              </h1>
              <p className="text-gray-100">
                {showFallback
                  ? 'Khám phá những câu chuyện từ cộng đồng nghệ nhân'
                  : 'Những câu chuyện mới từ những người bạn theo dõi'}
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant="whiteOutline"
                size="sm"
                onClick={handleRefresh}
                loading={refreshing}
                leftIcon={<ArrowPathIcon className="w-4 h-4" />}
              >
                Làm mới
              </Button>
              <SparklesIcon className="w-16 h-16 text-gold-300 opacity-80" />
            </div>
          </div>
        </div>

        {/* Feed Type Indicator */}
        {showFallback && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Bạn chưa theo dõi ai. Đang hiển thị bài viết phổ biến từ cộng
                  đồng.{' '}
                  <a
                    href="/discover"
                    className="font-medium underline hover:text-blue-600"
                  >
                    Khám phá nghệ nhân
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

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
              <div className="text-sm text-gray-500">
                {showFallback
                  ? 'Tìm nghệ nhân để theo dõi'
                  : 'Tìm nghệ nhân mới'}
              </div>
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
          <EmptyState
            icon={<UserGroupIcon className="w-16 h-16" />}
            title="Chưa có bài viết nào"
            description={
              showFallback
                ? 'Hiện tại chưa có bài viết nào trong cộng đồng. Hãy là người đầu tiên chia sẻ!'
                : 'Những người bạn theo dõi chưa có bài viết mới. Hãy khám phá thêm nghệ nhân!'
            }
            action={{
              label: showFallback
                ? 'Tạo bài viết đầu tiên'
                : 'Khám phá nghệ nhân',
              onClick: () =>
                (window.location.href = showFallback
                  ? '/create-post'
                  : '/discover'),
            }}
          />
        ) : (
          <>
            {posts.map((post, index) => (
              <PostCard
                key={`${post.id}-${index}`}
                post={post}
                showAuthor={true}
              />
            ))}

            {/* Load More */}
            {hasMore && currentPage < totalPages && (
              <div className="text-center py-6">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  loading={loadingMore}
                >
                  {loadingMore ? 'Đang tải...' : 'Xem thêm bài viết'}
                </Button>
              </div>
            )}

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
                      onClick={() => (window.location.href = '/discover')}
                      leftIcon={<UserGroupIcon className="w-4 h-4" />}
                    >
                      Khám phá thêm nghệ nhân
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
