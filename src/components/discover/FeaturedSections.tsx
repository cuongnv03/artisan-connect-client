import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArtisanCard } from '../common/ArtisanCard';
import { PostCard } from '../posts/customer/PostCard';
import { ProductCard } from '../products/ProductCard';
import { useFollowArtisan } from '../../hooks/discover/useFollowArtisan';
import { Post } from '../../types/post';

interface FeaturedSectionsProps {
  content: {
    artisans: any[];
    posts: Post[]; // SỬA: Specify Post type
    products: any[];
  };
  onViewMore: (type: string) => void;
  onPostClick?: (post: Post) => void; // THÊM: Post click handler
  onCommentClick?: (post: Post) => void; // THÊM: Comment click handler
}

export const FeaturedSections: React.FC<FeaturedSectionsProps> = ({
  content,
  onViewMore,
  onPostClick, // NHẬN: Post click handler
  onCommentClick, // NHẬN: Comment click handler
}) => {
  const { handleFollow, getFollowState, followLoading } = useFollowArtisan();

  return (
    <div className="space-y-8">
      {/* Featured Artisans */}
      {content.artisans.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Nghệ nhân nổi bật
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewMore('artisans')}
            >
              Xem tất cả
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.artisans.slice(0, 6).map((artisan: any) => {
              const followState = getFollowState(artisan.user.id);
              return (
                <ArtisanCard
                  key={artisan.id}
                  artisan={artisan}
                  isFollowing={followState.isFollowing}
                  followLoading={followLoading === artisan.user.id}
                  onFollow={() => handleFollow(artisan.user.id)}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Top Posts - SỬA: Thêm post handlers */}
      {content.posts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Bài viết nổi bật
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewMore('posts')}
            >
              Xem tất cả
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {content.posts.slice(0, 4).map((post: Post) => (
              <PostCard
                key={post.id}
                post={post}
                compact
                onClick={onPostClick} // THÊM: Pass post click handler
                onCommentClick={onCommentClick} // THÊM: Pass comment click handler
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {content.products.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Sản phẩm bán chạy
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewMore('products')}
            >
              Xem tất cả
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {content.products.slice(0, 8).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
