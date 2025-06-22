import React, { useState } from 'react';
import { Post } from '../../../types/post';
import { usePostActions } from '../../../hooks/posts';
import { Button } from '../../ui/Button';
import { ConfirmModal } from '../../ui/Modal';
import {
  PencilIcon,
  EyeIcon,
  ArchiveBoxIcon,
  DocumentIcon,
  ArrowUpTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface PostActionsProps {
  post: Post;
  onUpdate?: () => void;
}

export const PostActions: React.FC<PostActionsProps> = ({ post, onUpdate }) => {
  const {
    publishPost,
    archivePost,
    editPost,
    viewPost,
    republishPost,
    deletePost, // Thêm deletePost
    isLoading,
  } = usePostActions();

  // State cho delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handlePublish = async () => {
    const success = await publishPost(post.id);
    if (success && onUpdate) {
      onUpdate();
    }
  };

  const handleArchive = async () => {
    const success = await archivePost(post.id);
    if (success && onUpdate) {
      onUpdate();
    }
  };

  const handleRepublish = async () => {
    const success = await republishPost(post.id);
    if (success && onUpdate) {
      onUpdate();
    }
  };

  // Thêm handler cho delete
  const handleDelete = async () => {
    const success = await deletePost(post.id);
    if (success) {
      setShowDeleteModal(false);
      // Navigate về trang posts list
      window.location.href = '/posts/me';
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editPost(post.id)}
          leftIcon={<PencilIcon className="w-4 h-4" />}
        >
          Sửa
        </Button>

        {post.status === 'DRAFT' && (
          <Button
            variant="primary"
            size="sm"
            onClick={handlePublish}
            loading={isLoading(post.id, 'publish')}
            leftIcon={<DocumentIcon className="w-4 h-4" />}
          >
            Đăng
          </Button>
        )}

        {post.status === 'PUBLISHED' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleArchive}
            loading={isLoading(post.id, 'archive')}
            leftIcon={<ArchiveBoxIcon className="w-4 h-4" />}
          >
            Lưu trữ
          </Button>
        )}

        {post.status === 'ARCHIVED' && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleRepublish}
            loading={isLoading(post.id, 'republish')}
            leftIcon={<ArrowUpTrayIcon className="w-4 h-4" />}
          >
            Đăng lại
          </Button>
        )}

        {/* Thêm nút Xóa */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
          leftIcon={<TrashIcon className="w-4 h-4" />}
          className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
        >
          Xóa
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
        confirmText="Xóa bài viết"
        type="danger"
        loading={isLoading(post.id, 'delete')}
      />
    </>
  );
};
