import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { postService } from '../../services/post.service';
import { socialService } from '../../services/social.service';
import { Post } from '../../types/post';
import { Comment, WishlistItemType } from '../../types/social';

// Helper function để check UUID
const isUUID = (str: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const usePostDetail = () => {
  // Lấy tất cả possible params
  const params = useParams<{
    postId?: string;
    id?: string;
    slug?: string;
  }>();

  // Xác định postId từ các params khác nhau
  const postId = params.postId || params.id || params.slug;

  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { success, error } = useToastContext();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    console.log('usePostDetail params:', params);
    console.log('Resolved postId:', postId);

    if (postId && postId.trim() && postId !== 'undefined') {
      console.log('Loading post with ID:', postId);
      setLoading(true);
      loadPost();
    } else {
      console.log('No valid postId provided:', postId);
      setLoading(false);
    }
  }, [postId, params.postId, params.id, params.slug]);

  useEffect(() => {
    if (post?.id) {
      loadComments();
    }
  }, [post?.id]);

  const loadPost = async () => {
    if (!postId || !postId.trim() || postId === 'undefined') {
      console.log('Invalid postId for loading:', postId);
      setLoading(false);
      return;
    }

    try {
      console.log('Calling API for post:', postId, 'Is UUID:', isUUID(postId));

      let postData: Post;

      if (isUUID(postId)) {
        console.log('Fetching by ID');
        postData = await postService.getPost(postId);
      } else {
        console.log('Fetching by slug');
        postData = await postService.getPostBySlug(postId);
      }

      console.log('Post data received:', postData);

      setPost(postData);
      setIsLiked(Boolean(postData.isLiked));
      setIsSaved(Boolean(postData.isSaved));
      setLikeCount(postData.likeCount);
    } catch (err: any) {
      console.error('Error loading post:', err);
      error(err.message || 'Không thể tải bài viết');
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!post?.id) return;

    setCommentsLoading(true);
    try {
      const commentsResult = await socialService.getPostComments(post.id, {
        parentId: null,
        page: 1,
        limit: 50,
        includeReplies: false,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

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
                  sortOrder: 'asc',
                },
              );
              return { ...comment, replies: repliesResult.data || [] };
            } catch (err) {
              return { ...comment, replies: [] };
            }
          }
          return { ...comment, replies: [] };
        }),
      );

      setComments(commentsWithReplies);
    } catch (err: any) {
      error('Không thể tải bình luận');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post?.id) return;

    try {
      const result = await socialService.toggleLike({ postId: post.id });
      setIsLiked(result.liked);
      setLikeCount((prev) => (result.liked ? prev + 1 : prev - 1));
    } catch (err: any) {
      error('Không thể thích bài viết');
    }
  };

  const handleSave = async () => {
    if (!post?.id) return;

    try {
      const newIsSaved = !isSaved;
      setIsSaved(newIsSaved);
      await socialService.toggleWishlistItem({
        itemType: WishlistItemType.POST,
        postId: post.id,
      });
      success(newIsSaved ? 'Đã lưu bài viết' : 'Đã bỏ lưu bài viết');
    } catch (err: any) {
      setIsSaved(!isSaved);
      error('Không thể lưu bài viết');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/posts/manage/${
      post?.slug || postId
    }`;

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
      try {
        await navigator.clipboard.writeText(shareUrl);
        success('Đã sao chép liên kết');
      } catch (err) {
        error('Không thể sao chép liên kết');
      }
    }
  };

  const handleCommentSubmit = async (content: string) => {
    if (!post?.id) return;

    try {
      await socialService.createComment({
        postId: post.id,
        content,
      });
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

  const isAuthor = post?.user?.id === authState.user?.id;

  return {
    post,
    comments,
    loading,
    commentsLoading,
    isLiked,
    isSaved,
    likeCount,
    isAuthor,
    handleLike,
    handleSave,
    handleShare,
    handleCommentSubmit,
    handleReplyComment,
    handleLikeComment,
    refresh: loadPost,
  };
};
