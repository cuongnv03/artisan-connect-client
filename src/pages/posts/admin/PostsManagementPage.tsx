import React, { useState } from 'react';
import { useToastContext } from '../../../contexts/ToastContext';
import { postService } from '../../../services/post.service';
import { usePostsList } from '../../../hooks/posts';
import { PostsTable } from '../../../components/posts/admin/PostsTable';
import { SearchBox } from '../../../components/common/SearchBox';
import { FilterPanel } from '../../../components/common/FilterPanel';
import { Pagination } from '../../../components/ui/Pagination';
import { Card } from '../../../components/ui/Card';
import { ConfirmModal } from '../../../components/ui/Modal';
import { PostStatus } from '../../../types/post';
import { useDebounce } from '../../../hooks/useDebounce';

export const PostsManagementPage: React.FC = () => {
  const { success, error } = useToastContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 500);

  const { posts, loading, pagination, refresh } = usePostsList({
    q: debouncedQuery || undefined,
    status: filters.status || undefined,
    sortBy: filters.sortBy || 'createdAt',
    sortOrder: filters.sortOrder || 'desc',
    page: currentPage,
    limit: 20,
  });

  const handleStatusChange = async (postId: string, status: string) => {
    try {
      if (status === PostStatus.PUBLISHED) {
        await postService.publishPost(postId);
        success('Đã đăng bài viết');
      } else if (status === PostStatus.ARCHIVED) {
        await postService.archivePost(postId);
        success('Đã lưu trữ bài viết');
      }
      refresh();
    } catch (err: any) {
      error(err.message || 'Không thể thay đổi trạng thái bài viết');
    }
  };

  const handleDelete = async () => {
    if (!deletePostId) return;

    setDeleting(true);
    try {
      await postService.deletePost(deletePostId);
      success('Đã xóa bài viết');
      refresh();
      setDeletePostId(null);
    } catch (err: any) {
      error(err.message || 'Không thể xóa bài viết');
    } finally {
      setDeleting(false);
    }
  };

  const statusOptions = [
    { label: 'Bản nháp', value: PostStatus.DRAFT },
    { label: 'Đã đăng', value: PostStatus.PUBLISHED },
    { label: 'Lưu trữ', value: PostStatus.ARCHIVED },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý bài viết</h1>
        <p className="text-gray-600">
          Xem và quản lý tất cả bài viết trong hệ thống
        </p>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm kiếm bài viết theo tiêu đề, tác giả..."
          />
        </div>
        <div>
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            categoryOptions={statusOptions}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {pagination.total}
            </div>
            <div className="text-sm text-gray-500">Tổng bài viết</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">--</div>
            <div className="text-sm text-gray-500">Đã đăng</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">--</div>
            <div className="text-sm text-gray-500">Bản nháp</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">--</div>
            <div className="text-sm text-gray-500">Lưu trữ</div>
          </div>
        </Card>
      </div>

      {/* Posts Table */}
      <Card>
        <PostsTable
          posts={posts}
          loading={loading}
          onStatusChange={handleStatusChange}
          onDelete={setDeletePostId}
        />
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletePostId}
        onClose={() => setDeletePostId(null)}
        onConfirm={handleDelete}
        title="Xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
        confirmText="Xóa bài viết"
        type="danger"
        loading={deleting}
      />
    </div>
  );
};
