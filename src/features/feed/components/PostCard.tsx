import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../../../components/common/Avatar';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { formatRelativeTime } from '../../../utils/formatters';
import {
  HeartIcon as HeartOutline,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon as BookmarkOutline,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid,
} from '@heroicons/react/24/solid';
import { PostWithUser } from '../../../types/post.types';

interface PostCardProps {
  post: PostWithUser;
  onLike?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onSave,
  onComment,
  onShare,
}) => {
  const [isLiked, setIsLiked] = useState(post.liked || false);
  const [isSaved, setIsSaved] = useState(post.saved || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    if (onLike) onLike(post.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    if (onSave) onSave(post.id);
  };

  return (
    <Card className="overflow-hidden mb-4 transition-all hover:shadow-md">
      {/* Post Header */}
      <div className="flex items-center mb-4">
        <Link to={`/artisan/${post.user.id}`} className="flex items-center">
          <Avatar
            src={post.user.avatarUrl}
            firstName={post.user.firstName}
            lastName={post.user.lastName}
            size="md"
            status={post.user.artisanProfile?.isVerified ? 'online' : undefined}
          />
          <div className="ml-3">
            <div className="flex items-center">
              <h3 className="font-medium text-gray-900">
                {post.user.artisanProfile?.shopName ||
                  `${post.user.firstName} ${post.user.lastName}`}
              </h3>
              {post.user.artisanProfile?.isVerified && (
                <Badge variant="info" size="sm" className="ml-2">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </Link>
      </div>

      {/* Post Image (if available) */}
      {post.thumbnailUrl && (
        <Link to={`/post/${post.id}`}>
          <div className="relative pb-[56.25%] mb-4 overflow-hidden rounded-lg">
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-[1.02]"
            />
          </div>
        </Link>
      )}

      {/* Post Content */}
      <div className="mb-4">
        <Link to={`/post/${post.id}`}>
          <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-accent">
            {post.title}
          </h2>
        </Link>
        {post.summary && <p className="text-gray-700">{post.summary}</p>}

        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="default" size="sm" rounded>
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Product Mentions */}
      {post.productMentions && post.productMentions.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Featured Products:
          </p>
          <div className="flex overflow-x-auto space-x-3 pb-2">
            {post.productMentions.map((product) => (
              <Link
                key={product.productId}
                to={`/product/${product.productId}`}
                className="flex-shrink-0 w-20"
              >
                <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden">
                  <img
                    src={product.thumbnailUrl || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-center mt-1 truncate">
                  {product.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="flex justify-between border-t border-gray-100 pt-3">
        <div className="flex space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center text-sm font-medium ${
              isLiked ? 'text-accent' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isLiked ? (
              <HeartSolid className="h-5 w-5 mr-1.5" />
            ) : (
              <HeartOutline className="h-5 w-5 mr-1.5" />
            )}
            {likeCount > 0 && likeCount}
          </button>

          <button
            onClick={() => onComment && onComment(post.id)}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ChatBubbleLeftIcon className="h-5 w-5 mr-1.5" />
            {post.commentCount > 0 && post.commentCount}
          </button>

          <button
            onClick={() => onShare && onShare(post.id)}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ShareIcon className="h-5 w-5 mr-1.5" />
          </button>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center text-sm font-medium ${
            isSaved ? 'text-accent' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isSaved ? (
            <BookmarkSolid className="h-5 w-5" />
          ) : (
            <BookmarkOutline className="h-5 w-5" />
          )}
        </button>
      </div>
    </Card>
  );
};
