import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { PostService } from '../../../services/post.service';
import { Avatar } from '../../../components/common/Avatar';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Loader } from '../../../components/ui/Loader';
import { Alert } from '../../../components/ui/Alert';
import { formatRelativeTime, formatDate } from '../../../utils/formatters';
import { CommentSection } from './CommentSection';
import { PostContent } from './PostContent';
import { RelatedPosts } from './RelatedPosts';
import {
  HeartIcon as HeartOutline,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon as BookmarkOutline,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid,
} from '@heroicons/react/24/solid';
import { PostWithUser } from '../../../types/post.types';

const PostDetail: React.FC = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Fetch post data using React Query
  const {
    data: post,
    isLoading,
    isError,
  } = useQuery<PostWithUser>(
    ['post', id || slug],
    () => {
      if (id) {
        return PostService.getPostById(id);
      } else if (slug) {
        return PostService.getPostBySlug(slug);
      }
      throw new Error('Either id or slug must be provided');
    },
    {
      onSuccess: (data) => {
        setIsLiked(data.liked || false);
        setIsSaved(data.saved || false);
        setLikeCount(data.likeCount);
      },
    },
  );

  // Handle post not found
  useEffect(() => {
    if (isError) {
      navigate('/404', { replace: true });
    }
  }, [isError, navigate]);

  const handleLike = async () => {
    if (!post) return;

    try {
      if (isLiked) {
        await PostService.unlikePost(post.id);
        setLikeCount((prev) => prev - 1);
      } else {
        await PostService.likePost(post.id);
        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to like/unlike post:', error);
    }
  };

  const handleSave = async () => {
    if (!post) return;

    try {
      if (isSaved) {
        await PostService.unsavePost(post.id);
      } else {
        await PostService.savePost(post.id);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Failed to save/unsave post:', error);
    }
  };

  const handleShare = async () => {
    if (!post) return;

    try {
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.summary || 'Check out this post on Artisan Connect',
          url: window.location.href,
        });
      } else {
        // Fallback to copying link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // Show a toast notification here
      }
    } catch (error) {
      console.error('Failed to share post:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <Loader size="lg" text="Loading post..." />
      </div>
    );
  }

  if (!post) {
    return (
      <Alert type="error" variant="subtle">
        Post not found
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            {/* Cover image if available */}
            {post.coverImage && (
              <div className="h-80 w-full -mx-6 -mt-6 mb-6 relative">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    {post.title}
                  </h1>
                  <div className="flex items-center mt-2">
                    <Avatar
                      src={post.user.avatarUrl}
                      firstName={post.user.firstName}
                      lastName={post.user.lastName}
                      size="sm"
                      className="border-2 border-white"
                    />
                    <span className="ml-2 text-white text-sm">
                      {post.user.artisanProfile?.shopName ||
                        `${post.user.firstName} ${post.user.lastName}`}
                    </span>
                    <span className="mx-2 text-white text-sm">•</span>
                    <span className="text-white text-sm">
                      {formatRelativeTime(post.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Post header (if no cover image) */}
            {!post.coverImage && (
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  {post.title}
                </h1>
                <div className="flex items-center mt-4">
                  <Link to={`/artisan/${post.user.id}`}>
                    <Avatar
                      src={post.user.avatarUrl}
                      firstName={post.user.firstName}
                      lastName={post.user.lastName}
                      size="md"
                    />
                  </Link>
                  <div className="ml-3">
                    <Link
                      to={`/artisan/${post.user.id}`}
                      className="font-medium text-gray-900 hover:text-accent"
                    >
                      {post.user.artisanProfile?.shopName ||
                        `${post.user.firstName} ${post.user.lastName}`}
                    </Link>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-500">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        {post.viewCount} views
                      </span>
                    </div>
                  </div>
                </div>

                {/* Post Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="default"
                        size="sm"
                        rounded
                        className="bg-gray-100"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Post Content */}
            <PostContent content={post.content} />

            {/* Featured Products */}
            {post.productMentions && post.productMentions.length > 0 && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Featured Products
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {post.productMentions.map((product) => (
                    <Link
                      key={product.productId}
                      to={`/product/${product.productId}`}
                      className="block group"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={
                            product.thumbnailUrl || '/placeholder-product.jpg'
                          }
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h4 className="mt-2 text-sm font-medium text-gray-900 group-hover:text-accent">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {product.discountPrice ? (
                          <>
                            <span className="line-through text-gray-400">
                              ${product.price}
                            </span>{' '}
                            <span className="text-accent-dark font-medium">
                              ${product.discountPrice}
                            </span>
                          </>
                        ) : (
                          <span>${product.price}</span>
                        )}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Post Actions */}
            <div className="mt-8 flex justify-between items-center py-4 border-t border-b border-gray-100">
              <div className="flex space-x-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center ${
                    isLiked
                      ? 'text-accent'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {isLiked ? (
                    <HeartSolid className="h-6 w-6 mr-2" />
                  ) : (
                    <HeartOutline className="h-6 w-6 mr-2" />
                  )}
                  <span>{likeCount}</span>
                </button>

                <button
                  onClick={() => {
                    // Scroll to comments section
                    document
                      .getElementById('comments-section')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center text-gray-500 hover:text-gray-700"
                >
                  <ChatBubbleLeftIcon className="h-6 w-6 mr-2" />
                  <span>{post.commentCount}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center text-gray-500 hover:text-gray-700"
                >
                  <ShareIcon className="h-6 w-6 mr-2" />
                  <span>Share</span>
                </button>
              </div>

              <button
                onClick={handleSave}
                className={`flex items-center ${
                  isSaved ? 'text-accent' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {isSaved ? (
                  <BookmarkSolid className="h-6 w-6 mr-2" />
                ) : (
                  <BookmarkOutline className="h-6 w-6 mr-2" />
                )}
                <span>Save</span>
              </button>
            </div>

            {/* Comments Section */}
            <div id="comments-section" className="mt-8">
              <CommentSection postId={post.id} />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Artisan Card */}
          <Card className="mb-6">
            <div className="text-center">
              <Link to={`/artisan/${post.user.id}`}>
                <Avatar
                  src={post.user.avatarUrl}
                  firstName={post.user.firstName}
                  lastName={post.user.lastName}
                  size="lg"
                  className="mx-auto"
                />
              </Link>
              <h3 className="mt-4 font-semibold text-gray-900">
                <Link
                  to={`/artisan/${post.user.id}`}
                  className="hover:text-accent"
                >
                  {post.user.artisanProfile?.shopName ||
                    `${post.user.firstName} ${post.user.lastName}`}
                </Link>
              </h3>
              {post.user.artisanProfile?.isVerified && (
                <Badge variant="info" size="sm" className="mt-1">
                  Verified Artisan
                </Badge>
              )}
              <div className="mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  isFullWidth
                  as={Link}
                  to={`/artisan/${post.user.id}`}
                >
                  View Profile
                </Button>
              </div>
            </div>
          </Card>

          {/* Related Posts */}
          <RelatedPosts
            artisanId={post.user.id}
            currentPostId={post.id}
            postType={post.type}
          />
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
