import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  GetPostsQuery,
  PostPaginationResult,
} from '../types/post';
import { PaginatedResponse } from '../types/common';

export const postService = {
  async getPosts(query: GetPostsQuery = {}): Promise<PostPaginationResult> {
    const response = await apiClient.get<PaginatedResponse<Post>>(
      API_ENDPOINTS.POSTS.BASE,
      query,
    );

    return {
      data: response.data,
      meta: response.meta,
    };
  },

  async getPost(id: string): Promise<Post> {
    return await apiClient.get<Post>(API_ENDPOINTS.POSTS.BY_ID(id));
  },

  async getPostBySlug(slug: string): Promise<Post> {
    return await apiClient.get<Post>(API_ENDPOINTS.POSTS.BY_SLUG(slug));
  },

  async createPost(data: CreatePostRequest): Promise<Post> {
    return await apiClient.post<Post>(API_ENDPOINTS.POSTS.BASE, data);
  },

  async updatePost(id: string, data: UpdatePostRequest): Promise<Post> {
    return await apiClient.patch<Post>(API_ENDPOINTS.POSTS.BY_ID(id), data);
  },

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.POSTS.BY_ID(id));
  },

  async publishPost(id: string): Promise<Post> {
    return await apiClient.post<Post>(API_ENDPOINTS.POSTS.PUBLISH(id));
  },

  async archivePost(id: string): Promise<Post> {
    return await apiClient.post<Post>(API_ENDPOINTS.POSTS.ARCHIVE(id));
  },

  async getMyPosts(query: GetPostsQuery = {}): Promise<PostPaginationResult> {
    const response = await apiClient.get<{
      posts: PaginatedResponse<Post>;
      statusCounts: Record<string, number>;
    }>(API_ENDPOINTS.POSTS.MY_POSTS, query);

    return {
      data: response.posts.data,
      meta: response.posts.meta,
    };
  },

  async getFollowedPosts(
    query: GetPostsQuery = {},
  ): Promise<PostPaginationResult> {
    const response = await apiClient.get<PaginatedResponse<Post>>(
      API_ENDPOINTS.POSTS.FEED,
      query,
    );

    return {
      data: response.data,
      meta: response.meta,
    };
  },

  async getPostStatusCounts(): Promise<Record<string, number>> {
    const response = await apiClient.get<{
      posts: PaginatedResponse<Post>;
      statusCounts: Record<string, number>;
    }>(API_ENDPOINTS.POSTS.MY_POSTS, { limit: 1 });

    return response.statusCounts || {};
  },
};
