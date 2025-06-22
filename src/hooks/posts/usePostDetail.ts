import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { postService } from '../../services/post.service';
import { socialService } from '../../services/social.service';
import { wishlistService } from '../../services/wishlist.service';
import { Post } from '../../types/post';
import { Comment } from '../../types/social';
import { WishlistItemType } from '../../types/wishlist';

// Helper function để check UUID
const isUUID = (str: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const usePostDetail = () => {
  const params = useParams<{
    postId?: string;
    id?: string;
    slug?: string;
  }>();

  const postId = params.postId || params.id || params.slug;
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { success, error } = useToastContext();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Refs để track đã load và đã increment view chưa
  const hasLoadedRef = useRef(false);
  const hasIncrementedViewRef = useRef(false);
  const currentPostIdRef = useRef<string | null>(null);

  // Memoize loadPost function
  const loadPost = useCallback(async () => {
    if (!postId || !postId.trim() || postId === 'undefined') {
      console.log('Invalid postId for loading:', postId);
      setLoading(false);
      return;
    }

    // Prevent duplicate loading của cùng một post
    if (currentPostIdRef.current === postId && hasLoadedRef.current) {
      return;
    }

    setLoading(true);
    hasLoadedRef.current = false;
    hasIncrementedViewRef.current = false;
    currentPostIdRef.current = postId;

    try {
      console.log('Loading post:', postId, 'Is UUID:', isUUID(postId));

      let postData: Post;

      if (isUUID(postId)) {
        postData = await postService.getPost(postId);
      } else {
        postData = await postService.getPostBySlug(postId);
      }

      console.log('Post data received:', postData);

      setPost(postData);
      setIsLiked(Boolean(postData.isLiked));
      setIsSaved(Boolean(postData.isSaved));
      setLikeCount(postData.likeCount);
      hasLoadedRef.current = true;

      // Chỉ tăng view count một lần và chỉ khi không phải author
      const isAuthor = postData.user?.id === authState.user?.id;
      console.log('Is author check:', {
        postUserId: postData.user?.id,
        currentUserId: authState.user?.id,
        isAuthor,
      });

      if (!isAuthor && !hasIncrementedViewRef.current && authState.user) {
        hasIncrementedViewRef.current = true;
        console.log('Incrementing view count for non-author user');

        // Delay để tránh race condition
        setTimeout(async () => {
          try {
            await postService.viewPost(postData.id, authState.user!.id);
            console.log('View count incremented successfully');
          } catch (err) {
            console.error('Failed to increment view count:', err);
          }
        }, 500);
      } else {
        console.log('Skipping view increment:', {
          isAuthor,
          hasIncremented: hasIncrementedViewRef.current,
        });
      }
    } catch (err: any) {
      console.error('Error loading post:', err);
      error(err.message || 'Không thể tải bài viết');
      navigate('/posts/me');
    } finally {
      setLoading(false);
    }
  }, [postId, authState.user?.id, authState.user, error, navigate]);

  // Effect để load post - chỉ chạy khi postId thay đổi
  useEffect(() => {
    console.log('usePostDetail effect triggered:', {
      postId,
      hasLoaded: hasLoadedRef.current,
    });

    if (postId && postId.trim() && postId !== 'undefined') {
      // Reset refs khi postId thay đổi
      if (currentPostIdRef.current !== postId) {
        hasLoadedRef.current = false;
        hasIncrementedViewRef.current = false;
        currentPostIdRef.current = postId;
      }

      loadPost();
    } else {
      setLoading(false);
    }

    // Cleanup function
    return () => {
      console.log('usePostDetail cleanup');
    };
  }, [postId]); // Chỉ depend on postId

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
      await wishlistService.toggleWishlistItem({
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

  const isAuthor = post?.user?.id === authState.user?.id;

  return {
    post,
    loading,
    isLiked,
    isSaved,
    likeCount,
    isAuthor,
    handleLike,
    handleSave,
    handleShare,
    refresh: loadPost,
  };
};
