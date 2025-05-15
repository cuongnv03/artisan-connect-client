import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Card } from '../../common/Card';
import { Loader } from '../../feedback/Loader';
import { PostService } from '../../../services/post.service';
import { formatRelativeTime } from '../../../helpers/formatters';
import { PostType } from '../../../types/post.types';

interface RelatedPostsProps {
  artisanId: string;
  currentPostId: string;
  postType?: PostType;
}

export const RelatedPosts: React.FC<RelatedPostsProps> = ({
  artisanId,
  currentPostId,
  postType,
}) => {
  // Fetch related posts
  const { data, isLoading } = useQuery(
    ['related-posts', artisanId, currentPostId, postType],
    () =>
      PostService.getPosts({
        userId: artisanId,
        type: postType,
        limit: 5,
      }),
    {
      select: (data) => {
        // Filter out current post and limit to 3 posts
        return {
          ...data,
          data: data.data
            .filter((post) => post.id !== currentPostId)
            .slice(0, 3),
        };
      },
    },
  );

  if (isLoading) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          More from this Artisan
        </h3>
        <Loader size="sm" />
      </Card>
    );
  }

  if (!data || data.data.length === 0) {
    return null;
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        More from this Artisan
      </h3>
      <div className="space-y-4">
        {data.data.map((post) => (
          <Link key={post.id} to={`/post/${post.id}`} className="block group">
            <div className="flex items-start">
              {post.thumbnailUrl && (
                <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              )}
              <div className={post.thumbnailUrl ? 'ml-3' : ''}>
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-accent line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {formatRelativeTime(post.createdAt)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <Link
          to={`/artisan/${artisanId}/posts`}
          className="text-sm font-medium text-accent hover:text-accent-dark"
        >
          View all posts →
        </Link>
      </div>
    </Card>
  );
};
