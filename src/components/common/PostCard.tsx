import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Post } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToastContext } from '../../contexts/ToastContext';
import { socialService } from '../../services/social.service';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
} from '@heroicons/react/24/solid';

interface PostCardProps {
  post: Post;
  showAuthor?: boolean;
  compact?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  showAuthor = true,
  compact = false,
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { success, error } = useToastContext();

  const handleLike = async () => {
    if (isLiking) return; // Prevent double clicking

    try {
      setIsLiking(true);

      // Optimistically update UI
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

      // Call API to toggle like
      await socialService.toggleLike({ postId: post.id });
    } catch (err: any) {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));

      error(err.message || 'Không thể thích bài viết');
      console.error('Error toggling like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return; // Prevent double clicking

    try {
      setIsSaving(true);

      // Optimistically update UI
      const newIsSaved = !isSaved;
      setIsSaved(newIsSaved);

      // Call API to toggle save
      await socialService.toggleSavePost(post.id);

      success(newIsSaved ? 'Đã lưu bài viết' : 'Đã bỏ lưu bài viết');
    } catch (err: any) {
      // Revert optimistic update on error
      setIsSaved(!isSaved);

      error(err.message || 'Không thể lưu bài viết');
      console.error('Error toggling save:', err);
    } finally {
      setIsSaving(false);
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
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        success('Đã sao chép liên kết bài viết');
      } catch (err) {
        error('Không thể sao chép liên kết');
      }
    }
  };

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

  const getPostTypeColor = (type: string) => {
    const colors = {
      STORY: 'primary',
      TUTORIAL: 'info',
      PRODUCT_SHOWCASE: 'success',
      BEHIND_THE_SCENES: 'warning',
      EVENT: 'danger',
      GENERAL: 'default',
    };
    return (colors[type as keyof typeof colors] as any) || 'default';
  };

  const renderContent = () => {
    if (!post.content || post.content.length === 0) {
      return <p className="text-gray-600">{post.summary}</p>;
    }

    // Render first few content blocks
    return post.content.slice(0, 2).map((block, index) => {
      switch (block.type) {
        case 'PARAGRAPH':
          return (
            <p key={index} className="text-gray-700 mb-2">
              {block.content?.substring(0, compact ? 100 : 200)}
              {block.content &&
                block.content.length > (compact ? 100 : 200) &&
                '...'}
            </p>
          );
        case 'IMAGE':
          return (
            <div key={index} className="mb-2">
              <img
                src={block.metadata?.url}
                alt={block.metadata?.caption || ''}
                className="rounded-lg w-full h-48 object-cover"
              />
            </div>
          );
        default:
          return null;
      }
    });
  };

  return (
    <article className="card p-6 hover:shadow-md transition-shadow">
      {/* Author info */}
      {showAuthor && post.user && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link to={`/profile/${post.user.id}`} className="flex items-center">
              <Avatar
                src={post.user.avatarUrl}
                alt={`${post.user.firstName} ${post.user.lastName}`}
                size="md"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {post.user.firstName} {post.user.lastName}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                  <span className="mx-1">•</span>
                  <Badge variant={getPostTypeColor(post.type)} size="sm">
                    {getPostTypeDisplay(post.type)}
                  </Badge>
                </div>
              </div>
            </Link>
          </div>

          <Button variant="ghost" size="sm">
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Cover image */}
      {post.coverImage && (
        <div className="mb-4">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Content */}
      <div className="mb-4">
        <Link to={`/posts/${post.slug || post.id}`}>
          <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary transition-colors">
            {post.title}
          </h2>
        </Link>

        {renderContent()}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
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

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-2 transition-colors ${
              isLiking ? 'opacity-50 cursor-not-allowed' : ''
            } ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
          >
            {isLiked ? (
              <HeartIconSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
            <span className="text-sm">{likeCount}</span>
          </button>

          <Link
            to={`/posts/${post.slug || post.id}#comments`}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <ChatBubbleOvalLeftIcon className="w-5 h-5" />
            <span className="text-sm">{post.commentCount}</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
          >
            <ShareIcon className="w-5 h-5" />
            <span className="text-sm">Chia sẻ</span>
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`transition-colors ${
            isSaving ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            isSaved ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'
          }`}
        >
          {isSaved ? (
            <BookmarkIconSolid className="w-5 h-5 text-yellow-500" />
          ) : (
            <BookmarkIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </article>
  );
};
