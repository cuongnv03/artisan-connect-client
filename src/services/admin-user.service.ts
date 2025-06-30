import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  AdminUserSearchDto,
  AdminUserListDto,
  AdminUserDetailDto,
  UserStatsDto,
} from '../types/admin-user';

export const adminUserService = {
  async getUsers(params: AdminUserSearchDto): Promise<AdminUserListDto> {
    return await apiClient.get<AdminUserListDto>(
      API_ENDPOINTS.USERS.ADMIN.USERS,
      params,
    );
  },

  async getUserDetails(id: string): Promise<AdminUserDetailDto> {
    return await apiClient.get<AdminUserDetailDto>(
      API_ENDPOINTS.USERS.ADMIN.USER_BY_ID(id),
    );
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.USERS.ADMIN.USER_BY_ID(id));
  },

  async getUserStats(): Promise<UserStatsDto> {
    return await apiClient.get<UserStatsDto>(
      API_ENDPOINTS.USERS.ADMIN.USER_STATS,
    );
  },
};
