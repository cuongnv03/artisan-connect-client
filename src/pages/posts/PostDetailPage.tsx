import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePostDetail } from '../../hooks/posts';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { PostContent } from '../../components/posts/shared/PostContent';
import { PostMeta } from '../../components/posts/shared/PostMeta';
import { ProductMentionCard } from '../../components/posts/shared/ProductMentionCard';
import { ImageGallery } from '../../components/common/ImageGallery';
import { PostActions } from '../../components/posts/artisan/PostActions';
import { CommentSection } from '../../components/posts/customer/CommentSection';

export const PostDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { post, loading, isAuthor, refresh } = usePostDetail();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Không tìm thấy bài viết
        </h2>
        <p className="text-gray-600 mb-4">
          Bài viết này không tồn tại hoặc đã bị xóa.
        </p>
        <Button onClick={() => navigate('/posts/me')}>
          Quay lại danh sách bài viết
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/posts/me" className="text-gray-500 hover:text-gray-700">
            ← Quay lại danh sách
          </Link>
        </div>

        {/* Chỉ hiển thị PostActions, xóa menu dropdown */}
        {isAuthor && <PostActions post={post} onUpdate={refresh} />}
      </div>

      {/* LAYOUT 2 CỘT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image - ĐẶT NGAY TRÊN TITLE */}
          {post.coverImage && (
            <div className="mb-6">
              <img loading="lazy"
                src={post.coverImage}
                alt={post.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Header với Title và Meta */}
          <Card className="p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {post.summary && (
              <p className="text-lg text-gray-600 mb-6">{post.summary}</p>
            )}

            <PostMeta post={post} showActions={true} />
          </Card>

          {/* Content */}
          <Card className="p-8">
            <PostContent content={post.content} />
          </Card>
        </div>

        {/* CỘT PHẢI - 1/3 */}
        <div className="lg:col-span-1 space-y-6">
          {/* Media Gallery */}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📸</span>
                Thư viện ảnh
              </h3>
              <ImageGallery images={post.mediaUrls} />
            </Card>
          )}

          {/* Product Mentions */}
          {post.productMentions && post.productMentions.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🏷️</span>
                Sản phẩm đề cập
              </h3>
              <div className="space-y-4">
                {post.productMentions.map((mention) => (
                  <ProductMentionCard key={mention.id} mention={mention} />
                ))}
              </div>
            </Card>
          )}

          {/* Comment Section - Thêm phần này */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💬</span>
              Bình luận
            </h3>
            <CommentSection postId={post.id} />
          </Card>
        </div>
      </div>
    </div>
  );
};
