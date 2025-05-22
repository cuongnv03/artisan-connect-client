import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Avatar } from '../../../../components/common/Avatar';
import { Button } from '../../../../components/form/Button';
import { Loader } from '../../../../components/feedback/Loader';
import { Alert } from '../../../../components/feedback/Alert';
import { Modal } from '../../../../components/feedback/Modal';
import { formatRelativeTime } from '../../../../helpers/formatters';
import { CommentService } from '../../../../services/comment.service';
import { Comment } from '../../../../types/comment.types';
import {
  HeartIcon as HeartOutline,
  ChatBubbleLeftIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../../../context/AuthContext';

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { state } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyToUsername, setReplyToUsername] = useState<string>('');
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [loadedReplies, setLoadedReplies] = useState<Record<string, boolean>>(
    {},
  );
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch comments
  const {
    data: commentsResponse,
    isLoading,
    isError,
    error,
  } = useQuery(['comments', postId], () => CommentService.getComments(postId));

  // Extract comments array from response or use empty array as fallback
  const comments = commentsResponse?.data || [];

  // Create comment mutation
  const createMutation = useMutation(
    (data: { content: string; parentId?: string; postId: string }) =>
      CommentService.createComment(postId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', postId]);
        // Nếu đang trả lời, cũng invalidate replies query
        if (replyToId) {
          queryClient.invalidateQueries(['comment-replies', replyToId]);
        }
        setComment('');
        setReplyToId(null);
        setReplyToUsername('');
      },
    },
  );

  // Edit comment mutation
  const editMutation = useMutation(
    (data: { commentId: string; content: string }) =>
      CommentService.updateComment(data.commentId, { content: data.content }),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['comments', postId]);
        // Kiểm tra nếu đang edit reply, invalidate cả replies query
        const editedComment = comments.find(
          (c) => c.id === variables.commentId,
        );
        if (editedComment?.parentId) {
          queryClient.invalidateQueries([
            'comment-replies',
            editedComment.parentId,
          ]);
        }
        setEditCommentId(null);
        setEditCommentText('');
      },
    },
  );

  // Delete comment mutation
  const deleteMutation = useMutation(
    (commentId: string) => CommentService.deleteComment(commentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', postId]);
        // Invalidate tất cả replies queries
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === 'comment-replies',
        });
        setCommentToDelete(null);
      },
    },
  );

  // Like comment mutation
  const likeMutation = useMutation(
    (data: { commentId: string; action: 'like' | 'unlike' }) =>
      data.action === 'like'
        ? CommentService.likeComment(data.commentId)
        : CommentService.unlikeComment(data.commentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', postId]);
        // Invalidate tất cả replies queries
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === 'comment-replies',
        });
      },
    },
  );

  // Focus on reply input when replyToId changes
  useEffect(() => {
    if (replyToId && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replyToId]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    createMutation.mutate({
      content: comment,
      parentId: replyToId || undefined,
      postId,
    });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCommentId || !editCommentText.trim()) return;

    editMutation.mutate({
      commentId: editCommentId,
      content: editCommentText,
    });
  };

  const handleStartReply = (commentId: string, username: string) => {
    setReplyToId(commentId);
    setReplyToUsername(username);

    // Đảm bảo replies đã được tải
    loadRepliesIfNeeded(commentId);
  };

  const handleCancelReply = () => {
    setReplyToId(null);
    setReplyToUsername('');
  };

  const handleStartEdit = (comment: Comment) => {
    setEditCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  const handleCancelEdit = () => {
    setEditCommentId(null);
    setEditCommentText('');
  };

  const handleConfirmDelete = () => {
    if (commentToDelete) {
      deleteMutation.mutate(commentToDelete);
    }
  };

  const handleLikeComment = (comment: Comment) => {
    likeMutation.mutate({
      commentId: comment.id,
      action: comment.liked ? 'unlike' : 'like',
    });
  };

  const loadRepliesIfNeeded = (commentId: string) => {
    // Đánh dấu là đã tải để hiển thị replies
    setLoadedReplies((prev) => ({
      ...prev,
      [commentId]: true,
    }));
  };

  // Render reply form for a specific comment
  const renderReplyForm = (parentId: string, username: string) => {
    if (replyToId !== parentId) return null;

    return (
      <div className="mt-3 ml-12">
        <div className="flex items-start">
          <Avatar
            src={state.user?.avatarUrl}
            firstName={state.user?.firstName}
            lastName={state.user?.lastName}
            size="xs"
          />
          <div className="ml-2 flex-1">
            <div className="flex items-center text-xs text-gray-600 mb-1">
              <span>Replying to @{username}</span>
              <button
                onClick={handleCancelReply}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitComment}>
              <textarea
                ref={replyInputRef}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent text-sm"
                rows={2}
                placeholder="Write a reply..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
              <div className="flex justify-end mt-1">
                <Button
                  variant="primary"
                  size="xs"
                  type="submit"
                  isLoading={createMutation.isLoading}
                  disabled={!comment.trim()}
                >
                  Reply
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Render replies for a comment
  const CommentReplies = ({ commentId }: { commentId: string }) => {
    // Chỉ query khi cần hiển thị
    const {
      data: repliesResponse,
      isLoading: isLoadingReplies,
      isError: isErrorReplies,
    } = useQuery(
      ['comment-replies', commentId],
      () => CommentService.getCommentReplies(commentId),
      {
        enabled: loadedReplies[commentId], // Chỉ query khi có flag
      },
    );

    const replies = repliesResponse?.data || [];

    if (isLoadingReplies) {
      return (
        <div className="ml-12 mt-2 text-sm text-gray-500">
          Loading replies...
        </div>
      );
    }

    if (isErrorReplies) {
      return (
        <div className="ml-12 mt-2 text-sm text-red-500">
          Failed to load replies
        </div>
      );
    }

    if (replies.length === 0) {
      return (
        <div className="ml-12 mt-2 text-sm text-gray-500">No replies yet</div>
      );
    }

    return (
      <div className="space-y-3 mt-2">
        {replies.map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  // Render a single comment
  const renderComment = (comment: Comment, isReply = false) => {
    const hasReplies = comment.replyCount > 0;
    const repliesLoaded = loadedReplies[comment.id] || false;
    const isEditing = editCommentId === comment.id;
    const isOwnComment = state.user?.id === comment.user.id;

    return (
      <div
        key={comment.id}
        className={`${isReply ? 'ml-12 mt-3' : 'mt-5'} animate-fade-in`}
      >
        <div className="flex">
          <Avatar
            src={comment.user.avatarUrl}
            firstName={comment.user.firstName}
            lastName={comment.user.lastName}
            size="sm"
          />
          <div className="ml-3 flex-1">
            <div
              className={`bg-gray-50 rounded-lg px-4 py-3 ${
                isReply ? 'rounded-tl-none' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-gray-900">
                  {comment.user.username}
                </span>
                <span className="text-xs text-gray-500">
                  {formatRelativeTime(comment.createdAt)}
                  {comment.isEdited && (
                    <span className="ml-1 text-xs text-gray-400">(edited)</span>
                  )}
                </span>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmitEdit} className="mt-2">
                  <textarea
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent"
                    rows={3}
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    required
                  ></textarea>
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="xs"
                      type="submit"
                      isLoading={editMutation.isLoading}
                    >
                      Save
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-gray-700 mt-1">{comment.content}</p>
              )}
            </div>

            {/* Comment actions */}
            {!isEditing && (
              <div className="flex items-center mt-2 space-x-4">
                <button
                  onClick={() => handleLikeComment(comment)}
                  className={`flex items-center text-xs transition-colors ${
                    comment.liked
                      ? 'text-accent'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {comment.liked ? (
                    <HeartSolid className="h-4 w-4 mr-1 animate-pulse" />
                  ) : (
                    <HeartOutline className="h-4 w-4 mr-1" />
                  )}
                  <span>
                    {comment.likeCount > 0 && comment.likeCount}{' '}
                    {comment.likeCount === 1 ? 'Like' : 'Likes'}
                  </span>
                </button>

                <button
                  onClick={() =>
                    handleStartReply(comment.id, comment.user.username)
                  }
                  className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                  <span>Reply</span>
                </button>

                {isOwnComment && (
                  <>
                    <button
                      onClick={() => handleStartEdit(comment)}
                      className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setCommentToDelete(comment.id)}
                      className="flex items-center text-xs text-gray-500 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Reply form for this comment */}
            {renderReplyForm(comment.id, comment.user.username)}

            {/* Replies */}
            {hasReplies && (
              <div className="mt-2">
                {!repliesLoaded ? (
                  <button
                    onClick={() => loadRepliesIfNeeded(comment.id)}
                    className="flex items-center text-xs text-accent hover:text-accent-dark ml-2"
                  >
                    <ChevronDownIcon className="h-4 w-4 mr-1" />
                    <span>
                      Show {comment.replyCount}{' '}
                      {comment.replyCount === 1 ? 'reply' : 'replies'}
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        setLoadedReplies((prev) => ({
                          ...prev,
                          [comment.id]: false,
                        }))
                      }
                      className="flex items-center text-xs text-accent hover:text-accent-dark ml-2 mb-2"
                    >
                      <ChevronUpIcon className="h-4 w-4 mr-1" />
                      <span>Hide replies</span>
                    </button>
                    <CommentReplies commentId={comment.id} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <Loader size="md" text="Loading comments..." />;
  }

  if (isError) {
    return (
      <Alert type="error" variant="subtle">
        {(error as Error).message || 'Failed to load comments'}
      </Alert>
    );
  }

  const totalComments = Array.isArray(comments) ? comments.length : 0;

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Comments ({totalComments})
      </h3>

      {/* Main comment form - only show when not replying */}
      {!replyToId && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex items-start">
            <Avatar
              src={state.user?.avatarUrl}
              firstName={state.user?.firstName}
              lastName={state.user?.lastName}
              size="sm"
            />
            <div className="ml-3 flex-1">
              <textarea
                id="comment-input"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent"
                rows={3}
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
              <div className="flex justify-end mt-2">
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={createMutation.isLoading}
                  disabled={!comment.trim()}
                >
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments list */}
      <div className="space-y-1">
        {comments?.length > 0 ? (
          comments.map((comment) => renderComment(comment))
        ) : (
          <p className="text-gray-500 text-center py-4">
            Be the first to comment on this post!
          </p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        title="Delete Comment"
      >
        <div className="p-4">
          <p>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setCommentToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={deleteMutation.isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
