import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostForm } from '../../../components/posts/artisan/PostForm';
import { Button } from '../../../components/ui/Button';

export const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    navigate('/posts/me');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header với Title và Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tạo bài viết mới
          </h1>
          <p className="text-gray-600">
            Chia sẻ câu chuyện, kinh nghiệm hoặc sản phẩm của bạn với cộng đồng
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
            form="post-create-form"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Tạo bài viết
          </Button>
        </div>
      </div>

      {/* Post Form */}
      <PostForm
        onCancel={handleCancel}
        onSubmitStart={() => setIsSubmitting(true)}
        onSubmitEnd={() => setIsSubmitting(false)}
        hideActions={true}
        formId="post-create-form"
      />
    </div>
  );
};
