import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  ArchiveBoxIcon,
  DocumentIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import { Post, PostStatus } from '../../../types/post';
import { usePostActions } from '../../../hooks/posts';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Dropdown } from '../../ui/Dropdown';
import { ConfirmModal } from '../../ui/Modal';

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  const {
    publishPost,
    archivePost,
    republishPost, // THÊM: Action để republish từ archived
    deletePost,
    isLoading,
  } = usePostActions();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDelete = async () => {
    const success = await deletePost(post.id);
    if (success) {
      setShowDeleteModal(false);
      onUpdate?.();
    }
  };

  // SỬA: Tạo actions dựa trên trạng thái bài viết
  const getAvailableActions = () => {
    const actions = [
      // {
      //   label: 'Xem',
      //   value: 'view',
      //   icon: <EyeIcon className="w-4 h-4" />,
      //   onClick: () => window.open(`/posts/manage/${post.id}`, '_blank'),
      // },
      {
        label: 'Chỉnh sửa',
        value: 'edit',
        icon: <PencilIcon className="w-4 h-4" />,
        onClick: () => window.open(`/posts/${post.id}/edit`, '_blank'),
      },
    ];

    // THÊM: Actions theo trạng thái
    if (post.status === PostStatus.DRAFT) {
      actions.push({
        label: 'Đăng bài',
        value: 'publish',
        icon: <DocumentIcon className="w-4 h-4" />,
        onClick: async () => {
          const success = await publishPost(post.id);
          if (success && onUpdate) {
            onUpdate();
          }
        },
      });
    }

    if (post.status === PostStatus.PUBLISHED) {
      actions.push({
        label: 'Lưu trữ',
        value: 'archive',
        icon: <ArchiveBoxIcon className="w-4 h-4" />,
        onClick: async () => {
          const success = await archivePost(post.id);
          if (success && onUpdate) {
            onUpdate();
          }
        },
      });
    }

    // THÊM: Republish từ archived
    if (post.status === PostStatus.ARCHIVED) {
      actions.push({
        label: 'Đăng lại',
        value: 'republish',
        icon: <ArrowUpTrayIcon className="w-4 h-4" />,
        onClick: async () => {
          const success = await republishPost(post.id);
          if (success && onUpdate) {
            onUpdate();
          }
        },
      });
    }

    // Delete action (always available except for deleted posts)
    if (post.status !== PostStatus.DELETED) {
      actions.push({
        label: 'Xóa',
        value: 'delete',
        icon: <TrashIcon className="w-4 h-4" />,
        onClick: () => setShowDeleteModal(true),
      });
    }

    return actions;
  };

  const dropdownItems = getAvailableActions();

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <div className="flex">
          {/* Post Thumbnail */}
          {post.coverImage && (
            <div className="w-48 flex-shrink-0">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-32 object-cover rounded-l-lg"
              />
            </div>
          )}

          {/* Post Info */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <Link
                  to={`/posts/manage/${post.id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-primary line-clamp-2"
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
                <Badge variant={getStatusVariant(post.status)} size="sm">
                  {getStatusDisplay(post.status)}
                </Badge>

                <Dropdown
                  trigger={
                    <Button variant="ghost" size="sm">
                      <EllipsisHorizontalIcon className="w-4 h-4" />
                    </Button>
                  }
                  items={dropdownItems}
                />
              </div>
            </div>

            {/* Post Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3">
              <span>
                Tạo:{' '}
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
              {post.publishedAt && (
                <span>
                  Đăng:{' '}
                  {formatDistanceToNow(new Date(post.publishedAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
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
