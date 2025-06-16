import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PostForm } from '../../../components/posts/artisan/PostForm';

export const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tạo bài viết mới
        </h1>
        <p className="text-gray-600">
          Chia sẻ câu chuyện, kinh nghiệm hoặc sản phẩm của bạn với cộng đồng
        </p>
      </div>

      <PostForm onCancel={() => navigate('/posts/me')} />
    </div>
  );
};
