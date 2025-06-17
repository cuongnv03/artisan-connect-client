import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../../contexts/AuthContext';
import { Comment } from '../../../types/social';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { useForm } from '../../../hooks/common/useForm';

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string, content: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  depth?: number;
}

interface ReplyFormData {
  content: string;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onLikeComment,
  depth = 0,
}) => {
  const { state: authState } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [isLiking, setIsLiking] = useState(false);

  const {
    values: replyValues,
    handleChange: handleReplyChange,
    handleSubmit: onReplySubmit,
    resetForm: resetReplyForm,
    isSubmitting: isReplySubmitting,
  } = useForm<ReplyFormData>({
    initialValues: { content: '' },
    onSubmit: async (values) => {
      await onReply(comment.id, values.content);
      resetReplyForm();
      setShowReplyForm(false);
    },
  });

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      await onLikeComment(comment.id);
    } catch (error) {
      console.error('Error liking comment:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const maxDepth = 3;
  const canReply = depth < maxDepth && authState.isAuthenticated;

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className="flex space-x-3">
        <Avatar
          src={comment.user.avatarUrl}
          alt={`${comment.user.firstName} ${comment.user.lastName}`}
          size={depth > 0 ? 'sm' : 'md'}
        />
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900">
                {comment.user.firstName} {comment.user.lastName}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
                {comment.isEdited && (
                  <span className="ml-1 text-gray-400">(đã chỉnh sửa)</span>
                )}
              </span>
            </div>
            <p className="text-gray-700">{comment.content}</p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center space-x-4 mt-2 text-sm">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 transition-colors ${
                isLiking ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                comment.isLiked
                  ? 'text-red-500'
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              {comment.isLiked ? (
                <HeartIconSolid className="w-4 h-4" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
              <span>{comment.likeCount > 0 ? comment.likeCount : 'Thích'}</span>
            </button>

            {canReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                Trả lời
              </button>
            )}

            {comment.replyCount > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                {showReplies ? 'Ẩn' : 'Xem'} {comment.replyCount} phản hồi
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && authState.user && (
            <form onSubmit={onReplySubmit} className="mt-3">
              <div className="flex space-x-2">
                <Avatar
                  src={authState.user.avatarUrl}
                  alt={`${authState.user.firstName} ${authState.user.lastName}`}
                  size="sm"
                />
                <div className="flex-1">
                  <textarea
                    name="content"
                    rows={2}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                    placeholder="Viết phản hồi..."
                    value={replyValues.content}
                    onChange={handleReplyChange}
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReplyForm(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      loading={isReplySubmitting}
                      disabled={!replyValues.content.trim()}
                    >
                      Trả lời
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onLikeComment={onLikeComment}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
