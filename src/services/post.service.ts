import api from './api';
import {
  PostWithUser,
  PostPaginationResult,
  PostQueryOptions,
} from '../types/post.types';

export const PostService = {
  getPosts: async (
    options: PostQueryOptions,
  ): Promise<PostPaginationResult> => {
    const response = await api.get('/posts', { params: options });
    return response.data.data;
  },

  getPostById: async (id: string): Promise<PostWithUser> => {
    const response = await api.get(`/posts/${id}`);
    return response.data.data;
  },

  getPostBySlug: async (slug: string): Promise<PostWithUser> => {
    const response = await api.get(`/posts/slug/${slug}`);
    return response.data.data;
  },

  likePost: async (postId: string): Promise<void> => {
    await api.post(`/social/like`, { postId });
  },

  unlikePost: async (postId: string): Promise<void> => {
    await api.delete(`/social/like`, { data: { postId } });
  },

  savePost: async (postId: string): Promise<void> => {
    await api.post(`/saved-posts`, { postId });
  },

  unsavePost: async (postId: string): Promise<void> => {
    await api.delete(`/saved-posts/${postId}`);
  },

  getMyPosts: async (
    options: Omit<PostQueryOptions, 'userId'>,
  ): Promise<PostPaginationResult> => {
    const response = await api.get('/posts/user/me', { params: options });
    return response.data.data.posts;
  },

  getFollowedPosts: async (
    options: Omit<PostQueryOptions, 'followedOnly'>,
  ): Promise<PostPaginationResult> => {
    const response = await api.get('/posts/feed/followed', { params: options });
    return response.data.data;
  },

  createPost: async (data: CreatePostDto): Promise<PostWithUser> => {
    const response = await api.post('/posts', data);
    return response.data.data;
  },

  updatePost: async (
    id: string,
    data: UpdatePostDto,
  ): Promise<PostWithUser> => {
    const response = await api.patch(`/posts/${id}`, data);
    return response.data.data;
  },

  getMyProducts: async (
    options: Omit<PostQueryOptions, 'userId'> = {},
  ): Promise<PostPaginationResult> => {
    const response = await api.get('/posts/user/me', { params: options });
    return response.data.data.posts;
  },

  getProductsByIds: async (ids: string[]): Promise<any[]> => {
    if (ids.length === 0) return [];
    const response = await api.get('/products/batch', {
      params: { ids: ids.join(',') },
    });
    return response.data.data;
  },
};
