import api from './api';
import { User } from '../types/user.types';
import { PaginatedResponse } from '../types/api.types';

export interface FollowQueryOptions {
  page?: number;
  limit?: number;
}

export const FollowService = {
  getFollowing: async (
    options: FollowQueryOptions = {},
  ): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/social/following', { params: options });
    return response.data.data;
  },

  getFollowers: async (
    options: FollowQueryOptions = {},
  ): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/social/followers', { params: options });
    return response.data.data;
  },

  followUser: async (userId: string): Promise<void> => {
    await api.post('/social/follow', { userId });
  },

  unfollowUser: async (userId: string): Promise<void> => {
    await api.delete('/social/follow', { data: { userId } });
  },

  getUserFollowing: async (
    userId: string,
    options: FollowQueryOptions = {},
  ): Promise<PaginatedResponse<User>> => {
    const response = await api.get(`/social/users/${userId}/following`, {
      params: options,
    });
    return response.data.data;
  },

  getUserFollowers: async (
    userId: string,
    options: FollowQueryOptions = {},
  ): Promise<PaginatedResponse<User>> => {
    const response = await api.get(`/social/users/${userId}/followers`, {
      params: options,
    });
    return response.data.data;
  },
};
