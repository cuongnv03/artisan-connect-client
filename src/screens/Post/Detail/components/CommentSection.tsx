import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Avatar } from '../../../../components/common/Avatar';
import { Button } from '../../../../components/form/Button';
import { Loader } from '../../../../components/feedback/Loader';
import { Alert } from '../../../../components/feedback/Alert';
import { formatRelativeTime } from '../../../../helpers/formatters';
import { CommentService } from '../../../../services/comment.service';
import { Comment } from '../../../../types/comment.types';
import {
  HeartIcon as HeartOutline,
  ChatBubbleLeftIcon,
  TrashIcon,
  PencilIcon,
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

  // Fetch comments
  const {
    data: comments,
    isLoading,
    isError,
    error,
  } = useQuery<Comment[]>(['comments', postId], () =>
    CommentService.getComments(postId),
  );

  // Create comment mutation
  const createMutation = useMutation(
    (data: { content: string; parentId?: string }) =>
      CommentService.createComment(postId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', postId]);
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
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', postId]);
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
      },
    },
  );

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    createMutation.mutate({
      content: comment,
      parentId: replyToId || undefined,
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
    // Focus on comment input
    document.getElementById('comment-input')?.focus();
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

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate(commentId);
    }
  };

  const handleLikeComment = (comment: Comment) => {
    likeMutation.mutate({
      commentId: comment.id,
      action: comment.liked ? 'unlike' : 'like',
    });
  };

  // Group comments by parent
  const groupComments = (comments: Comment[] = []) => {
    const parentComments = comments.filter((c) => !c.parentId);
    const childComments = comments.filter((c) => c.parentId);

    // Map of parent ID to children
    const childrenMap = childComments.reduce((acc, comment) => {
      if (!acc[comment.parentId!]) {
        acc[comment.parentId!] = [];
      }
      acc[comment.parentId!].push(comment);
      return acc;
    }, {} as Record<string, Comment[]>);

    return { parentComments, childrenMap };
  };

  // Render a single comment
  const renderComment = (comment: Comment, isReply = false) => {
    const { childrenMap } = groupComments(comments);
    const replies = childrenMap[comment.id] || [];
    const isEditing = editCommentId === comment.id;
    const isOwnComment = state.user?.id === comment.user.id;

    return (
      <div key={comment.id} className={`${isReply ? 'ml-12 mt-4' : 'mt-6'}`}>
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
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
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
                  className={`flex items-center text-xs ${
                    comment.liked
                      ? 'text-accent'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {comment.liked ? (
                    <HeartSolid className="h-4 w-4 mr-1" />
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
                      onClick={() => handleDeleteComment(comment.id)}
                      className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Replies */}
            {replies.length > 0 && (
              <div className="mt-3 space-y-4">
                {replies.map((reply) => renderComment(reply, true))}
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

  const { parentComments, childrenMap } = groupComments(comments);
  const totalComments =
    (comments?.length || 0) +
    Object.values(childrenMap).reduce(
      (acc, replies) => acc + replies.length,
      0,
    );

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Comments ({totalComments})
      </h3>

      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex items-start">
          <Avatar
            src={state.user?.avatarUrl}
            firstName={state.user?.firstName}
            lastName={state.user?.lastName}
            size="sm"
          />
          <div className="ml-3 flex-1">
            {replyToId && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <span>Replying to @{replyToUsername}</span>
                <button
                  onClick={handleCancelReply}
                  className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
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
                {replyToId ? 'Reply' : 'Comment'}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {parentComments?.length > 0 ? (
          parentComments.map((comment) => renderComment(comment))
        ) : (
          <p className="text-gray-500 text-center py-4">
            Be the first to comment on this post!
          </p>
        )}
      </div>
    </div>
  );
};
