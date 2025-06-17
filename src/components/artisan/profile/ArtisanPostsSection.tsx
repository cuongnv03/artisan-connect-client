import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useArtisanPosts } from '../../../hooks/artisan/useArtisanPosts';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Select } from '../../ui/Dropdown';
import { EmptyState } from '../../common/EmptyState';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { PostCard } from '../../posts/customer/PostCard';
import { UserProfileDto } from '../../../types/user';
import { PostType } from '../../../types/post';

interface ArtisanPostsSectionProps {
  artisan: UserProfileDto;
  isOwnProfile: boolean;
}

export const ArtisanPostsSection: React.FC<ArtisanPostsSectionProps> = ({
  artisan,
  isOwnProfile,
}) => {
  const {
    posts,
    loading,
    hasMore,
    filters,
    setFilters,
    loadPosts,
    loadMorePosts,
  } = useArtisanPosts(artisan.id);

  const getPostTypeOptions = () => [
    { label: 'Tất cả bài viết', value: '' },
    { label: 'Câu chuyện', value: PostType.STORY },
    { label: 'Hướng dẫn', value: PostType.TUTORIAL },
    { label: 'Giới thiệu sản phẩm', value: PostType.PRODUCT_SHOWCASE },
    { label: 'Hậu trường', value: PostType.BEHIND_THE_SCENES },
    { label: 'Sự kiện', value: PostType.EVENT },
    { label: 'Chung', value: PostType.GENERAL },
  ];

  const sortOptions = [
    { label: 'Mới nhất', value: 'createdAt' },
    { label: 'Nhiều lượt xem nhất', value: 'viewCount' },
    { label: 'Nhiều lượt thích nhất', value: 'likeCount' },
    { label: 'Nhiều bình luận nhất', value: 'commentCount' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Bài viết của {artisan.firstName}
          </h3>
          <p className="text-sm text-gray-500">{posts.length} bài viết</p>
        </div>

        {isOwnProfile && (
          <Link to="/posts/create">
            <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
              Tạo bài viết
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center">
            <FunnelIcon className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Bộ lọc:</span>
          </div>

          <div className="flex flex-col md:flex-row gap-3 flex-1">
            <Select
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
              options={getPostTypeOptions()}
              className="md:w-48"
            />

            <Select
              value={filters.sortBy}
              onChange={(value) => setFilters({ ...filters, sortBy: value })}
              options={sortOptions}
              className="md:w-48"
            />

            <Select
              value={filters.sortOrder}
              onChange={(value) =>
                setFilters({ ...filters, sortOrder: value as 'asc' | 'desc' })
              }
              options={[
                { label: 'Giảm dần', value: 'desc' },
                { label: 'Tăng dần', value: 'asc' },
              ]}
              className="md:w-32"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadPosts}
            leftIcon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} showAuthor={false} />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center py-8">
                {loading ? (
                  <div className="text-center">
                    <LoadingSpinner size="md" />
                    <p className="mt-2 text-sm text-gray-600">
                      Đang tải thêm bài viết...
                    </p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={loadMorePosts}
                    leftIcon={<ArrowPathIcon className="w-4 h-4" />}
                  >
                    Tải thêm bài viết
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title={
              filters.type
                ? `Chưa có bài viết loại "${
                    getPostTypeOptions().find((o) => o.value === filters.type)
                      ?.label
                  }"`
                : 'Chưa có bài viết nào'
            }
            description={
              isOwnProfile
                ? 'Hãy tạo bài viết đầu tiên của bạn!'
                : filters.type
                ? 'Thử thay đổi bộ lọc để xem các bài viết khác.'
                : 'Nghệ nhân này chưa có bài viết nào.'
            }
            action={
              isOwnProfile
                ? {
                    label: 'Tạo bài viết',
                    onClick: () => (window.location.href = '/posts/create'),
                  }
                : filters.type
                ? {
                    label: 'Xem tất cả bài viết',
                    onClick: () => setFilters({ ...filters, type: '' }),
                  }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
};
