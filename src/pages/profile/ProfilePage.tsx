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
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/user.service';
import { postService } from '../../services/post.service';
import { productService } from '../../services/product.service';
import { User } from '../../types/auth';
import { Post } from '../../types/post';
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

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { state: authState } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = !userId || userId === authState.user?.id;
  const targetUserId = userId || authState.user?.id;

  useEffect(() => {
    if (targetUserId) {
      loadProfile();
    }
  }, [targetUserId]);

  const loadProfile = async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      // Load user profile
      const userProfile = isOwnProfile
        ? authState.user!
        : await userService.getUserProfile(targetUserId);
      setUser(userProfile);

      // Load user posts
      const postsResult = await postService.getPosts({
        userId: targetUserId,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setPosts(postsResult.data);

      // Load user products if they are artisan
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

  const tabItems = [
    {
      key: 'posts',
      label: 'Bài viết',
      icon: <DocumentTextIcon className="w-4 h-4" />,
      badge: posts.length,
      content: (
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} showAuthor={false} />
            ))
          ) : (
            <EmptyState
              icon={<DocumentTextIcon className="w-12 h-12" />}
              title="Chưa có bài viết nào"
              description={
                isOwnProfile
                  ? 'Hãy tạo bài viết đầu tiên của bạn!'
                  : 'Người dùng này chưa có bài viết nào.'
              }
              action={
                isOwnProfile
                  ? {
                      label: 'Tạo bài viết',
                      onClick: () => (window.location.href = '/create-post'),
                    }
                  : undefined
              }
            />
          )}
        </div>
      ),
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showSellerInfo={false}
                />
              ))}
            </div>
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
                    {products.length}
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
