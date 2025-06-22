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
  // === PUBLIC POST QUERIES ===
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

  // === POST CRUD (AUTHENTICATED) ===
  async createPost(data: CreatePostRequest): Promise<Post> {
    return await apiClient.post<Post>(API_ENDPOINTS.POSTS.BASE, data);
  },

  async updatePost(id: string, data: UpdatePostRequest): Promise<Post> {
    return await apiClient.patch<Post>(API_ENDPOINTS.POSTS.BY_ID(id), data);
  },

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.POSTS.BY_ID(id));
  },

  // === POST STATUS MANAGEMENT ===
  async publishPost(id: string): Promise<Post> {
    return await apiClient.post<Post>(API_ENDPOINTS.POSTS.PUBLISH(id));
  },

  async archivePost(id: string): Promise<Post> {
    return await apiClient.post<Post>(API_ENDPOINTS.POSTS.ARCHIVE(id));
  },

  async republishPost(id: string): Promise<Post> {
    return await apiClient.post<Post>(
      `${API_ENDPOINTS.POSTS.BY_ID(id)}/republish`,
    );
  },

  // === MY POSTS ===
  async getMyPosts(query: GetPostsQuery = {}): Promise<{
    posts: PostPaginationResult;
    statusCounts: Record<string, number>;
  }> {
    // Server trả về object với posts và statusCounts
    const response = await apiClient.get<{
      posts: PaginatedResponse<Post>;
      statusCounts: Record<string, number>;
    }>(API_ENDPOINTS.POSTS.MY_POSTS, query);

    return {
      posts: {
        data: response.posts.data,
        meta: response.posts.meta,
      },
      statusCounts: response.statusCounts,
    };
  },

  // === FOLLOWED POSTS (FEED) ===
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

  // === UTILITY METHODS ===
  async getPostStatusCounts(): Promise<Record<string, number>> {
    // Sử dụng getMyPosts với limit nhỏ để lấy statusCounts
    const response = await this.getMyPosts({ limit: 1 });
    return response.statusCounts;
  },
};
