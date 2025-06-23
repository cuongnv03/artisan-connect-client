import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePostsList, usePostModal } from '../../hooks/posts';
import { PostsList } from '../../components/posts/customer/PostsList';
import { PostModal } from '../../components/posts/customer/PostModal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { postService } from '../../services/post.service';
import { PostStatus } from '../../types/post';

export const PostsPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [singlePost, setSinglePost] = useState<any>(null);
  const [loadingSingle, setLoadingSingle] = useState(false);
  const { selectedPost, isOpen, openModal, closeModal } = usePostModal();

  // Chỉ load single post nếu có slug, không load danh sách
  const shouldLoadList = !slug;

  const { posts, loading, hasMore, loadMore } = usePostsList(
    shouldLoadList
      ? {
          status: PostStatus.PUBLISHED,
          sortBy: 'publishedAt',
          sortOrder: 'desc',
        }
      : { page: 1, limit: 0 },
  ); // Load empty nếu có slug

  // Load single post nếu có slug
  useEffect(() => {
    if (slug) {
      loadSinglePost();
    } else {
      setSinglePost(null);
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

  const handleCloseModal = () => {
    closeModal();
    setSinglePost(null);
    // Navigate back nếu cần
    if (slug) {
      window.history.pushState({}, '', '/posts');
    }
  };

  // Nếu đang load single post
  if (slug && loadingSingle) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Nếu có slug nhưng không có singlePost, chỉ hiển thị modal
  if (slug) {
    return (
      <PostModal
        post={singlePost}
        isOpen={isOpen || !!singlePost}
        onClose={handleCloseModal}
      />
    );
  }

  // Danh sách posts bình thường
  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (posts.length === 0 && !loading) {
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
        post={selectedPost}
        isOpen={isOpen && !slug} // Chỉ hiển thị nếu không có slug
        onClose={closeModal}
      />
    </div>
  );
};
