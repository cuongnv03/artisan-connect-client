import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToastContext } from '../../../contexts/ToastContext';
import { socialService } from '../../../services/social.service';
import { Comment } from '../../../types/social';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { CommentItem } from './CommentItem';
import { useForm } from '../../../hooks/common/useForm';

interface CommentSectionProps {
  postId: string;
}

interface CommentFormData {
  content: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { state: authState } = useAuth();
  const { success, error } = useToastContext();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  // Refs để track loading state và prevent duplicate calls
  const isLoadingRef = useRef(false);
  const currentPostIdRef = useRef<string | null>(null);
  const hasLoadedRef = useRef(false);

  const loadComments = useCallback(async () => {
    if (!postId || isLoadingRef.current) return;

    // Prevent duplicate loading cho cùng một post
    if (currentPostIdRef.current === postId && hasLoadedRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);
    currentPostIdRef.current = postId;

    try {
      console.log('Loading comments for post:', postId);

      const result = await socialService.getPostComments(postId, {
        parentId: null,
        page: 1,
        limit: 50,
        includeReplies: false,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      // Load replies for comments that have replies
      const commentsWithReplies = await Promise.all(
        result.data.map(async (comment) => {
          if (comment.replyCount > 0) {
            try {
              const repliesResult = await socialService.getCommentReplies(
                comment.id,
                { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'asc' },
              );
              return { ...comment, replies: repliesResult.data || [] };
            } catch (err) {
              console.error(
                'Error loading replies for comment:',
                comment.id,
                err,
              );
              return { ...comment, replies: [] };
            }
          }
          return { ...comment, replies: [] };
        }),
      );

      setComments(commentsWithReplies);
      hasLoadedRef.current = true;
      console.log('Comments loaded successfully:', commentsWithReplies.length);
    } catch (err: any) {
      console.error('Error loading comments:', err);
      error('Không thể tải bình luận');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [postId, error]);

  // Effect để load comments - chỉ chạy khi postId thay đổi
  useEffect(() => {
    console.log('CommentSection effect triggered:', {
      postId,
      hasLoaded: hasLoadedRef.current,
    });

    if (postId) {
      // Reset khi postId thay đổi
      if (currentPostIdRef.current !== postId) {
        hasLoadedRef.current = false;
        currentPostIdRef.current = postId;
        setComments([]); // Clear old comments
      }

      loadComments();
    }

    // Cleanup
    return () => {
      console.log('CommentSection cleanup for post:', postId);
    };
  }, [postId]); // Chỉ depend on postId

  const handleCommentSubmit = async (values: CommentFormData) => {
    try {
      await socialService.createComment({
        postId,
        content: values.content,
      });
      resetForm();

      // Force reload comments after successful comment
      hasLoadedRef.current = false;
      await loadComments();
      success('Đã thêm bình luận');
    } catch (err: any) {
      error('Không thể thêm bình luận');
    }
  };

  const handleReplyComment = async (parentId: string, content: string) => {
    try {
      await socialService.createComment({
        postId,
        parentId,
        content,
      });

      // Force reload comments after successful reply
      hasLoadedRef.current = false;
      await loadComments();
      success('Đã thêm phản hồi');
    } catch (err) {
      error('Không thể thêm phản hồi');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const result = await socialService.toggleLike({ commentId });

      setComments((prevComments) =>
        updateCommentInTree(prevComments, commentId, (comment) => ({
          ...comment,
          isLiked: result.liked,
          likeCount: result.liked
            ? comment.likeCount + 1
            : comment.likeCount - 1,
        })),
      );
    } catch (err) {
      error('Không thể thích bình luận');
    }
  };

  const updateCommentInTree = (
    comments: Comment[],
    commentId: string,
    updateFn: (comment: Comment) => Comment,
  ): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return updateFn(comment);
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, commentId, updateFn),
        };
      }
      return comment;
    });
  };

  const { values, handleChange, handleSubmit, resetForm, isSubmitting } =
    useForm<CommentFormData>({
      initialValues: { content: '' },
      onSubmit: handleCommentSubmit,
    });

  const topLevelComments = comments.filter((comment) => !comment.parentId);

  return (
    <div data-comment-section>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Bình luận ({topLevelComments.length})
      </h3>

      {/* Add Comment Form */}
      {authState.isAuthenticated && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex space-x-3">
            <Avatar
              src={authState.user?.avatarUrl}
              alt={`${authState.user?.firstName} ${authState.user?.lastName}`}
              size="md"
            />
            <div className="flex-1">
              <textarea
                name="content"
                rows={3}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                placeholder="Viết bình luận của bạn..."
                value={values.content}
                onChange={handleChange}
              />
              <div className="mt-2 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  loading={isSubmitting}
                  disabled={!values.content.trim()}
                >
                  Gửi bình luận
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <div className="text-center py-4">
          <LoadingSpinner />
        </div>
      ) : topLevelComments.length > 0 ? (
        <div className="space-y-4">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReplyComment}
              onLikeComment={handleLikeComment}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </p>
      )}
    </div>
  );
};
