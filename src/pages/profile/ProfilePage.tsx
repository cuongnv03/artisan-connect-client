import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  HomeIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { userService } from '../../services/user.service';
import { postService } from '../../services/post.service';
import { productService } from '../../services/product.service';
import { User } from '../../types/auth';
import { Post, PostType } from '../../types/post';
import { Product } from '../../types/product';
import { Profile, Address } from '../../types/user';
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
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useToastContext } from '../../contexts/ToastContext';
import { useForm } from '../../hooks/useForm';

interface AddressFormData {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { state: authState } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const { success, error } = useToastContext();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [followStats, setFollowStats] = useState({
    followersCount: 0,
    followingCount: 0,
    isFollowing: false,
    isFollowedBy: false,
  });
  const [followLoading, setFollowLoading] = useState(false);

  // Address modal states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [submittingAddress, setSubmittingAddress] = useState(false);

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

  // Address form
  const {
    values: addressValues,
    handleChange: handleAddressChange,
    handleSubmit: handleAddressSubmit,
    resetForm: resetAddressForm,
    setFieldValue: setAddressFieldValue,
    errors: addressErrors,
  } = useForm<AddressFormData>({
    initialValues: {
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Việt Nam',
      isDefault: false,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.fullName.trim()) errors.fullName = 'Họ tên là bắt buộc';
      if (!values.street.trim()) errors.street = 'Địa chỉ cụ thể là bắt buộc';
      if (!values.city.trim()) errors.city = 'Thành phố là bắt buộc';
      if (!values.state.trim()) errors.state = 'Tỉnh/Thành phố là bắt buộc';
      if (!values.zipCode.trim()) errors.zipCode = 'Mã bưu điện là bắt buộc';
      if (!values.country.trim()) errors.country = 'Quốc gia là bắt buộc';
      return errors;
    },
    onSubmit: handleSaveAddress,
  });

  useEffect(() => {
    if (targetUserId) {
      loadProfile();
    }
  }, [targetUserId]);

  useEffect(() => {
    if (targetUserId && activeTab === 'posts') {
      loadPosts(true);
    } else if (targetUserId && activeTab === 'addresses' && isOwnProfile) {
      loadAddresses();
    }
  }, [targetUserId, activeTab, postFilters]);

  const loadProfile = async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      // Load user profile and follow stats
      const [userProfile, followStatsData] = await Promise.all([
        userService.getUserProfile(targetUserId),
        userService.getFollowStats
          ? userService.getFollowStats(targetUserId)
          : Promise.resolve({
              followersCount: 0,
              followingCount: 0,
              isFollowing: false,
              isFollowedBy: false,
            }),
      ]);

      setUser(userProfile);
      setFollowStats(followStatsData);

      // Load user's extended profile if available
      if (isOwnProfile) {
        try {
          const userExtendedProfile = await userService.getProfile();
          setProfile(userExtendedProfile);
        } catch (err) {
          console.log('Extended profile not found');
        }
      }

      // Load user products if they are artisan (limited for preview)
      if (userProfile.role === 'ARTISAN') {
        try {
          const productsResult = await productService.getProducts({
            sellerId: targetUserId,
            limit: 8,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          });
          setProducts(productsResult.data);
        } catch (err) {
          console.error('Error loading products:', err);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      error('Không thể tải thông tin người dùng');
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
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadAddresses = async () => {
    if (!isOwnProfile) return;

    setLoadingAddresses(true);
    try {
      const addressList = await userService.getAddresses();
      setAddresses(addressList);
    } catch (err) {
      console.error('Error loading addresses:', err);
      error('Không thể tải danh sách địa chỉ');
    } finally {
      setLoadingAddresses(false);
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
    if (!targetUserId || isOwnProfile || followLoading) return;

    setFollowLoading(true);
    try {
      if (followStats.isFollowing) {
        await userService.unfollowUser(targetUserId);
        setFollowStats((prev) => ({
          ...prev,
          isFollowing: false,
          followersCount: Math.max(0, prev.followersCount - 1),
        }));
        success('Đã bỏ theo dõi');
      } else {
        await userService.followUser(targetUserId);
        setFollowStats((prev) => ({
          ...prev,
          isFollowing: true,
          followersCount: prev.followersCount + 1,
        }));
        success('Đã theo dõi');
      }

      // Reload follow stats to ensure consistency
      setTimeout(async () => {
        try {
          const updatedStats = await userService.getFollowStats(targetUserId);
          setFollowStats(updatedStats);
        } catch (err) {
          console.error('Error reloading follow stats:', err);
        }
      }, 500);
    } catch (err: any) {
      console.error('Error following user:', err);

      // Handle the specific "already following" error
      if (
        err.message?.includes('Already following') ||
        err.response?.status === 409
      ) {
        // Update state to reflect current status
        setFollowStats((prev) => ({
          ...prev,
          isFollowing: true,
        }));
        success('Bạn đã theo dõi người này rồi');
      } else {
        error(err.message || 'Có lỗi xảy ra khi thực hiện thao tác');
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!targetUserId || isOwnProfile) return;
    navigate(`/messages/${targetUserId}`);
  };

  const handlePostFilterChange = (key: string, value: any) => {
    setPostFilters((prev) => ({ ...prev, [key]: value }));
    setPostsPage(1);
    setHasMorePosts(true);
  };

  // Address management functions
  const openAddAddressModal = () => {
    setEditingAddress(null);
    resetAddressForm();
    setAddressFieldValue(
      'fullName',
      `${authState.user?.firstName || ''} ${
        authState.user?.lastName || ''
      }`.trim(),
    );
    setAddressFieldValue('phone', authState.user?.phone || '');
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (address: Address) => {
    setEditingAddress(address);
    setAddressFieldValue('fullName', address.fullName);
    setAddressFieldValue('phone', address.phone || '');
    setAddressFieldValue('street', address.street);
    setAddressFieldValue('city', address.city);
    setAddressFieldValue('state', address.state);
    setAddressFieldValue('zipCode', address.zipCode);
    setAddressFieldValue('country', address.country);
    setAddressFieldValue('isDefault', address.isDefault);
    setIsAddressModalOpen(true);
  };

  async function handleSaveAddress(data: AddressFormData) {
    setSubmittingAddress(true);
    try {
      if (editingAddress) {
        await userService.updateAddress(editingAddress.id, data);
        success('Cập nhật địa chỉ thành công!');
      } else {
        await userService.createAddress(data);
        success('Thêm địa chỉ thành công!');
      }

      setIsAddressModalOpen(false);
      loadAddresses();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    } finally {
      setSubmittingAddress(false);
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;

    try {
      await userService.deleteAddress(id);
      success('Xóa địa chỉ thành công!');
      loadAddresses();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi xóa địa chỉ');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await userService.setDefaultAddress(id);
      success('Đặt làm địa chỉ mặc định thành công!');
      loadAddresses();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
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
                    onClick: () => navigate('/create-post'),
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

  const addressesTabContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Quản lý địa chỉ
          </h3>
          <p className="text-sm text-gray-500">
            Thêm và quản lý địa chỉ giao hàng của bạn
          </p>
        </div>
        <Button
          onClick={openAddAddressModal}
          leftIcon={<PlusIcon className="w-4 h-4" />}
        >
          Thêm địa chỉ
        </Button>
      </div>

      {/* Address List */}
      {loadingAddresses ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="md" />
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<MapPinIcon className="w-16 h-16" />}
          title="Chưa có địa chỉ nào"
          description="Thêm địa chỉ để thuận tiện cho việc đặt hàng"
          action={{
            label: 'Thêm địa chỉ đầu tiên',
            onClick: openAddAddressModal,
          }}
        />
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card key={address.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {address.fullName}
                    </h4>
                    {address.isDefault && (
                      <Badge variant="primary" size="sm">
                        Mặc định
                      </Badge>
                    )}
                  </div>

                  {address.phone && (
                    <p className="text-sm text-gray-600 mb-1">
                      📞 {address.phone}
                    </p>
                  )}

                  <p className="text-gray-700">
                    {address.street}, {address.city}, {address.state}{' '}
                    {address.zipCode}, {address.country}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefaultAddress(address.id)}
                      leftIcon={<CheckIcon className="w-4 h-4" />}
                    >
                      Đặt mặc định
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditAddressModal(address)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
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

  // Add addresses tab for own profile
  if (isOwnProfile) {
    tabItems.push({
      key: 'addresses',
      label: 'Địa chỉ',
      icon: <HomeIcon className="w-4 h-4" />,
      badge: addresses.length,
      content: addressesTabContent,
    });
  }

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
                      onClick: () => navigate('/artisan/products'),
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
    <div className="max-w-7xl mx-auto">
      {/* Profile Header */}
      <Card className="p-0 mb-8 overflow-hidden">
        {/* Cover Image */}
        <div
          className="h-48 md:h-64 relative"
          style={{
            background: currentTheme
              ? `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`
              : 'linear-gradient(135deg, #3B82F6, #1E40AF)',
          }}
        >
          {profile?.coverUrl ? (
            <img
              src={profile.coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-black bg-opacity-20" />
        </div>

        {/* Profile Info Container */}
        <div
          className="px-4 sm:px-6 pb-6 font-theme"
          style={{
            backgroundColor: currentTheme?.colors.background,
            color: currentTheme?.colors.text,
            fontFamily: currentTheme?.typography.fontFamily,
          }}
        >
          {/* Profile Info */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
            {/* Avatar */}
            <div className="flex-shrink-0 -mt-12 sm:-mt-16 mb-2 sm:mb-0">
              <Avatar
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                size="2xl"
                className="border-4 border-white shadow-lg bg-white ring-2 ring-gray-100"
              />
            </div>

            {/* User Details */}
            <div className="flex-1 pt-2 sm:pt-4 min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </h1>
                    {user.isVerified && (
                      <CheckBadgeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
                    )}
                    <Badge
                      variant={getRoleBadgeVariant(user.role) as any}
                      size="sm"
                    >
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>

                  <p className="text-gray-600 mb-1 text-sm sm:text-base">
                    @{user.username}
                  </p>

                  {user.bio && (
                    <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                      {user.bio}
                    </p>
                  )}

                  {/* Additional profile info */}
                  <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    {profile?.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{profile.location}</span>
                      </div>
                    )}
                    {profile?.website && (
                      <div className="flex items-center">
                        <GlobeAltIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                        >
                          Website
                        </a>
                      </div>
                    )}
                    <div className="flex items-center">
                      <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span>
                        Tham gia{' '}
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 sm:gap-6 text-sm">
                    <Link
                      to={`/profile/${user.id}/followers`}
                      className="text-center hover:text-primary transition-colors"
                    >
                      <div className="text-base sm:text-lg font-semibold text-gray-900">
                        {followStats.followersCount || 0}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Người theo dõi
                      </div>
                    </Link>
                    <Link
                      to={`/profile/${user.id}/following`}
                      className="text-center hover:text-primary transition-colors"
                    >
                      <div className="text-base sm:text-lg font-semibold text-gray-900">
                        {followStats.followingCount || 0}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Đang theo dõi
                      </div>
                    </Link>
                    <div className="text-center">
                      <div className="text-base sm:text-lg font-semibold text-gray-900">
                        {posts.length}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Bài viết
                      </div>
                    </div>
                    {user.role === 'ARTISAN' && (
                      <div className="text-center">
                        <div className="text-base sm:text-lg font-semibold text-gray-900">
                          {products.length}+
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          Sản phẩm
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                  {isOwnProfile ? (
                    <>
                      <Link to="/profile/edit">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<PencilIcon className="w-4 h-4" />}
                        >
                          <span className="hidden sm:inline">Chỉnh sửa</span>
                          <span className="sm:hidden">Sửa</span>
                        </Button>
                      </Link>
                      <Link to="/settings">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<CogIcon className="w-4 h-4" />}
                        >
                          <span className="hidden sm:inline">Cài đặt</span>
                          <span className="sm:hidden">
                            <CogIcon className="w-4 h-4" />
                          </span>
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Button
                        variant={
                          followStats.isFollowing ? 'secondary' : 'primary'
                        }
                        size="sm"
                        onClick={handleFollow}
                        loading={followLoading}
                        disabled={followLoading}
                        leftIcon={<UserPlusIcon className="w-4 h-4" />}
                      >
                        <span className="hidden sm:inline">
                          {followStats.isFollowing
                            ? 'Đang theo dõi'
                            : 'Theo dõi'}
                        </span>
                        <span className="sm:hidden">
                          {followStats.isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSendMessage}
                        leftIcon={<ChatBubbleLeftIcon className="w-4 h-4" />}
                      >
                        <span className="hidden sm:inline">Nhắn tin</span>
                        <span className="sm:hidden">
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                        </span>
                      </Button>
                    </>
                  )}
                </div>
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

      {/* Add/Edit Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title={editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
        size="lg"
      >
        <form onSubmit={handleAddressSubmit} className="space-y-4">
          <Input
            label="Họ và tên"
            name="fullName"
            value={addressValues.fullName}
            onChange={handleAddressChange}
            error={addressErrors.fullName}
            required
          />

          <Input
            label="Số điện thoại"
            name="phone"
            type="tel"
            value={addressValues.phone}
            onChange={handleAddressChange}
            placeholder="Ví dụ: 0987654321"
          />

          <Input
            label="Địa chỉ cụ thể"
            name="street"
            value={addressValues.street}
            onChange={handleAddressChange}
            error={addressErrors.street}
            required
            placeholder="Số nhà, tên đường, phường/xã"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Thành phố"
              name="city"
              value={addressValues.city}
              onChange={handleAddressChange}
              error={addressErrors.city}
              required
            />

            <Input
              label="Tỉnh/Thành phố"
              name="state"
              value={addressValues.state}
              onChange={handleAddressChange}
              error={addressErrors.state}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mã bưu điện"
              name="zipCode"
              value={addressValues.zipCode}
              onChange={handleAddressChange}
              error={addressErrors.zipCode}
              required
            />

            <Input
              label="Quốc gia"
              name="country"
              value={addressValues.country}
              onChange={handleAddressChange}
              error={addressErrors.country}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={addressValues.isDefault}
              onChange={handleAddressChange}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
              Đặt làm địa chỉ mặc định
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddressModalOpen(false)}
              disabled={submittingAddress}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              loading={submittingAddress}
              disabled={submittingAddress}
            >
              {editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
