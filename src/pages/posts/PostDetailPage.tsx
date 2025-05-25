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
import { useForm } from '../../hooks/useForm';

interface CommentFormData {
  content: string;
}

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

  useEffect(() => {
    if (postId) {
      loadPost();
      loadComments();
    }
  }, [postId]);

  const loadPost = async () => {
    if (!postId) return;

    try {
      const postData = await postService.getPost(postId);
      setPost(postData);
      setIsLiked(postData.isLiked || false);
      setIsSaved(postData.isSaved || false);
      setLikeCount(postData.likeCount);
    } catch (err) {
      error('Không thể tải bài viết');
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!postId) return;

    setCommentsLoading(true);
    try {
      const commentsResult = await socialService.getPostComments(postId);
      setComments(commentsResult.data);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!postId) return;

    try {
      await socialService.toggleLike({ postId });
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (err) {
      error('Không thể thích bài viết');
    }
  };

  const handleSave = async () => {
    if (!postId) return;

    try {
      await socialService.toggleSavePost(postId);
      setIsSaved(!isSaved);
      success(isSaved ? 'Đã bỏ lưu bài viết' : 'Đã lưu bài viết');
    } catch (err) {
      error('Không thể lưu bài viết');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.summary,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        success('Đã sao chép liên kết');
      } catch (err) {
        error('Không thể sao chép liên kết');
      }
    }
  };

  const handleDeletePost = async () => {
    if (!postId) return;

    try {
      await postService.deletePost(postId);
      success('Đã xóa bài viết');
      navigate('/posts/my-posts');
    } catch (err) {
      error('Không thể xóa bài viết');
    }
  };

  const handleCommentSubmit = async (values: CommentFormData) => {
    if (!postId) return;

    try {
      await socialService.createComment({
        postId,
        content: values.content,
      });
      resetForm();
      await loadComments();
      success('Đã thêm bình luận');
    } catch (err) {
      error('Không thể thêm bình luận');
    }
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
      case BlockType.PARAGRAPH:
        return (
          <p key={index} className="text-gray-700 mb-4 leading-relaxed">
            {block.content}
          </p>
        );

      case BlockType.HEADING:
        return (
          <h2
            key={index}
            className="text-2xl font-semibold text-gray-900 mb-4 mt-8"
          >
            {block.content}
          </h2>
        );

      case BlockType.QUOTE:
        return (
          <blockquote
            key={index}
            className="border-l-4 border-primary bg-gray-50 p-4 rounded-r-lg mb-4 italic text-gray-700"
          >
            {block.content}
          </blockquote>
        );

      case BlockType.IMAGE:
        return (
          <div key={index} className="mb-6">
            <img
              src={block.metadata?.url}
              alt={block.metadata?.caption || ''}
              className="w-full rounded-lg"
            />
            {block.metadata?.caption && (
              <p className="text-sm text-gray-500 mt-2 text-center italic">
                {block.metadata.caption}
              </p>
            )}
          </div>
        );

      case BlockType.LIST:
        return (
          <ul key={index} className="list-disc list-inside mb-4 space-y-1">
            {((block.metadata?.items as string[]) || []).map(
              (item: string, itemIndex: number) => (
                <li key={itemIndex} className="text-gray-700">
                  {item}
                </li>
              ),
            )}
          </ul>
        );

      case BlockType.DIVIDER:
        return <hr key={index} className="my-8 border-gray-300" />;

      default:
        return null;
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
            onClick: () => navigate(`/posts/${postId}/edit`),
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
              <span>{comments.length}</span>
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
          Bình luận ({comments.length})
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
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar
                  src={comment.user.avatarUrl}
                  alt={`${comment.user.firstName} ${comment.user.lastName}`}
                  size="md"
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
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>

                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <button className="text-gray-500 hover:text-primary">
                      Thích ({comment.likeCount})
                    </button>
                    <button className="text-gray-500 hover:text-primary">
                      Trả lời
                    </button>
                  </div>
                </div>
              </div>
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
