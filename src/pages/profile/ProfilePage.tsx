import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  UserPlusIcon,
  ChatBubbleLeftIcon,
  CogIcon,
  MapPinIcon,
  CalendarIcon,
  GlobeAltIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  PencilIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/user.service';
import { postService } from '../../services/post.service';
import { productService } from '../../services/product.service';
import { User } from '../../types/auth';
import { Post, PostType } from '../../types/post';
import { Product } from '../../types/product';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { PostCard } from '../../components/common/PostCard';
import { ProductCard } from '../../components/common/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Select } from '../../components/ui/Dropdown';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { state: authState } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  // Posts pagination and filtering
  const [postFilters, setPostFilters] = useState({
    type: '' as PostType | '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  const [postsPage, setPostsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const isOwnProfile = !userId || userId === authState.user?.id;
  const targetUserId = userId || authState.user?.id;

  useEffect(() => {
    if (targetUserId) {
      loadProfile();
    }
  }, [targetUserId]);

  useEffect(() => {
    if (targetUserId && activeTab === 'posts') {
      loadPosts(true); // Reset posts when filters change
    }
  }, [targetUserId, activeTab, postFilters]);

  const loadProfile = async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      // Load user profile
      const userProfile = isOwnProfile
        ? authState.user!
        : await userService.getUserProfile(targetUserId);
      setUser(userProfile);

      // Load user products if they are artisan (limited for preview)
      if (userProfile.role === 'ARTISAN') {
        const productsResult = await productService.getProducts({
          sellerId: targetUserId,
          limit: 8,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        setProducts(productsResult.data);
      }

      // Check following status if not own profile
      if (!isOwnProfile) {
        // TODO: Check if current user is following this user
        setIsFollowing(false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (reset = false) => {
    if (!targetUserId) return;

    setLoadingPosts(true);
    try {
      const page = reset ? 1 : postsPage;
      const result = await postService.getPosts({
        userId: targetUserId,
        page,
        limit: 12,
        type: postFilters.type || undefined,
        sortBy: postFilters.sortBy,
        sortOrder: postFilters.sortOrder,
      });

      if (reset) {
        setPosts(result.data);
        setPostsPage(1);
      } else {
        setPosts((prev) => [...prev, ...result.data]);
      }

      setHasMorePosts(page < result.meta.totalPages);
      setPostsPage((prev) => (reset ? 2 : prev + 1));
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadMorePosts = () => {
    if (!loadingPosts && hasMorePosts) {
      loadPosts(false);
    }
  };

  // Infinite scroll for posts
  const [loadMoreRef] = useInfiniteScroll({
    loading: loadingPosts,
    hasMore: hasMorePosts,
    onLoadMore: loadMorePosts,
  });

  const handleFollow = async () => {
    if (!targetUserId || isOwnProfile) return;

    try {
      if (isFollowing) {
        await userService.unfollowUser(targetUserId);
        setIsFollowing(false);
      } else {
        await userService.followUser(targetUserId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handlePostFilterChange = (key: string, value: any) => {
    setPostFilters((prev) => ({ ...prev, [key]: value }));
    setPostsPage(1);
    setHasMorePosts(true);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ARTISAN':
        return 'Nghệ nhân';
      case 'ADMIN':
        return 'Quản trị viên';
      default:
        return 'Khách hàng';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ARTISAN':
        return 'primary';
      case 'ADMIN':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getPostTypeOptions = () => [
    { label: 'Tất cả bài viết', value: '' },
    { label: 'Câu chuyện', value: PostType.STORY },
    { label: 'Hướng dẫn', value: PostType.TUTORIAL },
    { label: 'Giới thiệu sản phẩm', value: PostType.PRODUCT_SHOWCASE },
    { label: 'Hậu trường', value: PostType.BEHIND_THE_SCENES },
    { label: 'Sự kiện', value: PostType.EVENT },
    { label: 'Chung', value: PostType.GENERAL },
  ];

  const sortOptions = [
    { label: 'Mới nhất', value: 'createdAt' },
    { label: 'Nhiều lượt xem nhất', value: 'viewCount' },
    { label: 'Nhiều lượt thích nhất', value: 'likeCount' },
    { label: 'Nhiều bình luận nhất', value: 'commentCount' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải trang cá nhân...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        icon={<UserGroupIcon className="w-16 h-16" />}
        title="Không tìm thấy người dùng"
        description="Người dùng này không tồn tại hoặc đã bị xóa"
      />
    );
  }

  const postsTabContent = (
    <div className="space-y-6">
      {/* Post Filters - Only show for artisans or own profile */}
      {(user.role === 'ARTISAN' || isOwnProfile) && (
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center">
              <FunnelIcon className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Bộ lọc:</span>
            </div>

            <div className="flex flex-col md:flex-row gap-3 flex-1">
              <Select
                value={postFilters.type}
                onChange={(value) => handlePostFilterChange('type', value)}
                options={getPostTypeOptions()}
                className="md:w-48"
              />

              <Select
                value={postFilters.sortBy}
                onChange={(value) => handlePostFilterChange('sortBy', value)}
                options={sortOptions}
                className="md:w-48"
              />

              <Select
                value={postFilters.sortOrder}
                onChange={(value) => handlePostFilterChange('sortOrder', value)}
                options={[
                  { label: 'Giảm dần', value: 'desc' },
                  { label: 'Tăng dần', value: 'asc' },
                ]}
                className="md:w-32"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadPosts(true)}
              leftIcon={<ArrowPathIcon className="w-4 h-4" />}
            >
              Làm mới
            </Button>
          </div>
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} showAuthor={false} />
            ))}

            {/* Load More */}
            {hasMorePosts && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {loadingPosts ? (
                  <div className="text-center">
                    <LoadingSpinner size="md" />
                    <p className="mt-2 text-sm text-gray-600">
                      Đang tải thêm bài viết...
                    </p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={loadMorePosts}
                    leftIcon={<ArrowPathIcon className="w-4 h-4" />}
                  >
                    Tải thêm bài viết
                  </Button>
                )}
              </div>
            )}

            {!hasMorePosts && posts.length > 6 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Đã hiển thị tất cả bài viết</p>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<DocumentTextIcon className="w-12 h-12" />}
            title={
              postFilters.type
                ? `Chưa có bài viết loại "${
                    getPostTypeOptions().find(
                      (o) => o.value === postFilters.type,
                    )?.label
                  }"`
                : 'Chưa có bài viết nào'
            }
            description={
              isOwnProfile
                ? 'Hãy tạo bài viết đầu tiên của bạn!'
                : postFilters.type
                ? 'Thử thay đổi bộ lọc để xem các bài viết khác.'
                : 'Người dùng này chưa có bài viết nào.'
            }
            action={
              isOwnProfile
                ? {
                    label: 'Tạo bài viết',
                    onClick: () => (window.location.href = '/create-post'),
                  }
                : postFilters.type
                ? {
                    label: 'Xem tất cả bài viết',
                    onClick: () => handlePostFilterChange('type', ''),
                  }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );

  const tabItems = [
    {
      key: 'posts',
      label: 'Bài viết',
      icon: <DocumentTextIcon className="w-4 h-4" />,
      badge: posts.length,
      content: postsTabContent,
    },
  ];

  // Add products tab for artisans
  if (user.role === 'ARTISAN') {
    tabItems.push({
      key: 'products',
      label: 'Sản phẩm',
      icon: <ShoppingBagIcon className="w-4 h-4" />,
      badge: products.length,
      content: (
        <div>
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showSellerInfo={false}
                  />
                ))}
              </div>

              {/* Show more products link if many products */}
              {products.length >= 8 && (
                <div className="text-center mt-8">
                  <Link to={`/shop?seller=${user.id}`}>
                    <Button variant="outline">
                      Xem tất cả sản phẩm ({products.length}+)
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={<ShoppingBagIcon className="w-12 h-12" />}
              title="Chưa có sản phẩm nào"
              description={
                isOwnProfile
                  ? 'Hãy thêm sản phẩm đầu tiên của bạn!'
                  : 'Nghệ nhân này chưa có sản phẩm nào.'
              }
              action={
                isOwnProfile
                  ? {
                      label: 'Thêm sản phẩm',
                      onClick: () =>
                        (window.location.href = '/products/create'),
                    }
                  : undefined
              }
            />
          )}
        </div>
      ),
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <Card className="p-6 mb-8">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-vietnamese rounded-lg mb-6 relative overflow-hidden">
          <div className="absolute inset-0 pattern-traditional opacity-20"></div>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col md:flex-row md:items-start gap-6 -mt-16 relative">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
              size="2xl"
              className="border-4 border-white shadow-lg"
            />
          </div>

          {/* User Details */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h1>
                  {user.isVerified && (
                    <CheckBadgeIcon className="w-6 h-6 text-blue-500" />
                  )}
                  <Badge variant={getRoleBadgeVariant(user.role) as any}>
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-1">@{user.username}</p>
                {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {isOwnProfile ? (
                  <>
                    <Link to="/profile/edit">
                      <Button
                        variant="outline"
                        leftIcon={<PencilIcon className="w-4 h-4" />}
                      >
                        Chỉnh sửa
                      </Button>
                    </Link>
                    <Link to="/settings">
                      <Button
                        variant="outline"
                        leftIcon={<CogIcon className="w-4 h-4" />}
                      >
                        Cài đặt
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button
                      variant={isFollowing ? 'secondary' : 'primary'}
                      onClick={handleFollow}
                      leftIcon={<UserPlusIcon className="w-4 h-4" />}
                    >
                      {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                    </Button>
                    <Button
                      variant="outline"
                      leftIcon={<ChatBubbleLeftIcon className="w-4 h-4" />}
                    >
                      Nhắn tin
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {user.followerCount || 0}
                </div>
                <div className="text-sm text-gray-500">Người theo dõi</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {user.followingCount || 0}
                </div>
                <div className="text-sm text-gray-500">Đang theo dõi</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {posts.length}
                </div>
                <div className="text-sm text-gray-500">Bài viết</div>
              </div>
              {user.role === 'ARTISAN' && (
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {products.length}+
                  </div>
                  <div className="text-sm text-gray-500">Sản phẩm</div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
              {user.phone && (
                <div className="flex items-center">
                  <span>📞 {user.phone}</span>
                </div>
              )}
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>
                  Tham gia{' '}
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Content Tabs */}
      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={setActiveTab}
        variant="line"
      />
    </div>
  );
};
