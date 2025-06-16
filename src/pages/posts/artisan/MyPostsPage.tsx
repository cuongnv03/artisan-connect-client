import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { usePostsList } from '../../../hooks/posts';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Tabs } from '../../../components/ui/Tabs';
import { SearchBox } from '../../../components/common/SearchBox';
import { PostsList } from '../../../components/posts/artisan/PostsList';
import { PostStatus } from '../../../types/post';
import { useDebounce } from '../../../hooks/useDebounce';

export const MyPostsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { posts, loading, refresh } = usePostsList({
    q: debouncedQuery || undefined,
    status: activeTab !== 'all' ? (activeTab as PostStatus) : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const tabItems = [
    { key: 'all', label: 'Tất cả', content: null },
    { key: PostStatus.PUBLISHED, label: 'Đã đăng', content: null },
    { key: PostStatus.DRAFT, label: 'Bản nháp', content: null },
    { key: PostStatus.ARCHIVED, label: 'Lưu trữ', content: null },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bài viết của tôi
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi tất cả bài viết bạn đã tạo
          </p>
        </div>

        <Link to="/posts/create">
          <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
            Tạo bài viết mới
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm kiếm bài viết..."
            />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          items={tabItems}
          activeKey={activeTab}
          onChange={setActiveTab}
          variant="line"
        />
      </div>

      {/* Posts List */}
      <PostsList
        posts={posts}
        loading={loading}
        onUpdate={refresh}
        onCreateNew={() => (window.location.href = '/posts/create')}
      />
    </div>
  );
};
