export interface UserAnalytics {
  accountAge: number;
  lastActiveDate: Date | null;
  // Customer specific
  totalOrders?: number;
  totalSpent?: number;
  averageOrderValue?: number;
  favoriteCategories?: Array<{ category: string; count: number }>;
  followingCount?: number;
  reviewsWritten?: number;
  // Artisan specific
  totalSales?: number;
  totalRevenue?: number;
  followerCount?: number;
  averageRating?: number;
  totalReviews?: number;
  totalProducts?: number;
  totalPosts?: number;
  engagementRate?: number;
}

export interface ArtisanBusinessAnalytics {
  salesMetrics: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  salesTrends: Array<{
    period: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    orderCount: number;
    averageRating: number;
  }>;
  customerMetrics: {
    totalCustomers: number;
    repeatCustomers: number;
    newCustomers: number;
    customerRetentionRate: number;
  };
  engagementMetrics: {
    followerGrowth: Array<{ period: string; count: number }>;
    postPerformance: {
      totalPosts: number;
      averageLikes: number;
      averageComments: number;
      totalViews: number;
    };
  };
}

export interface PlatformAnalytics {
  userMetrics: {
    totalUsers: number;
    totalArtisans: number;
    totalCustomers: number;
    activeUsers: number;
    newUsersThisMonth: number;
  };
  businessMetrics: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalProducts: number;
    totalCategories: number;
  };
  growthTrends: Array<{
    period: string;
    newUsers: number;
    newArtisans: number;
    revenue: number;
    orders: number;
  }>;
  topArtisans: Array<{
    id: string;
    shopName: string;
    revenue: number;
    rating: number;
    followerCount: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    artisanName: string;
    revenue: number;
    viewCount: number;
  }>;
}
