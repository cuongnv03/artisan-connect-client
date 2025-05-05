import api from './api';
import { PaginatedResponse } from '../types/api.types';
import {
  ArtisanProfile,
  ArtisanProfileWithUser,
  CreateArtisanProfileDto,
  UpdateArtisanProfileDto,
  GenerateTemplateDto,
  TemplateResult,
  ArtisanUpgradeRequestDto,
  UpgradeRequest,
  UpgradeRequestWithUser,
} from '../types/artisan.types';
import { UserWithArtisanProfile } from '../types/user.types';

export interface ArtisanQueryOptions {
  search?: string;
  categoryId?: string;
  specialties?: string[];
  isVerified?: boolean;
  sortBy?: 'rating' | 'followerCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const ArtisanService = {
  // Get current user's artisan profile
  getMyProfile: async (): Promise<ArtisanProfileWithUser> => {
    const response = await api.get('/artisan-profiles');
    return response.data.data;
  },

  // Get artisan profile by ID
  getProfileById: async (id: string): Promise<ArtisanProfileWithUser> => {
    const response = await api.get(`/artisan-profiles/${id}`);
    return response.data.data;
  },

  // Get artisan profile by user ID
  getProfileByUserId: async (
    userId: string,
  ): Promise<ArtisanProfileWithUser> => {
    const response = await api.get(`/artisan-profiles/user/${userId}`);
    return response.data.data;
  },

  // Create artisan profile
  createProfile: async (
    data: CreateArtisanProfileDto,
  ): Promise<ArtisanProfileWithUser> => {
    const response = await api.post('/artisan-profiles', data);
    return response.data.data;
  },

  // Update artisan profile
  updateProfile: async (
    data: UpdateArtisanProfileDto,
  ): Promise<ArtisanProfileWithUser> => {
    const response = await api.patch('/artisan-profiles', data);
    return response.data.data;
  },

  // Generate template
  generateTemplate: async (
    data: GenerateTemplateDto,
  ): Promise<TemplateResult> => {
    const response = await api.post(
      '/artisan-profiles/generate-template',
      data,
    );
    return response.data.data;
  },

  // Get default templates
  getDefaultTemplates: async (): Promise<any[]> => {
    const response = await api.get('/artisan-profiles/templates');
    return response.data.data;
  },

  // Request upgrade to artisan
  requestUpgrade: async (
    data: ArtisanUpgradeRequestDto,
  ): Promise<UpgradeRequest> => {
    const response = await api.post('/artisan-profiles/upgrade-request', data);
    return response.data.data;
  },

  // Get upgrade request status
  getUpgradeRequestStatus: async (): Promise<any> => {
    const response = await api.get('/artisan-profiles/upgrade-request/status');
    return response.data.data;
  },

  // Get all upgrade requests (admin only)
  getUpgradeRequests: async (
    status?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<UpgradeRequestWithUser>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(
      `/artisan-profiles/upgrade-requests?${params.toString()}`,
    );
    return response.data.data;
  },

  // Approve upgrade request (admin only)
  approveUpgradeRequest: async (
    id: string,
    adminNotes?: string,
  ): Promise<UpgradeRequest> => {
    const response = await api.post(
      `/artisan-profiles/upgrade-requests/${id}/approve`,
      { adminNotes },
    );
    return response.data.data;
  },

  // Reject upgrade request (admin only)
  rejectUpgradeRequest: async (
    id: string,
    adminNotes: string,
  ): Promise<UpgradeRequest> => {
    const response = await api.post(
      `/artisan-profiles/upgrade-requests/${id}/reject`,
      { adminNotes },
    );
    return response.data.data;
  },

  getArtisans: async (
    options: ArtisanQueryOptions = {},
  ): Promise<PaginatedResponse<UserWithArtisanProfile>> => {
    const response = await api.get('/artisans', { params: options });
    return response.data.data;
  },

  getArtisanById: async (id: string): Promise<UserWithArtisanProfile> => {
    const response = await api.get(`/artisans/${id}`);
    return response.data.data;
  },

  getArtisanByUsername: async (
    username: string,
  ): Promise<UserWithArtisanProfile> => {
    const response = await api.get(`/artisans/username/${username}`);
    return response.data.data;
  },

  getPopularArtisans: async (
    limit: number = 5,
  ): Promise<UserWithArtisanProfile[]> => {
    const response = await api.get('/artisans/popular', {
      params: { limit },
    });
    return response.data.data;
  },
};
