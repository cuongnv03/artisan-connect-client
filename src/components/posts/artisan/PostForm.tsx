import React, { useState } from 'react';
import { Post } from '../../../types/post';
import { usePostForm } from '../../../hooks/posts';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Select } from '../../ui/Dropdown';
import { FileUpload } from '../../common/FileUpload';
import { ContentEditor } from './ContentEditor';
import { ProductMentionSelector } from './ProductMentionSelector';
import { PostTypeSelector } from '../shared/PostTypeSelector';

interface PostFormProps {
  initialPost?: Post;
  onCancel: () => void;
}

export const PostForm: React.FC<PostFormProps> = ({
  initialPost,
  onCancel,
}) => {
  const {
    form,
    content,
    setContent,
    productMentions,
    setProductMentions,
    coverImages,
    setCoverImages,
    mediaFiles,
    setMediaFiles,
    isUploading,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
  } = usePostForm(initialPost);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <form onSubmit={form.handleSubmit} className="space-y-8">
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
            value={form.values.title}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.touched.title ? form.errors.title : ''}
            placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
          />

          <PostTypeSelector
            value={form.values.type}
            onChange={(value) => form.setFieldValue('type', value)}
            error={form.touched.type ? form.errors.type : ''}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tóm tắt
            </label>
            <textarea
              name="summary"
              rows={3}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Viết tóm tắt ngắn gọn về bài viết..."
              value={form.values.summary}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
            />
            {form.touched.summary && form.errors.summary && (
              <p className="mt-1 text-sm text-red-600">{form.errors.summary}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thẻ (Tags) - Tối đa 10 thẻ
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.values.tags.map((tag) => (
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
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                placeholder="Thêm thẻ..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                maxLength={50}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={form.values.tags.length >= 10}
              >
                Thêm
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {form.values.tags.length}/10 thẻ
            </p>
          </div>
        </div>
      </Card>

      {/* Cover Image */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ảnh bìa</h2>
        {initialPost?.coverImage && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Ảnh bìa hiện tại:</p>
            <img
              src={initialPost.coverImage}
              alt="Current cover"
              className="w-full h-48 object-cover rounded-lg"
            />
            <p className="text-sm text-gray-500 mt-2">
              Tải ảnh mới để thay thế
            </p>
          </div>
        )}
        <FileUpload
          files={coverImages}
          onFilesChange={(files) => {
            setCoverImages(files);
            // Đừng trigger submit khi upload xong
          }}
          accept="image"
          multiple={false}
          maxFiles={1}
          maxSize={5}
          onUploadStart={() => setIsImageUploading(true)}
          onUploadComplete={() => setIsImageUploading(false)}
        />
      </Card>

      {/* Content */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Nội dung bài viết
        </h2>
        <ContentEditor content={content} onChange={setContent} />
        {form.errors.content && (
          <p className="mt-2 text-sm text-red-600">{form.errors.content}</p>
        )}
      </Card>

      {/* Product Mentions */}
      <Card className="p-6">
        <ProductMentionSelector
          mentions={productMentions}
          onChange={setProductMentions}
        />
      </Card>

      {/* Additional Media */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thư viện ảnh bổ sung
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          type="submit"
          loading={form.isSubmitting || isUploading || isImageUploading}
          disabled={isImageUploading}
        >
          {isImageUploading
            ? 'Đang tải ảnh...'
            : isUploading
            ? 'Đang tải lên...'
            : initialPost
            ? 'Cập nhật'
            : 'Tạo bài viết'}
        </Button>
      </div>
    </form>
  );
};
