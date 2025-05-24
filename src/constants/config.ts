export const APP_CONFIG = {
  APP_NAME: 'Artisan Connect',
  APP_DESCRIPTION: 'Kết nối nghệ nhân với khách hàng',
  APP_VERSION: '1.0.0',

  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  API_TIMEOUT: 30000,

  // Upload Configuration
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES_PER_UPLOAD: 10,
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Vietnamese locale
  LOCALE: 'vi-VN',
  CURRENCY: 'VND',
  TIMEZONE: 'Asia/Ho_Chi_Minh',

  // Social Media
  SOCIAL_LINKS: {
    facebook: 'https://facebook.com/artisanconnect',
    instagram: 'https://instagram.com/artisanconnect',
    youtube: 'https://youtube.com/artisanconnect',
    email: 'contact@artisanconnect.vn',
    phone: '+84 123 456 789',
  },

  // Features
  FEATURES: {
    SOCKET_ENABLED: true,
    ANALYTICS_ENABLED: true,
    CHAT_ENABLED: true,
    NOTIFICATIONS_ENABLED: true,
    PWA_ENABLED: true,
  },

  // Cache
  CACHE_DURATION: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/profile',
  SHOP: '/shop',
  CART: '/cart',
  ORDERS: '/orders',
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  ADMIN: '/admin',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFERENCES: 'userPreferences',
  CART_ITEMS: 'cartItems',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;
