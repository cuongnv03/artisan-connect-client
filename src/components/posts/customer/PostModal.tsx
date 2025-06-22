import React, { useEffect, useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Post } from '../../../types/post';
import { PostContent } from '../shared/PostContent';
import { PostMeta } from '../shared/PostMeta';
import { CommentSection } from './CommentSection';
import { ProductMentionCard } from '../shared/ProductMentionCard';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { postService } from '../../../services/post.service';
import { useToastContext } from '../../../contexts/ToastContext';

interface PostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PostModal: React.FC<PostModalProps> = ({
  post: initialPost,
  isOpen,
  onClose,
}) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const { error } = useToastContext();

  // Reset state khi modal đóng/mở
  useEffect(() => {
    if (!isOpen) {
      setPost(null);
      setLoading(false);
      return;
    }

    if (initialPost) {
      console.log('Modal opened with post:', {
        id: initialPost.id,
        title: initialPost.title,
        isLiked: initialPost.isLiked,
        likeCount: initialPost.likeCount,
      });

      // Set initial post first
      setPost(initialPost);

      // Then load full detail
      loadFullPostDetail();
    }
  }, [isOpen, initialPost?.id]);

  const loadFullPostDetail = async () => {
    if (!initialPost?.id) return;

    setLoading(true);
    try {
      console.log('Loading full post detail for:', initialPost.id);

      // Gọi API để get full detail và increment view
      const fullPost = await postService.getPost(initialPost.id);

      console.log('Full post loaded:', {
        id: fullPost.id,
        isLiked: fullPost.isLiked,
        likeCount: fullPost.likeCount,
        content: fullPost.content,
      });

      setPost(fullPost);
    } catch (err: any) {
      error('Không thể tải chi tiết bài viết');
      console.error('Error loading full post:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show nothing if modal closed
  if (!isOpen) return null;

  // Show initial post while loading full detail
  const displayPost = post || initialPost;
  if (!displayPost) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      showCloseButton={true}
      title=""
      closeOnOverlayClick={true}
      closeOnEscape={true}
    >
      <div className="max-h-[85vh] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-4 bg-blue-50 rounded-lg mb-4">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-sm text-blue-700">
              Đang tải chi tiết...
            </span>
          </div>
        )}

        {/* Cover Image */}
        {displayPost.coverImage && (
          <div className="mb-6">
            <img
              src={displayPost.coverImage}
              alt={displayPost.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Thumbnail nếu không có cover */}
        {!displayPost.coverImage && displayPost.thumbnailUrl && (
          <div className="mb-6">
            <img
              src={displayPost.thumbnailUrl}
              alt={displayPost.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Post Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {displayPost.title}
          </h1>

          {/* Post Meta - không có callback */}
          <PostMeta post={displayPost} showActions={true} />
        </div>

        {/* Post Content - format mới */}
        <div className="mb-6">
          <PostContent content={displayPost.content} />

          {/* Fallback cho contentText nếu content rỗng */}
          {(!displayPost.content ||
            (Array.isArray(displayPost.content) &&
              displayPost.content.length === 0) ||
            (displayPost.content.blocks &&
              displayPost.content.blocks.length === 0)) &&
            displayPost.contentText && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {displayPost.contentText}
                </p>
              </div>
            )}
        </div>

        {/* Product Mentions */}
        {displayPost.productMentions &&
          displayPost.productMentions.length > 0 && (
            <div className="mb-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">
                Sản phẩm được đề cập
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayPost.productMentions.map((mention) => (
                  <ProductMentionCard key={mention.id} mention={mention} />
                ))}
              </div>
            </div>
          )}

        {/* Comment Section */}
        <div className="pt-6 border-t border-gray-200">
          <CommentSection postId={displayPost.id} />
        </div>
      </div>
    </Modal>
  );
};
