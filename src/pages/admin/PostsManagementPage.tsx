import React, { useState, useEffect } from 'react';
import { useToastContext } from '../../contexts/ToastContext';
import { postService } from '../../services/post.service';
import { Post, PostStatus, PostType } from '../../types/post';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/Modal';
import { useDebounce } from '../../hooks/common/useDebounce';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  TrashIcon,
  PencilIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export const PostsManagementPage: React.FC = () => {
  const { success, error } = useToastContext();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Load posts
  const loadPosts = async () => {
    try {
      setLoading(true);

      const result = await postService.getAdminPosts({
        page: currentPage,
        limit: 20,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      setPosts(result.data);
      setTotalPages(result.meta.totalPages);
      setTotal(result.meta.total);
    } catch (err: any) {
      error(err.message || 'Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, typeFilter]);

  useEffect(() => {
    loadPosts();
  }, [currentPage, debouncedSearch, statusFilter, typeFilter]);

  // Handlers
  const handleStatusChange = async (postId: string, newStatus: PostStatus) => {
    try {
      await postService.updatePostStatus(postId, newStatus);
      success('Cập nhật trạng thái thành công');
      loadPosts();
    } catch (err: any) {
      error(err.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async () => {
    if (!deletePostId) return;

    setDeleting(true);
    try {
      await postService.adminDeletePost(deletePostId);
      success('Xóa bài viết thành công');
      setDeletePostId(null);
      loadPosts();
    } catch (err: any) {
      error(err.message || 'Không thể xóa bài viết');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: PostStatus) => {
    const variants = {
      [PostStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [PostStatus.PUBLISHED]: 'bg-green-100 text-green-800',
      [PostStatus.ARCHIVED]: 'bg-yellow-100 text-yellow-800',
      [PostStatus.DELETED]: 'bg-red-100 text-red-800',
    };

    const labels = {
      [PostStatus.DRAFT]: 'Bản nháp',
      [PostStatus.PUBLISHED]: 'Đã đăng',
      [PostStatus.ARCHIVED]: 'Lưu trữ',
      [PostStatus.DELETED]: 'Đã xóa',
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${variants[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const getTypeLabel = (type: PostType) => {
    const labels = {
      [PostType.STORY]: 'Câu chuyện',
      [PostType.TUTORIAL]: 'Hướng dẫn',
      [PostType.PRODUCT_SHOWCASE]: 'Sản phẩm',
      [PostType.BEHIND_THE_SCENES]: 'Hậu trường',
      [PostType.EVENT]: 'Sự kiện',
      [PostType.GENERAL]: 'Chung',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý bài viết</h1>
        <p className="text-gray-600">Quản lý tất cả bài viết trong hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <DocumentTextIcon className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-sm text-gray-500">Tổng bài viết</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="">Tất cả trạng thái</option>
            <option value={PostStatus.DRAFT}>Bản nháp</option>
            <option value={PostStatus.PUBLISHED}>Đã đăng</option>
            <option value={PostStatus.ARCHIVED}>Lưu trữ</option>
            <option value={PostStatus.DELETED}>Đã xóa</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="">Tất cả loại</option>
            <option value={PostType.STORY}>Câu chuyện</option>
            <option value={PostType.TUTORIAL}>Hướng dẫn</option>
            <option value={PostType.PRODUCT_SHOWCASE}>Sản phẩm</option>
            <option value={PostType.BEHIND_THE_SCENES}>Hậu trường</option>
            <option value={PostType.EVENT}>Sự kiện</option>
            <option value={PostType.GENERAL}>Chung</option>
          </select>

          {/* Reset */}
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('');
              setTypeFilter('');
            }}
          >
            Đặt lại
          </Button>
        </div>
      </Card>

      {/* Posts Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Không có bài viết nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bài viết
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tác giả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    onStatusChange={handleStatusChange}
                    onDelete={setDeletePostId}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Trước
          </Button>

          <div className="flex items-center px-4 py-2">
            Trang {currentPage} / {totalPages}
          </div>

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deletePostId}
        onClose={() => setDeletePostId(null)}
        onConfirm={handleDelete}
        title="Xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này?"
        confirmText="Xóa"
        type="danger"
        loading={deleting}
      />
    </div>
  );
};

// Post Row Component
interface PostRowProps {
  post: Post;
  onStatusChange: (postId: string, status: PostStatus) => void;
  onDelete: (postId: string) => void;
}

const PostRow: React.FC<PostRowProps> = ({
  post,
  onStatusChange,
  onDelete,
}) => {
  const getStatusBadge = (status: PostStatus) => {
    const variants = {
      [PostStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [PostStatus.PUBLISHED]: 'bg-green-100 text-green-800',
      [PostStatus.ARCHIVED]: 'bg-yellow-100 text-yellow-800',
      [PostStatus.DELETED]: 'bg-red-100 text-red-800',
    };

    const labels = {
      [PostStatus.DRAFT]: 'Bản nháp',
      [PostStatus.PUBLISHED]: 'Đã đăng',
      [PostStatus.ARCHIVED]: 'Lưu trữ',
      [PostStatus.DELETED]: 'Đã xóa',
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${variants[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const getTypeLabel = (type: PostType) => {
    const labels = {
      [PostType.STORY]: 'Câu chuyện',
      [PostType.TUTORIAL]: 'Hướng dẫn',
      [PostType.PRODUCT_SHOWCASE]: 'Sản phẩm',
      [PostType.BEHIND_THE_SCENES]: 'Hậu trường',
      [PostType.EVENT]: 'Sự kiện',
      [PostType.GENERAL]: 'Chung',
    };
    return labels[type] || type;
  };

  return (
    <tr className="hover:bg-gray-50">
      {/* Post Info */}
      <td className="px-6 py-4">
        <div className="flex items-center">
          {post.coverImage && (
            <img
              className="h-10 w-10 rounded object-cover mr-3"
              src={post.coverImage}
              alt={post.title}
            />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900 line-clamp-1">
              {post.title}
            </div>
            {post.summary && (
              <div className="text-sm text-gray-500 line-clamp-1">
                {post.summary}
              </div>
            )}
            <div className="text-xs text-gray-400 mt-1">
              {post.viewCount} lượt xem • {post.likeCount} thích
            </div>
          </div>
        </div>
      </td>

      {/* Author */}
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {post.user?.firstName} {post.user?.lastName}
        </div>
        <div className="text-sm text-gray-500">@{post.user?.username}</div>
      </td>

      {/* Type */}
      <td className="px-6 py-4">
        <span className="text-sm text-gray-900">{getTypeLabel(post.type)}</span>
      </td>

      {/* Status */}
      <td className="px-6 py-4">{getStatusBadge(post.status)}</td>

      {/* Date */}
      <td className="px-6 py-4 text-sm text-gray-500">
        {formatDistanceToNow(new Date(post.createdAt), {
          addSuffix: true,
          locale: vi,
        })}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end space-x-2">
          {/* View */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/posts/manage/${post.id}`, '_blank')}
          >
            <EyeIcon className="w-4 h-4" />
          </Button>

          {/* Status Actions */}
          {post.status === PostStatus.DRAFT && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(post.id, PostStatus.PUBLISHED)}
              className="text-green-600 hover:text-green-800"
            >
              <CheckCircleIcon className="w-4 h-4" />
            </Button>
          )}

          {post.status === PostStatus.PUBLISHED && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(post.id, PostStatus.ARCHIVED)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <ArchiveBoxIcon className="w-4 h-4" />
            </Button>
          )}

          {post.status === PostStatus.ARCHIVED && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(post.id, PostStatus.PUBLISHED)}
              className="text-green-600 hover:text-green-800"
            >
              <CheckCircleIcon className="w-4 h-4" />
            </Button>
          )}

          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(post.id)}
            className="text-red-600 hover:text-red-800"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};
