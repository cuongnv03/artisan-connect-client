import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
} from '@heroicons/react/24/solid';
import { Post } from '../../../types/post';
import { WishlistItemType } from '../../../types/social';
import { Avatar } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import { socialService } from '../../../services/social.service';
import { useToastContext } from '../../../contexts/ToastContext';

interface PostMetaProps {
  post: Post;
  showActions?: boolean;
}

export const PostMeta: React.FC<PostMetaProps> = ({
  post,
  showActions = false,
}) => {
  const { success, error } = useToastContext();
  // Logic like đơn giản như cũ - không có callback
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false);

  const getPostTypeDisplay = (type: string) => {
    const types = {
      STORY: 'Câu chuyện',
      TUTORIAL: 'Hướng dẫn',
      PRODUCT_SHOWCASE: 'Sản phẩm',
      BEHIND_THE_SCENES: 'Hậu trường',
      EVENT: 'Sự kiện',
      GENERAL: 'Chung',
    };
    return types[type as keyof typeof types] || type;
  };

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const result = await socialService.toggleLike({ postId: post.id });
      setIsLiked(result.liked);
      setLikeCount((prev) => (result.liked ? prev + 1 : prev - 1));
    } catch (err: any) {
      error('Không thể thích bài viết');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    try {
      const newIsSaved = !isSaved;
      setIsSaved(newIsSaved);
      await socialService.toggleWishlistItem({
        itemType: WishlistItemType.POST,
        postId: post.id,
      });
      success(newIsSaved ? 'Đã lưu bài viết' : 'Đã bỏ lưu bài viết');
    } catch (err: any) {
      setIsSaved(!isSaved);
      error('Không thể lưu bài viết');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/posts/${post.slug || post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.summary,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        success('Đã sao chép liên kết');
      } catch (err) {
        error('Không thể sao chép liên kết');
      }
    }
  };

  return (
    <div className="border-b border-gray-200 pb-6 mb-6">
      {/* Author Info */}
      <div className="flex items-center mb-4">
        <Avatar
          src={post.user?.avatarUrl}
          alt={`${post.user?.firstName} ${post.user?.lastName}`}
          size="lg"
        />
        <div className="ml-3">
          <p className="font-medium text-gray-900">
            {post.user?.firstName} {post.user?.lastName}
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
            <span className="mx-2">•</span>
            <Badge variant="secondary" size="sm">
              {getPostTypeDisplay(post.type)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Post Stats */}
      <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
        <div className="flex items-center">
          <EyeIcon className="w-4 h-4 mr-1" />
          <span>{post.viewCount} lượt xem</span>
        </div>
        <div className="flex items-center">
          <HeartIcon className="w-4 h-4 mr-1" />
          <span>{likeCount} lượt thích</span>
        </div>
        <div className="flex items-center">
          <ChatBubbleOvalLeftIcon className="w-4 h-4 mr-1" />
          <span>{post.commentCount} bình luận</span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
            >
              {isLiked ? (
                <HeartIconSolid className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6" />
              )}
              <span>{likeCount}</span>
            </button>

            <div className="flex items-center space-x-2 text-gray-500">
              <ChatBubbleOvalLeftIcon className="w-6 h-6" />
              <span>{post.commentCount}</span>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
            >
              <ShareIcon className="w-6 h-6" />
              <span>Chia sẻ</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            className="text-gray-500 hover:text-yellow-500 transition-colors"
          >
            {isSaved ? (
              <BookmarkIconSolid className="w-6 h-6 text-yellow-500" />
            ) : (
              <BookmarkIcon className="w-6 h-6" />
            )}
          </button>
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" size="sm">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
