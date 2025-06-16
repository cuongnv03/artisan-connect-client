import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePostsList, usePostModal } from '../../../hooks/posts';
import { PostCard } from '../../../components/posts/customer/PostCard';
import { PostModal } from '../../../components/posts/customer/PostModal';
import { PostsList } from '../../../components/posts/customer/PostsList';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { EmptyState } from '../../../components/common/EmptyState';
import { postService } from '../../../services/post.service';
import { PostStatus } from '../../../types/post';

export const PostsPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [singlePost, setSinglePost] = useState<any>(null);
  const [loadingSingle, setLoadingSingle] = useState(false);

  // Nếu có slug, load post đó và hiển thị modal
  React.useEffect(() => {
    if (slug) {
      loadSinglePost();
    }
  }, [slug]);

  const loadSinglePost = async () => {
    if (!slug) return;

    setLoadingSingle(true);
    try {
      const post = await postService.getPostBySlug(slug);
      setSinglePost(post);
      openModal(post);
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoadingSingle(false);
    }
  };

  const { posts, loading, hasMore, loadMore } = usePostsList({
    status: PostStatus.PUBLISHED,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  const { selectedPost, isOpen, openModal, closeModal } = usePostModal();

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        title="Chưa có bài viết nào"
        description="Hiện tại chưa có bài viết nào được đăng tải"
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Khám phá câu chuyện từ nghệ nhân
      </h1>

      <PostsList
        posts={posts}
        onPostClick={openModal}
        hasMore={hasMore}
        onLoadMore={loadMore}
        loading={loading}
      />

      <PostModal
        post={selectedPost || singlePost}
        isOpen={isOpen || (!!singlePost && !!slug)}
        onClose={() => {
          closeModal();
          setSinglePost(null);
          // Navigate back nếu cần
          if (slug) {
            window.history.pushState({}, '', '/posts');
          }
        }}
      />
    </div>
  );
};
