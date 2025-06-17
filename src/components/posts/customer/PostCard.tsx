import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
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
import { Card } from '../../ui/Card';
import { socialService } from '../../../services/social.service';
import { useToastContext } from '../../../contexts/ToastContext';
import { Link } from 'react-router-dom';

interface PostCardProps {
  post: Post;
  onClick: (post: Post) => void;
  onCommentClick?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onClick,
  onCommentClick,
}) => {
  const { success, error } = useToastContext();
  // Logic like đơn giản như cũ - không có callback
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getAuthorProfileLink = () => {
    return `/artisan/${post.user?.id}`;
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

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

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isSaving) return;
    setIsSaving(true);

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
    } finally {
      setIsSaving(false);
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCommentClick) {
      onCommentClick(post);
    } else {
      onClick(post);
    }
  };

  const handleCardClick = () => {
    onClick(post);
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="h-48 overflow-hidden" onClick={handleCardClick}>
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-6">
        {/* Author Info */}
        <div className="flex items-center mb-4">
          <Avatar
            src={post.user?.avatarUrl}
            alt={`${post.user?.firstName} ${post.user?.lastName}`}
            size="md"
          />
          <Link to={getAuthorProfileLink()} className="flex-shrink-0">
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
                  {post.type}
                </Badge>
              </div>
            </div>
          </Link>
        </div>

        {/* Title - Clickable */}
        <h3
          className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer"
          onClick={handleCardClick}
        >
          {post.title}
        </h3>

        {/* Summary - Clickable */}
        {post.summary && (
          <p
            className="text-gray-600 mb-4 line-clamp-3 cursor-pointer hover:text-gray-800 transition-colors"
            onClick={handleCardClick}
          >
            {post.summary}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <EyeIcon className="w-4 h-4 mr-1" />
              <span>{post.viewCount}</span>
            </div>
            <span>{likeCount} thích</span>
            <span>{post.commentCount} bình luận</span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex space-x-1">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" size="sm">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'text-red-500 bg-red-50 hover:bg-red-100'
                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLiked ? (
                <HeartIconSolid className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">
                {likeCount > 0 ? likeCount : 'Thích'}
              </span>
            </button>

            {/* Comment Button */}
            <button
              onClick={handleComment}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"
            >
              <ChatBubbleOvalLeftIcon className="w-5 h-5" />
              <span className="text-sm font-medium">
                {post.commentCount > 0 ? post.commentCount : 'Bình luận'}
              </span>
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`p-2 rounded-lg transition-colors ${
              isSaved
                ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                : 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-50'
            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaved ? (
              <BookmarkIconSolid className="w-5 h-5" />
            ) : (
              <BookmarkIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};
