import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
} from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { postService } from '../../services/post.service';
import { socialService } from '../../services/social.service';
import { Post, BlockType } from '../../types/post';
import { Comment } from '../../types/social';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Dropdown } from '../../components/ui/Dropdown';
import { ConfirmModal } from '../../components/ui/Modal';
import { ImageGallery } from '../../components/common/ImageGallery';
import { ProductMentionCard } from '../../components/common/ProductMentionCard';
import { useForm } from '../../hooks/useForm';

interface CommentFormData {
  content: string;
}

interface ReplyFormData {
  content: string;
}

// Helper function để check UUID
const isUUID = (str: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const CommentItem: React.FC<{
  comment: Comment;
  onReply: (commentId: string, content: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  depth?: number;
}> = ({ comment, onReply, onLikeComment, depth = 0 }) => {
  const { state: authState } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true); // Show replies by default if they exist
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

export const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { success, error } = useToastContext();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  useEffect(() => {
    if (post?.id) {
      loadComments();
    }
  }, [post?.id]);

  const loadPost = async () => {
    if (!postId) return;

    try {
      let postData: Post;

      // Determine if postId is UUID or slug
      if (isUUID(postId)) {
        postData = await postService.getPost(postId);
      } else {
        // It's a slug
        postData = await postService.getPostBySlug(postId);
      }

      setPost(postData);
      setIsLiked(Boolean(postData.isLiked));
      setIsSaved(Boolean(postData.isSaved));
      setLikeCount(postData.likeCount);
    } catch (err: any) {
      console.error('Error loading post:', err);
      error('Không thể tải bài viết');
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!post?.id) return;

    setCommentsLoading(true);
    try {
      // Get top-level comments with proper query parameters
      const commentsResult = await socialService.getPostComments(post.id, {
        parentId: null, // Explicitly get top-level comments
        page: 1,
        limit: 50,
        includeReplies: false, // Don't include nested replies in main call
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      // Load replies for each top-level comment that has replies
      const commentsWithReplies = await Promise.all(
        commentsResult.data.map(async (comment) => {
          if (comment.replyCount > 0) {
            try {
              const repliesResult = await socialService.getCommentReplies(
                comment.id,
                {
                  page: 1,
                  limit: 10,
                  sortBy: 'createdAt',
                  sortOrder: 'asc', // Show oldest replies first
                },
              );

              return {
                ...comment,
                replies: repliesResult.data || [],
              };
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
    } catch (err: any) {
      console.error('Error loading comments:', err);
      error('Không thể tải bình luận');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post?.id || isLiking) return;

    try {
      setIsLiking(true);

      // Call API first to get actual result
      const result = await socialService.toggleLike({ postId: post.id });

      // Update state based on server response
      setIsLiked(result.liked);
      setLikeCount((prev) => (result.liked ? prev + 1 : prev - 1));
    } catch (err: any) {
      error('Không thể thích bài viết');
      console.error('Error toggling like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (!post?.id) return;

    try {
      const newIsSaved = !isSaved;
      setIsSaved(newIsSaved);

      await socialService.toggleSavePost(post.id);
      setIsSaved(!isSaved);
      success(newIsSaved ? 'Đã lưu bài viết' : 'Đã bỏ lưu bài viết');
    } catch (err: any) {
      setIsSaved(!isSaved);
      error('Không thể lưu bài viết');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/posts/${post?.slug || postId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.summary,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        success('Đã sao chép liên kết');
      } catch (err) {
        error('Không thể sao chép liên kết');
      }
    }
  };

  const handleDeletePost = async () => {
    if (!post?.id) return;

    try {
      await postService.deletePost(post.id);
      success('Đã xóa bài viết');
      navigate('/posts/my-posts');
    } catch (err: any) {
      error('Không thể xóa bài viết');
    }
  };

  const handleCommentSubmit = async (values: CommentFormData) => {
    if (!post?.id) return;

    try {
      await socialService.createComment({
        postId: post.id,
        content: values.content,
      });
      resetForm();
      await loadComments();
      success('Đã thêm bình luận');
    } catch (err: any) {
      error('Không thể thêm bình luận');
    }
  };

  const handleReplyComment = async (parentId: string, content: string) => {
    if (!post?.id) return;

    try {
      await socialService.createComment({
        postId: post.id,
        parentId,
        content,
      });
      await loadComments();
      success('Đã thêm phản hồi');
    } catch (err) {
      error('Không thể thêm phản hồi');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const result = await socialService.toggleLike({ commentId });

      // Update comment in state
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

  // Helper function để update comment trong tree structure
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

  const {
    values: commentValues,
    handleChange: handleCommentChange,
    handleSubmit: onCommentSubmit,
    resetForm,
    isSubmitting: isCommentSubmitting,
  } = useForm<CommentFormData>({
    initialValues: { content: '' },
    onSubmit: handleCommentSubmit,
  });

  const getPostTypeDisplay = (type: string) => {
    const types = {
      STORY: 'Câu chuyện',
      TUTORIAL: 'Hướng dẫn',
      PRODUCT_SHOWCASE: 'Sản phẩm',
      BEHIND_THE_SCENES: 'Hậu trường',
      EVENT: 'Sự kiện',
      GENERAL: 'Chung',
    };
    return types[type as keyof typeof types] || type;
  };

  const getPostTypeColor = (type: string) => {
    const colors = {
      STORY: 'primary',
      TUTORIAL: 'info',
      PRODUCT_SHOWCASE: 'success',
      BEHIND_THE_SCENES: 'warning',
      EVENT: 'danger',
      GENERAL: 'default',
    };
    return (colors[type as keyof typeof colors] as any) || 'default';
  };

  const renderContentBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={index} className="text-gray-700 mb-4 leading-relaxed">
            {block.data?.text || ''}
          </p>
        );

      case 'heading':
        return (
          <h2
            key={index}
            className="text-2xl font-semibold text-gray-900 mb-4 mt-8"
          >
            {block.data?.text || ''}
          </h2>
        );

      case 'quote':
        return (
          <blockquote
            key={index}
            className="border-l-4 border-primary bg-gray-50 p-4 rounded-r-lg mb-4 italic text-gray-700"
          >
            <p>{block.data?.text || ''}</p>
            {block.data?.author && (
              <cite className="block text-sm text-gray-500 mt-2">
                — {block.data.author}
              </cite>
            )}
          </blockquote>
        );

      case 'image':
        return (
          <div key={index} className="mb-6">
            <img
              src={block.data?.url}
              alt={block.data?.caption || ''}
              className="w-full rounded-lg"
            />
            {block.data?.caption && (
              <p className="text-sm text-gray-500 mt-2 text-center italic">
                {block.data.caption}
              </p>
            )}
          </div>
        );

      case 'list':
        return (
          <ul key={index} className="list-disc list-inside mb-4 space-y-1">
            {(block.data?.items || []).map(
              (item: string, itemIndex: number) => (
                <li key={itemIndex} className="text-gray-700">
                  {item}
                </li>
              ),
            )}
          </ul>
        );

      case 'gallery':
        return (
          <div key={index} className="mb-6">
            {block.data?.images && block.data.images.length > 0 && (
              <ImageGallery
                images={block.data.images.map((img: any) => img.url)}
              />
            )}
          </div>
        );

      case 'video':
        return (
          <div key={index} className="mb-6">
            <video
              src={block.data?.url}
              controls
              className="w-full rounded-lg"
            />
            {block.data?.caption && (
              <p className="text-sm text-gray-500 mt-2 text-center italic">
                {block.data.caption}
              </p>
            )}
          </div>
        );

      case 'divider':
        return <hr key={index} className="my-8 border-gray-300" />;

      case 'html':
        return (
          <div
            key={index}
            className="mb-4"
            dangerouslySetInnerHTML={{ __html: block.data?.html || '' }}
          />
        );

      case 'embed':
        return (
          <div key={index} className="mb-6">
            <div
              className="aspect-w-16 aspect-h-9"
              dangerouslySetInnerHTML={{ __html: block.data?.embed || '' }}
            />
          </div>
        );

      default:
        // Fallback for unknown block types
        return (
          <div key={index} className="mb-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600 text-sm">
              Loại nội dung không được hỗ trợ: {block.type}
            </p>
            {block.data?.text && (
              <p className="text-gray-700 mt-2">{block.data.text}</p>
            )}
          </div>
        );
    }
  };

  const isAuthor = post?.user?.id === authState.user?.id;

  const menuItems = [
    ...(isAuthor
      ? [
          {
            label: 'Chỉnh sửa',
            value: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            onClick: () => navigate(`/posts/${post?.id}/edit`),
          },
          {
            label: 'Xóa',
            value: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            onClick: () => setShowDeleteModal(true),
          },
        ]
      : []),
    {
      label: 'Báo cáo',
      value: 'report',
      onClick: () => {
        // TODO: Implement report functionality
        success('Đã gửi báo cáo');
      },
    },
  ];

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
        <Button onClick={() => navigate('/posts')}>
          Quay lại danh sách bài viết
        </Button>
      </div>
    );
  }

  // Filter top-level comments (no parent)
  const topLevelComments = comments.filter((comment) => !comment.parentId);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Post Header */}
      <Card className="p-8 mb-6">
        {/* Author info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link
              to={`/profile/${post.user?.id}`}
              className="flex items-center"
            >
              <Avatar
                src={post.user?.avatarUrl}
                alt={`${post.user?.firstName} ${post.user?.lastName}`}
                size="lg"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">
                  {post.user?.firstName} {post.user?.lastName}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                  <span className="mx-2">•</span>
                  <Badge variant={getPostTypeColor(post.type)} size="sm">
                    {getPostTypeDisplay(post.type)}
                  </Badge>
                </div>
              </div>
            </Link>
          </div>

          <Dropdown
            trigger={
              <Button variant="ghost" size="sm">
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </Button>
            }
            items={menuItems}
          />
        </div>

        {/* Post Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

        {/* Post Summary */}
        {post.summary && (
          <p className="text-lg text-gray-600 mb-6">{post.summary}</p>
        )}

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-6">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
          <div className="flex items-center">
            <EyeIcon className="w-4 h-4 mr-1" />
            <span>{post.viewCount} lượt xem</span>
          </div>
          <div className="flex items-center">
            <HeartIcon className="w-4 h-4 mr-1" />
            <span>{likeCount} lượt thích</span>
          </div>
          <div className="flex items-center">
            <ChatBubbleOvalLeftIcon className="w-4 h-4 mr-1" />
            <span>{post.commentCount} bình luận</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" size="sm">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Post Content */}
      <Card className="p-8 mb-6">
        <div className="prose max-w-none">
          {post.content && post.content.length > 0 ? (
            post.content.map((block, index) => renderContentBlock(block, index))
          ) : (
            <p className="text-gray-700">{post.summary}</p>
          )}
        </div>

        {/* Media Gallery */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="mt-8">
            <ImageGallery images={post.mediaUrls} />
          </div>
        )}
      </Card>

      {/* Product Mentions Section */}
      {post.productMentions && post.productMentions.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🏷️</span>
            Sản phẩm được đề cập trong bài viết
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {post.productMentions.map((mention) => (
              <ProductMentionCard key={mention.id} mention={mention} />
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
            >
              {isLiked ? (
                <HeartIconSolid className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6" />
              )}
              <span>{likeCount}</span>
            </button>

            <div className="flex items-center space-x-2 text-gray-500">
              <ChatBubbleOvalLeftIcon className="w-6 h-6" />
              <span>{topLevelComments.length}</span>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
            >
              <ShareIcon className="w-6 h-6" />
              <span>Chia sẻ</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            className="text-gray-500 hover:text-yellow-500 transition-colors"
          >
            {isSaved ? (
              <BookmarkIconSolid className="w-6 h-6 text-yellow-500" />
            ) : (
              <BookmarkIcon className="w-6 h-6" />
            )}
          </button>
        </div>
      </Card>

      {/* Comments Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Bình luận ({topLevelComments.length})
        </h3>

        {/* Add Comment */}
        <form onSubmit={onCommentSubmit} className="mb-6">
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
                value={commentValues.content}
                onChange={handleCommentChange}
              />
              <div className="mt-2 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  loading={isCommentSubmitting}
                  disabled={!commentValues.content.trim()}
                >
                  Gửi bình luận
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments List */}
        {commentsLoading ? (
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
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePost}
        title="Xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
        confirmText="Xóa bài viết"
        type="danger"
      />
    </div>
  );
};
