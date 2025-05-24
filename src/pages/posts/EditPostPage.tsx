import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToastContext } from '../../contexts/ToastContext';
import { postService } from '../../services/post.service';
import { uploadService } from '../../services/upload.service';
import { useForm } from '../../hooks/useForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Dropdown';
import { ContentEditor } from '../../components/common/ContentEditor';
import { FileUpload } from '../../components/common/FileUpload';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Post, PostType, ContentBlock } from '../../types/post';

interface EditPostFormData {
  title: string;
  summary: string;
  type: PostType;
  tags: string[];
}

export const EditPostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [coverImages, setCoverImages] = useState<File[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const postTypeOptions = [
    { label: 'Câu chuyện', value: PostType.STORY },
    { label: 'Hướng dẫn', value: PostType.TUTORIAL },
    { label: 'Giới thiệu sản phẩm', value: PostType.PRODUCT_SHOWCASE },
    { label: 'Hậu trường', value: PostType.BEHIND_THE_SCENES },
    { label: 'Sự kiện', value: PostType.EVENT },
    { label: 'Chung', value: PostType.GENERAL },
  ];

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    if (!postId) return;

    try {
      const postData = await postService.getPost(postId);
      setPost(postData);
      setContent(postData.content || []);

      // Initialize form values
      setFieldValue('title', postData.title);
      setFieldValue('summary', postData.summary || '');
      setFieldValue('type', postData.type);
      setFieldValue('tags', postData.tags || []);
    } catch (err) {
      error('Không thể tải bài viết');
      navigate('/posts/my-posts');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (values: EditPostFormData) => {
    const errors: Record<string, string> = {};

    if (!values.title.trim()) {
      errors.title = 'Tiêu đề là bắt buộc';
    } else if (values.title.length < 10) {
      errors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
    }

    if (!values.summary.trim()) {
      errors.summary = 'Tóm tắt là bắt buộc';
    }

    if (!values.type) {
      errors.type = 'Loại bài viết là bắt buộc';
    }

    const hasContent = content.some(
      (block) => block.content && block.content.trim().length > 0,
    );
    if (!hasContent) {
      errors.content = 'Nội dung bài viết không được để trống';
    }

    return errors;
  };

  const handleSubmit = async (values: EditPostFormData) => {
    if (!postId) return;

    try {
      setIsUploading(true);

      // Upload new cover image if exists
      let coverImageUrl = post?.coverImage || '';
      if (coverImages.length > 0) {
        const uploadResult = await uploadService.uploadImage(coverImages[0], {
          folder: 'posts/covers',
        });
        coverImageUrl = uploadResult.url;
      }

      // Upload new media files
      const newMediaUrls: string[] = [];
      for (const mediaFile of mediaFiles) {
        const uploadResult = await uploadService.uploadImage(mediaFile, {
          folder: 'posts/media',
        });
        newMediaUrls.push(uploadResult.url);
      }

      // Combine existing and new media URLs
      const mediaUrls = [...(post?.mediaUrls || []), ...newMediaUrls];

      // Update post
      await postService.updatePost(postId, {
        title: values.title,
        summary: values.summary,
        content,
        type: values.type,
        coverImage: coverImageUrl,
        mediaUrls,
        tags: values.tags,
      });

      success('Bài viết đã được cập nhật thành công!');
      navigate(`/posts/${postId}`);
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi cập nhật bài viết');
    } finally {
      setIsUploading(false);
    }
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    handleSubmit: onSubmit,
  } = useForm<EditPostFormData>({
    initialValues: {
      title: '',
      summary: '',
      type: PostType.GENERAL,
      tags: [],
    },
    validate: validateForm,
    onSubmit: handleSubmit,
  });

  const addTag = () => {
    if (tagInput.trim() && !values.tags.includes(tagInput.trim())) {
      setFieldValue('tags', [...values.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFieldValue(
      'tags',
      values.tags.filter((tag) => tag !== tagToRemove),
    );
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
        <Button onClick={() => navigate('/posts/my-posts')}>
          Quay lại danh sách bài viết
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Chỉnh sửa bài viết
        </h1>
        <p className="text-gray-600">
          Cập nhật nội dung và thông tin bài viết của bạn
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin cơ bản
          </h2>

          <div className="space-y-4">
            <Input
              label="Tiêu đề bài viết"
              name="title"
              required
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.title ? errors.title : ''}
              placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại bài viết
              </label>
              <Select
                value={values.type}
                onChange={(value) => setFieldValue('type', value as PostType)}
                options={postTypeOptions}
                placeholder="Chọn loại bài viết"
              />
              {touched.type && errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tóm tắt
              </label>
              <textarea
                name="summary"
                rows={3}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                placeholder="Viết tóm tắt ngắn gọn về bài viết..."
                value={values.summary}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.summary && errors.summary && (
                <p className="mt-1 text-sm text-red-600">{errors.summary}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thẻ (Tags)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {values.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => removeTag(tag)}
                  >
                    #{tag} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                  placeholder="Thêm thẻ..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Thêm
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Cover Image */}
        {post.coverImage && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ảnh bìa hiện tại
            </h2>
            <img
              src={post.coverImage}
              alt="Cover"
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <p className="text-sm text-gray-500 mb-4">
              Tải ảnh mới để thay thế ảnh bìa hiện tại
            </p>
            <FileUpload
              files={coverImages}
              onFilesChange={setCoverImages}
              accept="image"
              multiple={false}
              maxFiles={1}
              maxSize={5}
            />
          </Card>
        )}

        {/* Cover Image (if no current image) */}
        {!post.coverImage && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ảnh bìa
            </h2>
            <FileUpload
              files={coverImages}
              onFilesChange={setCoverImages}
              accept="image"
              multiple={false}
              maxFiles={1}
              maxSize={5}
            />
          </Card>
        )}

        {/* Content */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Nội dung bài viết
          </h2>

          <ContentEditor content={content} onChange={setContent} />

          {touched.content && errors.content && (
            <p className="mt-2 text-sm text-red-600">{errors.content}</p>
          )}
        </Card>

        {/* Additional Media */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thêm ảnh mới
          </h2>
          <FileUpload
            files={mediaFiles}
            onFilesChange={setMediaFiles}
            accept="image"
            multiple={true}
            maxFiles={10}
            maxSize={5}
          />
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/posts/${postId}`)}
          >
            Hủy
          </Button>
          <Button type="submit" loading={isSubmitting || isUploading}>
            Cập nhật bài viết
          </Button>
        </div>
      </form>
    </div>
  );
};
