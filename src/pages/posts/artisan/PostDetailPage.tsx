import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { usePostDetail } from '../../../hooks/posts';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Dropdown } from '../../../components/ui/Dropdown';
import { ConfirmModal } from '../../../components/ui/Modal';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { PostContent } from '../../../components/posts/shared/PostContent';
import { PostMeta } from '../../../components/posts/shared/PostMeta';
import { ProductMentionCard } from '../../../components/posts/shared/ProductMentionCard';
import { ImageGallery } from '../../../components/common/ImageGallery';
import { PostActions } from '../../../components/posts/artisan/PostActions';
import { postService } from '../../../services/post.service';
import { useToastContext } from '../../../contexts/ToastContext';

export const PostDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const { post, loading, isAuthor } = usePostDetail();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!post?.id) return;

    setDeleting(true);
    try {
      await postService.deletePost(post.id);
      success('Đã xóa bài viết');
      navigate('/posts/me');
    } catch (err: any) {
      error('Không thể xóa bài viết');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const menuItems = isAuthor
    ? [
        {
          label: 'Chỉnh sửa',
          value: 'edit',
          icon: <PencilIcon className="w-4 h-4" />,
          onClick: () => navigate(`/posts/${post?.id}/edit`),
        },
        {
          label: 'Xóa',
          value: 'delete',
          icon: <TrashIcon className="w-4 h-4" />,
          onClick: () => setShowDeleteModal(true),
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Không tìm thấy bài viết
        </h2>
        <p className="text-gray-600 mb-4">
          Bài viết này không tồn tại hoặc đã bị xóa.
        </p>
        <Button onClick={() => navigate('/posts/me')}>
          Quay lại danh sách bài viết
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <Card className="p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/posts/me" className="text-gray-500 hover:text-gray-700">
              ← Quay lại danh sách
            </Link>
          </div>

          {isAuthor && (
            <div className="flex items-center space-x-2">
              <PostActions post={post} />

              {menuItems.length > 0 && (
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="sm">
                      <EllipsisHorizontalIcon className="w-5 h-5" />
                    </Button>
                  }
                  items={menuItems}
                />
              )}
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

        {post.summary && (
          <p className="text-lg text-gray-600 mb-6">{post.summary}</p>
        )}

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-6">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        )}

        <PostMeta post={post} showActions={true} />
      </Card>

      {/* Content */}
      <Card className="p-8 mb-6">
        <PostContent content={post.content} />

        {/* Media Gallery */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="mt-8">
            <ImageGallery images={post.mediaUrls} />
          </div>
        )}
      </Card>

      {/* Product Mentions */}
      {post.productMentions && post.productMentions.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🏷️</span>
            Sản phẩm được đề cập trong bài viết
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {post.productMentions.map((mention) => (
              <ProductMentionCard key={mention.id} mention={mention} />
            ))}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
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
