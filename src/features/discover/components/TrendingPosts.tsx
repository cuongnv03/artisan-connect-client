import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Card } from '../../../components/common/Card';
import { Loader } from '../../../components/ui/Loader';
import { Alert } from '../../../components/ui/Alert';
import { PostService } from '../../../services/post.service';
import { formatRelativeTime } from '../../../utils/formatters';
import { FireIcon } from '@heroicons/react/24/solid';

export const TrendingPosts: React.FC = () => {
  // Fetch trending posts
  const { data, isLoading, isError } = useQuery(
    ['trending-posts'],
    () =>
      PostService.getPosts({
        sortBy: 'viewCount',
        sortOrder: 'desc',
        limit: 5,
      }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  return (
    <Card>
      <div className="flex items-center mb-4">
        <FireIcon className="h-5 w-5 text-red-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Trending Now</h2>
      </div>

      {isLoading ? (
        <Loader size="sm" />
      ) : isError ? (
        <Alert type="error" variant="subtle">
          Failed to load trending posts
        </Alert>
      ) : data?.data.length === 0 ? (
        <p className="text-gray-500 text-sm">No trending posts at the moment</p>
      ) : (
        <div className="space-y-4">
          {data?.data.map((post) => (
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
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-accent line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <span>
                      {post.user.firstName} {post.user.lastName}
                    </span>
                    <span className="mx-1">•</span>
                    <span>{formatRelativeTime(post.createdAt)}</span>
                  </div>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <span>{post.viewCount} views</span>
                    <span className="mx-1">•</span>
                    <span>{post.likeCount} likes</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
};
