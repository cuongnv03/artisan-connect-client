import React from 'react';
import { Post } from '../../../types/post';
import { usePostActions } from '../../../hooks/posts';
import { Button } from '../../ui/Button';
import {
  PencilIcon,
  EyeIcon,
  ShareIcon,
  ArchiveBoxIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

interface PostActionsProps {
  post: Post;
  onUpdate?: () => void;
}

export const PostActions: React.FC<PostActionsProps> = ({ post, onUpdate }) => {
  const { publishPost, archivePost, editPost, viewPost, isLoading } =
    usePostActions();

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

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/posts/${post.slug || post.id}`;
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => viewPost(post.id)}
        leftIcon={<EyeIcon className="w-4 h-4" />}
      >
        Xem
      </Button>

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

      <Button
        variant="ghost"
        size="sm"
        leftIcon={<ShareIcon className="w-4 h-4" />}
        onClick={handleShare}
      >
        Chia sẻ
      </Button>
    </div>
  );
};
