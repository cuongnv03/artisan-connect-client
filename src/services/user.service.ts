import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { User } from '../types/auth';
import {
  Profile,
  Address,
  UpdateProfileRequest,
  UpdateUserProfileRequest,
  CreateAddressRequest,
} from '../types/user';
import { PaginatedResponse, SearchParams } from '../types/common';

export interface SearchUsersQuery extends SearchParams {
  role?: string;
}

export const userService = {
  async getUserProfile(id: string): Promise<User> {
    return await apiClient.get<User>(API_ENDPOINTS.USERS.BY_ID(id));
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return await apiClient.patch<User>(API_ENDPOINTS.USERS.PROFILE, data);
  },

  async getProfile(): Promise<Profile> {
    return await apiClient.get<Profile>(`${API_ENDPOINTS.USERS.PROFILE}/me`);
  },

  async updateUserProfile(data: UpdateUserProfileRequest): Promise<Profile> {
    return await apiClient.patch<Profile>(
      `${API_ENDPOINTS.USERS.PROFILE}/extended`,
      data,
    );
  },

  async searchUsers(query: SearchUsersQuery): Promise<PaginatedResponse<User>> {
    return await apiClient.get<PaginatedResponse<User>>(
      API_ENDPOINTS.USERS.SEARCH,
      query,
    );
  },

  async followUser(userId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.USERS.FOLLOW(userId));
  },

  async unfollowUser(userId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.USERS.FOLLOW(userId));
  },

  async getFollowers(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<User>> {
    return await apiClient.get<PaginatedResponse<User>>(
      API_ENDPOINTS.USERS.FOLLOWERS(userId),
      { page, limit },
    );
  },

  async getFollowing(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<User>> {
    return await apiClient.get<PaginatedResponse<User>>(
      API_ENDPOINTS.USERS.FOLLOWING(userId),
      { page, limit },
    );
  },

  // Address management
  async getAddresses(): Promise<Address[]> {
    return await apiClient.get<Address[]>(API_ENDPOINTS.USERS.ADDRESSES);
  },

  async createAddress(data: CreateAddressRequest): Promise<Address> {
    return await apiClient.post<Address>(API_ENDPOINTS.USERS.ADDRESSES, data);
  },

  async updateAddress(
    id: string,
    data: Partial<CreateAddressRequest>,
  ): Promise<Address> {
    return await apiClient.patch<Address>(
      `${API_ENDPOINTS.USERS.ADDRESSES}/${id}`,
      data,
    );
  },

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.USERS.ADDRESSES}/${id}`);
  },

  async setDefaultAddress(id: string): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.USERS.ADDRESSES}/${id}/default`);
  },

  async getDefaultAddress(): Promise<Address> {
    return await apiClient.get<Address>(API_ENDPOINTS.USERS.ADDRESSES_DEFAULT);
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.USERS.DELETE_ACCOUNT);
  },
};
