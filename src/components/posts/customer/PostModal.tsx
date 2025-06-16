import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Post } from '../../../types/post';
import { PostContent } from '../shared/PostContent';
import { PostMeta } from '../shared/PostMeta';
import { CommentSection } from '../shared/CommentSection';
import { ProductMentionCard } from '../shared/ProductMentionCard';

interface PostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PostModal: React.FC<PostModalProps> = ({
  post,
  isOpen,
  onClose,
}) => {
  if (!post) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      showCloseButton={true}
      title={post.title}
    >
      <div className="max-h-[80vh] overflow-y-auto">
        {/* Post Meta */}
        <PostMeta post={post} showActions={true} />

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-6">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Post Content (không hiển thị summary) */}
        <PostContent content={post.content} />

        {/* Product Mentions */}
        {post.productMentions && post.productMentions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Sản phẩm được đề cập</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {post.productMentions.map((mention) => (
                <ProductMentionCard key={mention.id} mention={mention} />
              ))}
            </div>
          </div>
        )}

        {/* COMMENT SECTION */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </Modal>
  );
};
