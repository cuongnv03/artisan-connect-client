import React from 'react';
import { PostStatus } from '../../../types/post';
import { Badge } from '../../ui/Badge';

interface PostStatusBadgeProps {
  status: PostStatus;
}

export const PostStatusBadge: React.FC<PostStatusBadgeProps> = ({ status }) => {
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

  return (
    <Badge variant={getStatusVariant(status)} size="sm">
      {getStatusDisplay(status)}
    </Badge>
  );
};
