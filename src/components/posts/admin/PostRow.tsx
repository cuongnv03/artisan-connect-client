import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Post } from '../../../types/post';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { Dropdown } from '../../ui/Dropdown';
import { PostStatusBadge } from './PostStatusBadge';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';

interface PostRowProps {
  post: Post;
  onStatusChange: (postId: string, status: string) => void;
  onDelete: (postId: string) => void;
}

export const PostRow: React.FC<PostRowProps> = ({
  post,
  onStatusChange,
  onDelete,
}) => {
  const dropdownItems = [
    {
      label: 'Xem chi tiết',
      value: 'view',
      icon: <EyeIcon className="w-4 h-4" />,
      onClick: () => window.open(`/artisan/posts/${post.id}`, '_blank'),
    },
    {
      label: 'Chỉnh sửa',
      value: 'edit',
      icon: <PencilIcon className="w-4 h-4" />,
      onClick: () => window.open(`/artisan/posts/${post.id}/edit`, '_blank'),
    },
    {
      label: 'Xóa',
      value: 'delete',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: () => onDelete(post.id),
    },
  ];

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center">
          {post.coverImage && (
            <img
              className="h-10 w-10 rounded-lg object-cover mr-3"
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
            <div className="flex items-center mt-1 space-x-4 text-xs text-gray-400">
              <span>{post.viewCount} lượt xem</span>
              <span>{post.likeCount} thích</span>
              <span>{post.commentCount} bình luận</span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center">
          <Avatar
            src={post.user?.avatarUrl}
            alt={`${post.user?.firstName} ${post.user?.lastName}`}
            size="sm"
          />
          <div className="ml-2">
            <div className="text-sm font-medium text-gray-900">
              {post.user?.firstName} {post.user?.lastName}
            </div>
            <div className="text-sm text-gray-500">@{post.user?.username}</div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <PostStatusBadge status={post.status} />
      </td>

      <td className="px-6 py-4 text-sm text-gray-500">
        {formatDistanceToNow(new Date(post.createdAt), {
          addSuffix: true,
          locale: vi,
        })}
      </td>

      <td className="px-6 py-4 text-right text-sm font-medium">
        <Dropdown
          trigger={
            <Button variant="ghost" size="sm">
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </Button>
          }
          items={dropdownItems}
          placement="bottom-end"
        />
      </td>
    </tr>
  );
};
