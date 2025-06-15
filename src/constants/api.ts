export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_PREFIX = '/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    SEND_VERIFICATION_EMAIL: '/auth/send-verification-email',
    CHANGE_PASSWORD: '/auth/change-password',
    ME: '/auth/me',
  },

  // Users
  USERS: {
    BASE: '/users',
    SEARCH: '/users/search',
    PROFILE: '/users/profile',
    ADDRESSES: '/users/addresses',
    ADDRESSES_DEFAULT: '/users/addresses/default',
    FOLLOW: (userId: string) => `/users/${userId}/follow`,
    FOLLOWERS: (userId: string) => `/users/${userId}/followers`,
    FOLLOWING: (userId: string) => `/users/${userId}/following`,
    FOLLOW_STATS: (userId: string) => `/users/${userId}/follow-stats`,
    DELETE_ACCOUNT: '/users/account',
    BY_ID: (id: string) => `/users/${id}`,
  },

  // Artisans
  ARTISANS: {
    BASE: '/artisans',
    SEARCH: '/artisans/search',
    TOP: '/artisans/top',
    FEATURED: '/artisans/featured',
    SPECIALTY: (specialty: string) => `/artisans/specialty/${specialty}`,
    PROFILE: '/artisans/profile',
    PROFILE_BY_ID: (id: string) => `/artisans/profile/${id}`,
    PROFILE_BY_USER: (userId: string) => `/artisans/profile/user/${userId}`,
    UPGRADE_REQUEST: '/artisans/upgrade-request',
    UPGRADE_REQUEST_STATUS: '/artisans/upgrade-request/status',
    // STATS: '/artisans/stats',
    // Admin routes
    ADMIN: {
      UPGRADE_REQUESTS: '/artisans/admin/upgrade-requests',
      APPROVE_UPGRADE: (id: string) =>
        `/artisans/admin/upgrade-requests/${id}/approve`,
      REJECT_UPGRADE: (id: string) =>
        `/artisans/admin/upgrade-requests/${id}/reject`,
      VERIFY: (profileId: string) => `/artisans/admin/verify/${profileId}`,
    },
  },

  // Posts
  POSTS: {
    BASE: '/posts',
    BY_SLUG: (slug: string) => `/posts/slug/${slug}`,
    BY_ID: (id: string) => `/posts/${id}`,
    PUBLISH: (id: string) => `/posts/${id}/publish`,
    ARCHIVE: (id: string) => `/posts/${id}/archive`,
    MY_POSTS: '/posts/user/me',
    FEED: '/posts/feed/followed',
  },

  // Social
  SOCIAL: {
    LIKE: '/social/like',
    POST_LIKES: (postId: string) => `/social/posts/${postId}/likes`,
    COMMENT_LIKES: (commentId: string) => `/social/comments/${commentId}/likes`,
    COMMENTS: '/social/comments',
    COMMENT_BY_ID: (id: string) => `/social/comments/${id}`,
    POST_COMMENTS: (postId: string) => `/social/posts/${postId}/comments`,
    COMMENT_REPLIES: (commentId: string) =>
      `/social/comments/${commentId}/replies`,
    SAVED_POSTS: '/social/saved-posts',
    TOGGLE_SAVE: '/social/saved-posts/toggle',
    CHECK_SAVED: (postId: string) => `/social/saved-posts/check/${postId}`,
  },

  // Products
  PRODUCTS: {
    BASE: '/products',
    SEARCH: '/products/search',
    BY_SLUG: (slug: string) => `/products/slug/${slug}`,
    BY_ID: (id: string) => `/products/${id}`,
    MY_PRODUCTS: '/products/my/products',
    MY_STATS: '/products/my/stats',
    PRICE_HISTORY: (id: string) => `/products/${id}/price-history`,
    UPDATE_PRICE: (id: string) => `/products/${id}/price`,
    PUBLISH: (id: string) => `/products/${id}/publish`,
    UNPUBLISH: (id: string) => `/products/${id}/unpublish`,
  },

  // Categories
  CATEGORIES: {
    BASE: '/categories',
    TREE: '/categories/tree',
    BY_ID: (id: string) => `/categories/${id}`,
    BY_SLUG: (slug: string) => `/categories/slug/${slug}`,

    // Attribute Templates
    ATTRIBUTE_TEMPLATES: (categoryId: string) =>
      `/categories/${categoryId}/attributes`,
    ATTRIBUTE_TEMPLATE_BY_ID: (templateId: string) =>
      `/categories/templates/${templateId}`,
  },

  // Cart
  CART: {
    BASE: '/cart',
    SUMMARY: '/cart/summary',
    COUNT: '/cart/count',
    VALIDATE: '/cart/validate',
    ITEM: (productId: string) => `/cart/${productId}`,
  },

  // Orders
  ORDERS: {
    FROM_CART: '/orders/from-cart',
    FROM_QUOTE: '/orders/from-quote',
    MY_ORDERS: '/orders/my-orders',
    SELLER_ORDERS: '/orders/seller-orders',
    STATS: '/orders/stats',
    BY_NUMBER: (orderNumber: string) => `/orders/number/${orderNumber}`,
    BY_ID: (id: string) => `/orders/${id}`,
    HISTORY: (id: string) => `/orders/${id}/history`,
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    PAYMENT: (id: string) => `/orders/${id}/payment`,
  },

  // Quotes
  QUOTES: {
    BASE: '/quotes',
    MY_QUOTES: '/quotes/my-quotes',
    STATS: '/quotes/stats',
    BY_ID: (id: string) => `/quotes/${id}`,
    RESPOND: (id: string) => `/quotes/${id}/respond`,
    MESSAGES: (id: string) => `/quotes/${id}/messages`,
    HISTORY: (id: string) => `/quotes/${id}/history`,
    CANCEL: (id: string) => `/quotes/${id}/cancel`,
  },

  // Reviews
  REVIEWS: {
    BASE: '/reviews',
    BY_ID: (id: string) => `/reviews/${id}`,
    PRODUCT_REVIEWS: (productId: string) => `/reviews/product/${productId}`,
    PRODUCT_STATS: (productId: string) =>
      `/reviews/product/${productId}/statistics`,
    USER_REVIEWS: '/reviews/user/me',
    REVIEWABLE_PRODUCTS: '/reviews/user/reviewable-products',
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },

  // Messages
  MESSAGES: {
    BASE: '/messages',
    CONVERSATIONS: '/messages/conversations',
    CONVERSATION: (userId: string) => `/messages/conversations/${userId}`,
    UNREAD_COUNT: '/messages/unread-count',
    MARK_READ: (id: string) => `/messages/${id}/read`,
    MARK_CONVERSATION_READ: (userId: string) =>
      `/messages/conversations/${userId}/read`,
    MEDIA: '/messages/media',
    QUOTE_DISCUSSION: '/messages/quote-discussion',
    CUSTOM_ORDER: '/messages/custom-order',
    NEGOTIATIONS: '/messages/negotiations',
    NEGOTIATION_HISTORY: (negotiationId: string) =>
      `/messages/negotiations/${negotiationId}/history`,
    UPDATE_PROPOSAL: (negotiationId: string) =>
      `/messages/negotiations/${negotiationId}/proposal`,
    CANCEL_NEGOTIATION: (negotiationId: string) =>
      `/messages/negotiations/${negotiationId}/cancel`,
  },

  // Analytics
  ANALYTICS: {
    TRENDING: '/analytics/trending',
    TRACK_VIEW: '/analytics/track/view',
    TRACK_CONVERSION: '/analytics/track/conversion',
    POST_ANALYTICS: (postId: string) => `/analytics/posts/${postId}`,
    POST_INSIGHTS: (postId: string) => `/analytics/posts/${postId}/insights`,
    SUMMARY: '/analytics/summary',
  },

  // Upload
  UPLOAD: {
    IMAGE: '/upload/image',
    VIDEO: '/upload/video',
    MULTIPLE: '/upload/multiple',
    DELETE: (publicId: string) => `/upload/${publicId}`,
  },
} as const;
