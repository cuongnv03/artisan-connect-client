import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { Button } from '../../../components/form/Button';
import { Input } from '../../../components/form/Input';
import { Card } from '../../../components/common/Card';
import { Loader } from '../../../components/feedback/Loader';
import { Alert } from '../../../components/feedback/Alert';
import { Dropdown } from '../../../components/form/Dropdown';
import { MediaUploader } from '@/components/form/MediaUploader';
import { TagInput } from '../../../components/form/TagInput';
import { BlockEditor } from './components/BlockEditor';
import { ProductSelector } from '@/components/form/ProductSelector';
import {
  PostType,
  PostStatus,
  ContentBlock,
  CreatePostDto,
  UpdatePostDto,
} from '../../../types/post.types';
import { PostService } from '../../../services/post.service';
import {
  CheckIcon,
  DocumentTextIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../../../components/feedback/Modal';

const PostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [postType, setPostType] = useState<PostType>(PostType.STORY);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [exitConfirmation, setExitConfirmation] = useState(false);

  // Fetch post data when editing
  const {
    data: post,
    isLoading: isLoadingPost,
    isError: isErrorPost,
  } = useQuery(['post', id], () => PostService.getPostById(id!), {
    enabled: isEditing,
    onSuccess: (data) => {
      setTitle(data.title);
      setSummary(data.summary || '');
      setContent(data.content);
      setThumbnailUrl(data.thumbnailUrl || '');
      setCoverImage(data.coverImage || '');
      setTags(data.tags || []);
      setPostType(data.type);
      setSelectedProducts(data.productMentions?.map((p) => p.productId) || []);
    },
  });

  // Create post mutation
  const createMutation = useMutation(
    (data: CreatePostDto) => PostService.createPost(data),
    {
      onSuccess: (data) => {
        navigate(`/post/${data.id}`);
      },
    },
  );

  // Update post mutation
  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: UpdatePostDto }) =>
      PostService.updatePost(id, data),
    {
      onSuccess: (data) => {
        navigate(`/post/${data.id}`);
      },
    },
  );

  // Handle form submission
  const handleSubmit = (status: PostStatus) => {
    if (!title.trim() || content.length === 0) {
      alert('Please add a title and content to your post.');
      return;
    }

    const postData = {
      title,
      summary: summary || undefined,
      content,
      thumbnailUrl: thumbnailUrl || undefined,
      coverImage: coverImage || undefined,
      tags,
      type: postType,
      status,
      productIds: selectedProducts.length > 0 ? selectedProducts : undefined,
      publishNow: status === PostStatus.PUBLISHED,
    };

    if (isEditing && id) {
      updateMutation.mutate({ id, data: postData });
    } else {
      createMutation.mutate(postData);
    }
  };

  // Confirm exit if there are changes
  const confirmExit = (callback: () => void) => {
    // Only confirm if user has made changes
    if (
      title.trim() ||
      summary.trim() ||
      content.length > 0 ||
      thumbnailUrl ||
      coverImage ||
      tags.length > 0 ||
      selectedProducts.length > 0
    ) {
      setExitConfirmation(true);
    } else {
      callback();
    }
  };

  // Post type options
  const postTypeOptions = Object.values(PostType).map((type) => ({
    value: type,
    label: type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' '),
  }));

  if (isEditing && isLoadingPost) {
    return (
      <div className="py-12 text-center">
        <Loader size="lg" text="Loading post..." />
      </div>
    );
  }

  if (isEditing && isErrorPost) {
    return (
      <Alert type="error" variant="subtle">
        Failed to load post. Please try again.
      </Alert>
    );
  }

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => confirmExit(() => navigate(-1))}
            leftIcon={<XMarkIcon className="h-5 w-5" />}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            leftIcon={<DocumentTextIcon className="h-5 w-5" />}
          >
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit(PostStatus.DRAFT)}
            isLoading={isLoading}
            leftIcon={<DocumentTextIcon className="h-5 w-5" />}
          >
            Save as Draft
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit(PostStatus.PUBLISHED)}
            isLoading={isLoading}
            leftIcon={<CheckIcon className="h-5 w-5" />}
          >
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Main content editor */}
          <Card>
            <div className="space-y-6">
              <Input
                label="Post Title"
                placeholder="Enter a title for your post"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary (optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                  placeholder="Brief description of your post"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <BlockEditor blocks={content} onChange={setContent} />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {/* Sidebar settings */}
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Post Settings
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post Type
                </label>
                <Dropdown
                  options={postTypeOptions}
                  value={postType}
                  onChange={(value) => setPostType(value as PostType)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <TagInput
                  tags={tags}
                  onChange={setTags}
                  placeholder="Add tags"
                  max={10}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Add up to 10 tags to help people discover your post
                </p>
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Media</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail Image
                </label>
                <MediaUploader
                  type="image"
                  value={thumbnailUrl}
                  onChange={setThumbnailUrl}
                  placeholder="Upload a thumbnail image"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Used in post lists and social media shares
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image (optional)
                </label>
                <MediaUploader
                  type="image"
                  value={coverImage}
                  onChange={setCoverImage}
                  placeholder="Upload a cover image"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Large image displayed at the top of your post
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Featured Products
            </h3>
            <ProductSelector
              selectedProductIds={selectedProducts}
              onChange={setSelectedProducts}
            />
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          size="xl"
          title="Post Preview"
        >
          <div className="p-4 max-h-[80vh] overflow-y-auto">
            {coverImage && (
              <div className="h-64 w-full mb-6 rounded-lg overflow-hidden">
                <img
                  src={coverImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>

            {summary && <p className="text-lg text-gray-700 mb-6">{summary}</p>}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              {/* Render content preview */}
              {content.length > 0 ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  {/* This would be replaced with your actual content renderer */}
                  <p className="text-gray-500">
                    Content preview with {content.length} blocks
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No content added yet</p>
              )}
            </div>
          </div>
          <div className="flex justify-end bg-gray-50 p-4 rounded-b-lg">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close Preview
            </Button>
          </div>
        </Modal>
      )}

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={exitConfirmation}
        onClose={() => setExitConfirmation(false)}
        title="Discard changes?"
      >
        <p className="text-gray-700">
          You have unsaved changes. Are you sure you want to leave this page?
          Your changes will be lost.
        </p>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setExitConfirmation(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setExitConfirmation(false);
              navigate(-1);
            }}
          >
            Discard Changes
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PostEditor;
