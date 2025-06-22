import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToastContext } from '../../../contexts/ToastContext';
import { postService } from '../../../services/post.service';
import { Post } from '../../../types/post';
import { PostForm } from '../../../components/posts/artisan/PostForm';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Button } from '../../../components/ui/Button';

export const EditPostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { error } = useToastContext();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    if (!postId) return;

    try {
      const postData = await postService.getPost(postId);
      console.log('Loaded post data for editing:', postData);
      setPost(postData);
    } catch (err) {
      error('Không thể tải bài viết');
      navigate('/posts/me');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/posts/manage/${postId}`);
  };

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
          Bài viết này không tồn tại hoặc bạn không có quyền chỉnh sửa.
        </p>
        <Button onClick={() => navigate('/posts/me')}>
          Quay lại danh sách bài viết
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header với Title và Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chỉnh sửa bài viết
          </h1>
          <p className="text-gray-600">
            Cập nhật nội dung và thông tin bài viết của bạn
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="post-edit-form" // Sẽ link với form ID
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Cập nhật
          </Button>
        </div>
      </div>

      {/* Post Form */}
      <PostForm
        initialPost={post}
        onCancel={handleCancel}
        onSubmitStart={() => setIsSubmitting(true)}
        onSubmitEnd={() => setIsSubmitting(false)}
        hideActions={true} // Ẩn actions ở cuối form
        formId="post-edit-form" // ID để link với submit button
      />
    </div>
  );
};
