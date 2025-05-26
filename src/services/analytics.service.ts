import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { PostAnalytics } from '../types/post';
import { PaginatedResponse } from '../types/common';

export interface TrackViewEventRequest {
  postId: string;
  sessionId?: string;
  referrer?: string;
  readTime?: number;
}

export interface TrackConversionEventRequest {
  postId: string;
  conversionType: string;
  metadata?: Record<string, any>;
}

export interface GetInsightsQuery {
  period?: 'day' | 'week' | 'month' | 'year';
  dateFrom?: string;
  dateTo?: string;
}

export interface GetTrendingPostsQuery {
  period?: 'day' | 'week' | 'month';
  category?: string;
  limit?: number;
}

export interface PostInsights {
  viewCount: number;
  uniqueViewers: number;
  avgReadTime: number;
  conversionCount: number;
  engagementRate: number;
  topReferrers: Array<{
    referrer: string;
    count: number;
  }>;
  viewsByDay: Array<{
    date: string;
    views: number;
  }>;
}

export interface UserAnalyticsSummary {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  followerGrowth: number;
  engagementRate: number;
  topPerformingPosts: Array<{
    postId: string;
    title: string;
    viewCount: number;
    conversionCount: number;
  }>;
  viewsByDay?: Array<{
    date: string;
    views: number;
  }>;
}

export const analyticsService = {
  // Tracking events
  async trackViewEvent(data: TrackViewEventRequest): Promise<void> {
    await apiClient.post(API_ENDPOINTS.ANALYTICS.TRACK_VIEW, data);
  },

  async trackConversionEvent(data: TrackConversionEventRequest): Promise<void> {
    await apiClient.post(API_ENDPOINTS.ANALYTICS.TRACK_CONVERSION, data);
  },

  // Post analytics
  async getPostAnalytics(postId: string): Promise<PostAnalytics> {
    return await apiClient.get<PostAnalytics>(
      API_ENDPOINTS.ANALYTICS.POST_ANALYTICS(postId),
    );
  },

  async getPostInsights(
    postId: string,
    query: GetInsightsQuery = {},
  ): Promise<PostInsights> {
    return await apiClient.get<PostInsights>(
      API_ENDPOINTS.ANALYTICS.POST_INSIGHTS(postId),
      query,
    );
  },

  // Trending content
  async getTrendingPosts(query: GetTrendingPostsQuery = {}): Promise<any[]> {
    return await apiClient.get<any[]>(API_ENDPOINTS.ANALYTICS.TRENDING, query);
  },

  // User analytics
  async getUserAnalyticsSummary(): Promise<UserAnalyticsSummary> {
    return await apiClient.get<UserAnalyticsSummary>(
      API_ENDPOINTS.ANALYTICS.SUMMARY,
    );
  },
};
