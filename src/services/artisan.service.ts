import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  ArtisanProfile,
  ArtisanUpgradeRequest,
  CreateArtisanProfileRequest,
  UpdateArtisanProfileRequest,
  UpgradeRequestData,
  SearchArtisansQuery,
  SuggestedArtisansQuery,
  UpgradeRequestStatusResponse,
} from '../types/artisan';
import { PaginatedResponse } from '../types/common';
import { User } from '../types/auth';

export const artisanService = {
  // Discovery methods
  async searchArtisans(
    query: SearchArtisansQuery,
  ): Promise<PaginatedResponse<ArtisanProfile & { user: User }>> {
    return await apiClient.get<
      PaginatedResponse<ArtisanProfile & { user: User }>
    >(API_ENDPOINTS.ARTISANS.SEARCH, query);
  },

  async getTopArtisans(
    limit = 10,
  ): Promise<(ArtisanProfile & { user: User })[]> {
    return await apiClient.get<(ArtisanProfile & { user: User })[]>(
      API_ENDPOINTS.ARTISANS.TOP,
      { limit },
    );
  },

  async getFeaturedArtisans(): Promise<(ArtisanProfile & { user: User })[]> {
    return await apiClient.get<(ArtisanProfile & { user: User })[]>(
      API_ENDPOINTS.ARTISANS.FEATURED,
    );
  },

  async getArtisansBySpecialty(
    specialty: string,
    limit = 10,
  ): Promise<(ArtisanProfile & { user: User })[]> {
    return await apiClient.get<(ArtisanProfile & { user: User })[]>(
      API_ENDPOINTS.ARTISANS.SPECIALTY(specialty),
      { limit },
    );
  },

  async getSuggestedArtisans(
    query?: SuggestedArtisansQuery,
  ): Promise<PaginatedResponse<ArtisanProfile & { user: User }>> {
    return await apiClient.get<
      PaginatedResponse<ArtisanProfile & { user: User }>
    >(API_ENDPOINTS.ARTISANS.SUGGESTIONS, query);
  },

  // Profile methods
  async getArtisanProfile(
    id: string,
  ): Promise<ArtisanProfile & { user: User }> {
    return await apiClient.get<ArtisanProfile & { user: User }>(
      API_ENDPOINTS.ARTISANS.PROFILE_BY_ID(id),
    );
  },

  async getArtisanProfileByUserId(
    userId: string,
  ): Promise<ArtisanProfile & { user: User }> {
    return await apiClient.get<ArtisanProfile & { user: User }>(
      API_ENDPOINTS.ARTISANS.PROFILE_BY_USER(userId),
    );
  },

  async getMyArtisanProfile(): Promise<ArtisanProfile> {
    return await apiClient.get<ArtisanProfile>(
      `${API_ENDPOINTS.ARTISANS.PROFILE}/me`,
    );
  },

  async createArtisanProfile(
    data: CreateArtisanProfileRequest,
  ): Promise<ArtisanProfile> {
    return await apiClient.post<ArtisanProfile>(
      API_ENDPOINTS.ARTISANS.PROFILE,
      data,
    );
  },

  async updateArtisanProfile(
    data: UpdateArtisanProfileRequest,
  ): Promise<ArtisanProfile> {
    return await apiClient.patch<ArtisanProfile>(
      API_ENDPOINTS.ARTISANS.PROFILE,
      data,
    );
  },

  async deleteArtisanProfile(): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ARTISANS.PROFILE);
  },

  // Upgrade requests
  async requestUpgrade(
    data: UpgradeRequestData,
  ): Promise<ArtisanUpgradeRequest> {
    return await apiClient.post<ArtisanUpgradeRequest>(
      API_ENDPOINTS.ARTISANS.UPGRADE_REQUEST,
      data,
    );
  },

  async getUpgradeRequestStatus(): Promise<UpgradeRequestStatusResponse | null> {
    try {
      return await apiClient.get<UpgradeRequestStatusResponse>(
        API_ENDPOINTS.ARTISANS.UPGRADE_REQUEST_STATUS,
      );
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }, 

  async updateUpgradeRequest(
    data: UpgradeRequestData,
  ): Promise<ArtisanUpgradeRequest> {
    return await apiClient.patch<ArtisanUpgradeRequest>(
      API_ENDPOINTS.ARTISANS.UPGRADE_REQUEST,
      data,
    );
  },

  async customizeTemplate(data: { templateId: string; config: any }) {
    throw new Error('Theme customization is frontend only');
  },

  // async getArtisanStats(): Promise<any> {
  //   return await apiClient.get<any>(API_ENDPOINTS.ARTISANS.STATS);
  // },

  // Admin methods
  async getUpgradeRequests(
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<PaginatedResponse<ArtisanUpgradeRequest & { user: User }>> {
    return await apiClient.get<
      PaginatedResponse<ArtisanUpgradeRequest & { user: User }>
    >(API_ENDPOINTS.ARTISANS.ADMIN.UPGRADE_REQUESTS, { page, limit, status });
  },

  async approveUpgradeRequest(id: string, adminNotes?: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.ARTISANS.ADMIN.APPROVE_UPGRADE(id), {
      adminNotes,
    });
  },

  async rejectUpgradeRequest(id: string, adminNotes: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.ARTISANS.ADMIN.REJECT_UPGRADE(id), {
      adminNotes,
    });
  },

  async verifyArtisan(profileId: string, isVerified: boolean): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.ARTISANS.ADMIN.VERIFY(profileId), {
      isVerified,
    });
  },
};
