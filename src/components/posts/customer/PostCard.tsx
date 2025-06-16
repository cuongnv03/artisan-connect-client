import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Post } from '../../../types/post';
import { Avatar } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';

interface PostCardProps {
  post: Post;
  onClick: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={() => onClick(post)}
    >
      {/* Cover Image */}
      {post.coverImage && (
        <div className="h-48 overflow-hidden rounded-t-lg">
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
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {post.title}
        </h3>

        {/* Summary */}
        {post.summary && (
          <p className="text-gray-600 mb-4 line-clamp-3">{post.summary}</p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>{post.viewCount} lượt xem</span>
            <span>{post.likeCount} thích</span>
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
      </div>
    </Card>
  );
};
