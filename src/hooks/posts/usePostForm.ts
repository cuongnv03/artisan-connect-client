import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastContext } from '../../contexts/ToastContext';
import { postService } from '../../services/post.service';
import { uploadService } from '../../services/upload.service';
import { useForm } from '../useForm';
import {
  CreatePostRequest,
  UpdatePostRequest,
  PostType,
  ContentBlock,
  Post,
} from '../../types/post';

interface PostFormData {
  title: string;
  summary: string;
  type: PostType;
  tags: string[];
}

interface ProductMentionData {
  productId: string;
  contextText: string;
  position: number;
  product: any;
}

export const usePostForm = (initialPost?: Post) => {
  const navigate = useNavigate();
  const { success, error } = useToastContext();

  const [content, setContent] = useState<ContentBlock[]>(
    initialPost?.content || [],
  );
  const [productMentions, setProductMentions] = useState<ProductMentionData[]>(
    [],
  );
  const [coverImages, setCoverImages] = useState<File[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const validateForm = (values: PostFormData) => {
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

  const uploadContentImages = async (contentBlocks: ContentBlock[]) => {
    return await Promise.all(
      contentBlocks.map(async (block, index) => {
        if (block.type === 'image' && block.metadata?.file) {
          try {
            const uploadResult = await uploadService.uploadImage(
              block.metadata.file,
              { folder: 'posts/content' },
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
            throw new Error(`Không thể upload hình ảnh trong content`);
          }
        }

        // Handle other block types
        let blockData: any = {};
        switch (block.type) {
          case 'paragraph':
          case 'heading':
            blockData = { text: block.content || '' };
            break;
          case 'quote':
            blockData = {
              text: block.content || '',
              author: block.metadata?.author || '',
            };
            break;
          case 'list':
            blockData = {
              items: block.metadata?.items || [block.content || ''],
            };
            break;
          case 'divider':
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
  };

  const handleSubmit = async (values: PostFormData) => {
    try {
      setIsUploading(true);

      // Upload cover image
      let coverImageUrl = initialPost?.coverImage || '';
      if (coverImages.length > 0) {
        const uploadResult = await uploadService.uploadImage(coverImages[0], {
          folder: 'posts/covers',
        });
        coverImageUrl = uploadResult.url;
      }

      // Upload media files
      const mediaUrls: string[] = [];
      for (const mediaFile of mediaFiles) {
        const uploadResult = await uploadService.uploadImage(mediaFile, {
          folder: 'posts/media',
        });
        mediaUrls.push(uploadResult.url);
      }

      // Process content blocks
      const processedContent = await uploadContentImages(content);
      const validContent = processedContent.filter((block) => block !== null);

      if (validContent.length === 0) {
        error('Bài viết phải có ít nhất một nội dung');
        return;
      }

      // Prepare post data
      const postData = {
        title: values.title,
        summary: values.summary,
        content: validContent,
        type: values.type,
        status: 'DRAFT',
        coverImage: coverImageUrl || undefined,
        mediaUrls: [...(initialPost?.mediaUrls || []), ...mediaUrls],
        tags: values.tags,
        publishNow: false,
        productMentions: productMentions.map((mention) => ({
          productId: mention.productId,
          contextText: mention.contextText,
          position: mention.position,
        })),
      } as CreatePostRequest | UpdatePostRequest;

      // Create or update post
      if (initialPost) {
        await postService.updatePost(
          initialPost.id,
          postData as UpdatePostRequest,
        );
        success('Bài viết đã được cập nhật thành công!');
        navigate(`/posts/manage/${initialPost.id}`);
      } else {
        await postService.createPost(postData as CreatePostRequest);
        success('Bài viết đã được tạo thành công!');
        navigate('/posts/me');
      }
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi lưu bài viết');
    } finally {
      setIsUploading(false);
    }
  };

  const form = useForm<PostFormData>({
    initialValues: {
      title: initialPost?.title || '',
      summary: initialPost?.summary || '',
      type: initialPost?.type || PostType.GENERAL,
      tags: initialPost?.tags || [],
    },
    validate: validateForm,
    onSubmit: handleSubmit,
  });

  const addTag = () => {
    if (
      tagInput.trim() &&
      !form.values.tags.includes(tagInput.trim()) &&
      form.values.tags.length < 10
    ) {
      form.setFieldValue('tags', [...form.values.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setFieldValue(
      'tags',
      form.values.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  return {
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
  };
};
