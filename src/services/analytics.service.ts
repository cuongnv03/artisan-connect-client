import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  UserAnalytics,
  ArtisanBusinessAnalytics,
  PlatformAnalytics,
} from '../types/analytics';

export interface GetAnalyticsQuery {
  period?: '7d' | '30d' | '3m' | '6m' | '1y';
}

export interface TrendingPostsQuery {
  period: 'day' | 'week' | 'month';
  limit?: number;
}

export const analyticsService = {
  async getTrendingPosts(query: TrendingPostsQuery): Promise<any[]> {
    // Mock implementation - thay thế bằng API call thực
    return Promise.resolve([]);
  },

  // === USER ANALYTICS ===
  async getUserAnalytics(): Promise<UserAnalytics> {
    return await apiClient.get<UserAnalytics>(API_ENDPOINTS.ANALYTICS.USER);
  },

  // === ARTISAN ANALYTICS ===
  async getArtisanDashboard(
    period: string = '30d',
  ): Promise<ArtisanBusinessAnalytics> {
    return await apiClient.get<ArtisanBusinessAnalytics>(
      API_ENDPOINTS.ANALYTICS.ARTISAN_DASHBOARD,
      { period },
    );
  },

  async getArtisanDashboardById(
    artisanId: string,
    period: string = '30d',
  ): Promise<ArtisanBusinessAnalytics> {
    return await apiClient.get<ArtisanBusinessAnalytics>(
      API_ENDPOINTS.ANALYTICS.ARTISAN_DASHBOARD_BY_ID(artisanId),
      { period },
    );
  },

  // === PLATFORM ANALYTICS (Admin only) ===
  async getPlatformDashboard(
    period: string = '30d',
  ): Promise<PlatformAnalytics> {
    return await apiClient.get<PlatformAnalytics>(
      API_ENDPOINTS.ANALYTICS.PLATFORM_DASHBOARD,
      { period },
    );
  },
};
