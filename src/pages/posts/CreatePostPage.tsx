import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  ProductMentionSelector,
  ProductMentionData,
} from '../../components/common/ProductMentionSelector';
import { FileUpload } from '../../components/common/FileUpload';
import { PostType, ContentBlock, BlockType } from '../../types/post';

interface CreatePostFormData {
  title: string;
  summary: string;
  type: PostType;
  tags: string[];
}

export const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [productMentions, setProductMentions] = useState<ProductMentionData[]>(
    [],
  );
  const [coverImages, setCoverImages] = useState<File[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
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

  const validateForm = (values: CreatePostFormData) => {
    const errors: Record<string, string> = {};

    if (!values.title.trim()) {
      errors.title = 'Tiêu đề là bắt buộc';
    } else if (values.title.length < 3) {
      errors.title = 'Tiêu đề phải có ít nhất 3 ký tự';
    }

    if (!values.summary.trim()) {
      errors.summary = 'Tóm tắt là bắt buộc';
    }

    if (!values.type) {
      errors.type = 'Loại bài viết là bắt buộc';
    }

    if (content.length === 0) {
      errors.content = 'Vui lòng thêm nội dung cho bài viết';
    }

    return errors;
  };

  const handleSubmit = async (values: CreatePostFormData) => {
    try {
      setIsUploading(true);

      // Upload cover image
      let coverImageUrl = '';
      if (coverImages.length > 0) {
        try {
          const uploadResult = await uploadService.uploadImage(coverImages[0], {
            folder: 'posts/covers',
          });
          coverImageUrl = uploadResult.url;
        } catch (uploadError) {
          console.error('Cover upload failed:', uploadError);
          error('Không thể upload ảnh bìa');
          return;
        }
      }

      // Upload media files
      const mediaUrls: string[] = [];
      for (const mediaFile of mediaFiles) {
        const uploadResult = await uploadService.uploadImage(mediaFile, {
          folder: 'posts/media',
        });
        mediaUrls.push(uploadResult.url);
      }

      // Process content blocks to match server format
      const processedContent = await Promise.all(
        content.map(async (block, index) => {
          // Skip empty content blocks
          if (
            !block.content?.trim() &&
            block.type !== BlockType.DIVIDER &&
            block.type !== BlockType.IMAGE
          ) {
            return null;
          }

          // Upload image if present
          if (block.type === BlockType.IMAGE && block.metadata?.file) {
            try {
              const uploadResult = await uploadService.uploadImage(
                block.metadata.file,
                {
                  folder: 'posts/content',
                },
              );
              return {
                id: block.id,
                type: block.type,
                data: {
                  url: uploadResult.url,
                  caption: block.metadata.caption || '',
                },
                order: index,
              };
            } catch (uploadError) {
              console.error('Image upload failed:', uploadError);
              throw new Error(`Không thể upload hình ảnh trong content`);
            }
          }

          // Handle other block types
          let blockData: any = {};

          switch (block.type) {
            case BlockType.PARAGRAPH:
            case BlockType.HEADING:
              blockData = { text: block.content || '' };
              break;
            case BlockType.QUOTE:
              blockData = {
                text: block.content || '',
                author: block.metadata?.author || '',
              };
              break;
            case BlockType.LIST:
              blockData = {
                items: block.metadata?.items || [block.content || ''],
              };
              break;
            case BlockType.DIVIDER:
              blockData = {};
              break;
            default:
              blockData = { text: block.content || '' };
          }

          return {
            id: block.id,
            type: block.type,
            data: blockData,
            order: index,
          };
        }),
      );

      // Filter out null blocks (empty content)
      const validContent = processedContent.filter((block) => block !== null);

      if (validContent.length === 0) {
        error('Bài viết phải có ít nhất một nội dung');
        return;
      }

      // Create post với đúng format backend expects
      const postData = {
        title: values.title,
        summary: values.summary,
        content: processedContent,
        type: values.type,
        status: 'DRAFT',
        coverImage: coverImageUrl || undefined,
        mediaUrls,
        tags: values.tags,
        publishNow: false,
        productMentions: productMentions.map((mention) => ({
          productId: mention.productId,
          contextText: mention.contextText,
          position: mention.position,
        })),
      };

      console.log('Sending post data:', JSON.stringify(postData, null, 2));

      await postService.createPost(postData);

      success('Bài viết đã được tạo thành công!');
      navigate('/posts/my-posts');
    } catch (err: any) {
      console.error('Create post error:', err);
      error(err.message || 'Có lỗi xảy ra khi tạo bài viết');
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
  } = useForm<CreatePostFormData>({
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
    if (
      tagInput.trim() &&
      !values.tags.includes(tagInput.trim()) &&
      values.tags.length < 10
    ) {
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

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

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
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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
                Thẻ (Tags) - Tối đa 10 thẻ
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
                  disabled={values.tags.length >= 10}
                >
                  Thêm
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {values.tags.length}/10 thẻ
              </p>
            </div>
          </div>
        </Card>

        {/* Cover Image */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ảnh bìa (không bắt buộc)
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

        {/* Content */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Nội dung bài viết
          </h2>

          <ContentEditor content={content} onChange={setContent} />

          {errors.content && (
            <p className="mt-2 text-sm text-red-600">{errors.content}</p>
          )}
        </Card>

        {/* Product Mentions */}
        <Card className="p-6">
          <ProductMentionSelector
            mentions={productMentions}
            onChange={setProductMentions}
          />
        </Card>

        {/* Media Gallery */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thư viện ảnh
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
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Hủy
          </Button>
          <Button type="submit" loading={isSubmitting || isUploading}>
            {isUploading ? 'Đang tải lên...' : 'Lưu bài viết'}
          </Button>
        </div>
      </form>
    </div>
  );
};
