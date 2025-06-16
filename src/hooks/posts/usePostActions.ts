import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastContext } from '../../contexts/ToastContext';
import { postService } from '../../services/post.service';
import { Post, PostStatus } from '../../types/post';

export const usePostActions = () => {
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );

  const setLoading = (postId: string, action: string, loading: boolean) => {
    setActionLoading((prev) => ({
      ...prev,
      [`${postId}-${action}`]: loading,
    }));
  };

  const isLoading = (postId: string, action: string) => {
    return actionLoading[`${postId}-${action}`] || false;
  };

  const publishPost = async (postId: string) => {
    setLoading(postId, 'publish', true);
    try {
      await postService.publishPost(postId);
      success('Đã đăng bài viết');
      return true;
    } catch (err: any) {
      error(err.message || 'Không thể đăng bài viết');
      return false;
    } finally {
      setLoading(postId, 'publish', false);
    }
  };

  const archivePost = async (postId: string) => {
    setLoading(postId, 'archive', true);
    try {
      await postService.archivePost(postId);
      success('Đã lưu trữ bài viết');
      return true;
    } catch (err: any) {
      error(err.message || 'Không thể lưu trữ bài viết');
      return false;
    } finally {
      setLoading(postId, 'archive', false);
    }
  };

  const deletePost = async (postId: string) => {
    setLoading(postId, 'delete', true);
    try {
      await postService.deletePost(postId);
      success('Đã xóa bài viết');
      return true;
    } catch (err: any) {
      error(err.message || 'Không thể xóa bài viết');
      return false;
    } finally {
      setLoading(postId, 'delete', false);
    }
  };

  const editPost = (postId: string) => {
    navigate(`/posts/${postId}/edit`);
  };

  const viewPost = (postId: string) => {
    navigate(`/posts/manage/${postId}`);
  };

  const getAvailableActions = (post: Post) => {
    const actions = [
      {
        key: 'view',
        label: 'Xem',
        icon: 'eye',
        onClick: () => viewPost(post.id),
      },
      {
        key: 'edit',
        label: 'Chỉnh sửa',
        icon: 'pencil',
        onClick: () => editPost(post.id),
      },
    ];

    if (post.status === PostStatus.DRAFT) {
      actions.push({
        key: 'publish',
        label: 'Đăng bài',
        icon: 'upload',
        onClick: () => publishPost(post.id),
      });
    }

    if (post.status === PostStatus.PUBLISHED) {
      actions.push({
        key: 'archive',
        label: 'Lưu trữ',
        icon: 'archive',
        onClick: () => archivePost(post.id),
      });
    }

    actions.push({
      key: 'delete',
      label: 'Xóa',
      icon: 'trash',
      onClick: () => deletePost(post.id),
      variant: 'danger',
    });

    return actions;
  };

  return {
    publishPost,
    archivePost,
    deletePost,
    editPost,
    viewPost,
    getAvailableActions,
    isLoading,
  };
};
