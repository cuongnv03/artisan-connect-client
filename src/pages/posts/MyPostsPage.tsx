import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useToastContext } from '../../contexts/ToastContext';
import { postService } from '../../services/post.service';
import { Post, PostStatus } from '../../types/post';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchBox } from '../../components/common/SearchBox';
import { Tabs } from '../../components/ui/Tabs';
import { Dropdown } from '../../components/ui/Dropdown';
import { ConfirmModal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { useDebounce } from '../../hooks/useDebounce';

export const MyPostsPage: React.FC = () => {
  const { success, error } = useToastContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 10,
  });
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadPosts();
  }, [debouncedQuery, activeTab, currentPage]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: pagination.limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      if (debouncedQuery) {
        params.q = debouncedQuery;
      }

      if (activeTab !== 'all') {
        params.status = activeTab;
      }

      const result = await postService.getMyPosts(params);
      setPosts(result.data);
      setPagination({
        total: result.meta.total,
        totalPages: result.meta.totalPages,
        limit: result.meta.limit,
      });
    } catch (err) {
      error('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await postService.deletePost(postId);
      success('Đã xóa bài viết');
      await loadPosts();
      setDeletePostId(null);
    } catch (err) {
      error('Không thể xóa bài viết');
    }
  };

  const handlePublishPost = async (postId: string) => {
    try {
      await postService.publishPost(postId);
      success('Đã đăng bài viết');
      await loadPosts();
    } catch (err) {
      error('Không thể đăng bài viết');
    }
  };

  const handleArchivePost = async (postId: string) => {
    try {
      await postService.archivePost(postId);
      success('Đã lưu trữ bài viết');
      await loadPosts();
    } catch (err) {
      error('Không thể lưu trữ bài viết');
    }
  };

  const getStatusDisplay = (status: PostStatus) => {
    const statusMap = {
      [PostStatus.DRAFT]: 'Bản nháp',
      [PostStatus.PUBLISHED]: 'Đã đăng',
      [PostStatus.ARCHIVED]: 'Lưu trữ',
      [PostStatus.DELETED]: 'Đã xóa',
    };
    return statusMap[status] || status;
  };

  const getStatusVariant = (status: PostStatus) => {
    const variantMap = {
      [PostStatus.DRAFT]: 'secondary',
      [PostStatus.PUBLISHED]: 'success',
      [PostStatus.ARCHIVED]: 'warning',
      [PostStatus.DELETED]: 'danger',
    };
    return (variantMap[status] as any) || 'default';
  };

  const getPostActions = (post: Post) => {
    const actions = [
      {
        label: 'Xem',
        value: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        onClick: () => window.open(`/posts/${post.id}`, '_blank'),
      },
      {
        label: 'Chỉnh sửa',
        value: 'edit',
        icon: <PencilIcon className="w-4 h-4" />,
        onClick: () => (window.location.href = `/posts/${post.id}/edit`),
      },
    ];

    if (post.status === PostStatus.DRAFT) {
      actions.push({
        label: 'Đăng bài',
        value: 'publish',
        icon: <PlusIcon className="w-4 h-4" />,
        onClick: () => handlePublishPost(post.id),
      });
    }

    if (post.status === PostStatus.PUBLISHED) {
      actions.push({
        label: 'Lưu trữ',
        value: 'archive',
        icon: <PlusIcon className="w-4 h-4" />,
        onClick: () => handleArchivePost(post.id),
      });
    }

    actions.push({
      label: 'Xóa',
      value: 'delete',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: () => setDeletePostId(post.id),
    });

    return actions;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const tabItems = [
    {
      key: 'all',
      label: 'Tất cả',
      content: null,
    },
    {
      key: PostStatus.PUBLISHED,
      label: 'Đã đăng',
      content: null,
    },
    {
      key: PostStatus.DRAFT,
      label: 'Bản nháp',
      content: null,
    },
    {
      key: PostStatus.ARCHIVED,
      label: 'Lưu trữ',
      content: null,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bài viết của tôi
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi tất cả bài viết bạn đã tạo
          </p>
        </div>

        <Link to="/create-post">
          <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
            Tạo bài viết mới
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm kiếm bài viết..."
            />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          items={tabItems}
          activeKey={activeTab}
          onChange={setActiveTab}
          variant="line"
        />
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Post Thumbnail */}
                  {post.coverImage && (
                    <div className="lg:w-48 flex-shrink-0">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-32 lg:h-24 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Post Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Link
                          to={`/posts/${post.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-accent line-clamp-2"
                        >
                          {post.title}
                        </Link>
                        {post.summary && (
                          <p className="text-gray-600 mt-1 line-clamp-2">
                            {post.summary}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Badge
                          variant={getStatusVariant(post.status)}
                          size="sm"
                        >
                          {getStatusDisplay(post.status)}
                        </Badge>

                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="sm">
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                          }
                          items={getPostActions(post)}
                        />
                      </div>
                    </div>

                    {/* Post Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3">
                      <span>Tạo: {formatDate(post.createdAt)}</span>
                      {post.publishedAt && (
                        <span>Đăng: {formatDate(post.publishedAt)}</span>
                      )}
                      <div className="flex items-center gap-4">
                        <span className="flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          {post.viewCount}
                        </span>
                        <span>{post.likeCount} thích</span>
                        <span>{post.commentCount} bình luận</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" size="sm">
                            #{tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="secondary" size="sm">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<PlusIcon className="w-16 h-16" />}
          title={
            searchQuery
              ? 'Không tìm thấy bài viết nào'
              : 'Bạn chưa có bài viết nào'
          }
          description={
            searchQuery
              ? 'Thử tìm kiếm với từ khóa khác'
              : 'Hãy tạo bài viết đầu tiên để chia sẻ câu chuyện của bạn'
          }
          action={{
            label: searchQuery ? 'Xóa tìm kiếm' : 'Tạo bài viết đầu tiên',
            onClick: () =>
              searchQuery
                ? setSearchQuery('')
                : (window.location.href = '/create-post'),
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletePostId}
        onClose={() => setDeletePostId(null)}
        onConfirm={() => deletePostId && handleDeletePost(deletePostId)}
        title="Xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
        confirmText="Xóa bài viết"
        type="danger"
      />
    </div>
  );
};
