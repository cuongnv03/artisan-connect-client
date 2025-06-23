import React from 'react';
import { Button } from '../ui/Button';
import { ArtisanCard } from '../common/ArtisanCard';
import { UserCard } from '../common/UserCard';
import { PostCard } from '../posts/customer/PostCard';
import { ProductCard } from '../products/ProductCard';
import { SearchType } from '../../contexts/DiscoverContext';
import { Post } from '../../types/post';

interface SearchResultsProps {
  activeTab: SearchType;
  results: {
    artisans: any[];
    users: any[];
    posts: Post[];
    products: any[];
  };
  totals: Record<string, number>;
  onViewMore: (type: SearchType) => void;
  onPostClick?: (post: Post) => void;
  onCommentClick?: (post: Post) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  activeTab,
  results,
  totals,
  onViewMore,
  onPostClick,
  onCommentClick,
}) => {
  if (activeTab === 'all') {
    return (
      <div className="space-y-8">
        {/* Artisans Section */}
        {results.artisans.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Nghệ nhân ({totals.artisans})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewMore('artisans')}
              >
                Xem tất cả
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.artisans.map((artisan: any) => (
                <ArtisanCard key={artisan.id} artisan={artisan} />
              ))}
            </div>
          </section>
        )}

        {/* Users Section */}
        {results.users.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Người dùng ({totals.users})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewMore('users')}
              >
                Xem tất cả
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.users.map((user: any) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </section>
        )}

        {/* Posts Section */}
        {results.posts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Bài viết ({totals.posts})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewMore('posts')}
              >
                Xem tất cả
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {results.posts.map((post: Post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  compact
                  onClick={onPostClick}
                  onCommentClick={onCommentClick}
                />
              ))}
            </div>
          </section>
        )}

        {/* Products Section */}
        {results.products.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Sản phẩm ({totals.products})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewMore('products')}
              >
                Xem tất cả
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isManagementView={false}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // Single type results
  const currentResults = results[activeTab] || [];

  return (
    <div>
      {activeTab === 'artisans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentResults.map((artisan: any) => (
            <ArtisanCard key={artisan.id} artisan={artisan} />
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentResults.map((user: any) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-6">
          {currentResults.map((post: Post) => (
            <PostCard
              key={post.id}
              post={post}
              onClick={onPostClick}
              onCommentClick={onCommentClick}
            />
          ))}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentResults.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              isManagementView={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};
