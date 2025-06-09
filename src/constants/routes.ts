export const ROUTE_PATHS = {
  // Public routes
  HOME: '/',
  LANDING: '/',

  // Auth routes
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email/:token',
  },

  // Main app routes
  APP: {
    HOME: '/home',
    DISCOVER: '/discover',
    DISCOVER_SEARCH: '/discover/search',
    DISCOVER_TRENDING: '/discover/trending',

    // Posts
    CREATE_POST: '/create-post',
    POSTS: '/posts',
    MY_POSTS: '/posts/my-posts',
    POST_DETAIL: '/posts/:postId',
    EDIT_POST: '/posts/:postId/edit',

    // Shop
    SHOP: '/shop',
    SHOP_SEARCH: '/shop/search',
    SHOP_CATEGORY: '/shop/category/:categorySlug',
    PRODUCT_DETAIL: '/products/:productId',

    // Profile
    PROFILE: '/profile',
    PROFILE_USER: '/profile/:userId',
    EDIT_PROFILE: '/profile/edit',
    ADDRESSES: '/profile/addresses',
    SETTINGS: '/settings',

    // Cart & Orders
    CART: '/cart',
    CHECKOUT: '/checkout',
    ORDERS: '/orders',
    ORDER_DETAIL: '/orders/:orderId',
    ORDER_TRACKING: '/orders/tracking/:trackingNumber',

    // Messages
    MESSAGES: '/messages',
    CONVERSATION: '/messages/:userId',

    // Notifications
    NOTIFICATIONS: '/notifications',

    // Artisan
    UPGRADE_REQUEST: '/upgrade-to-artisan',
    ARTISAN: {
      DASHBOARD: '/artisan/dashboard',
      PRODUCTS: '/artisan/products',
      CREATE_PRODUCT: '/artisan/products/create',
      EDIT_PRODUCT: '/artisan/products/:productId/edit',
      ANALYTICS: '/artisan/analytics',
      CUSTOMIZE: '/artisan/customize',
    },
  },

  // Admin routes
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    ARTISAN_REQUESTS: '/admin/artisan-requests',
    CONTENT_MODERATION: '/admin/content',
    SYSTEM_SETTINGS: '/admin/settings',
  },

  // Error routes
  ERROR: {
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/unauthorized',
    SERVER_ERROR: '/server-error',
  },
} as const;

export const getRoutePath = (
  path: string,
  params: Record<string, string> = {},
) => {
  let result = path;

  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value);
  });

  return result;
};

// Helper functions cho artisan routes
export const getArtisanRoutes = {
  editProduct: (productId: string) =>
    getRoutePath(ROUTE_PATHS.APP.ARTISAN.EDIT_PRODUCT, { productId }),

  productDetail: (productId: string) =>
    getRoutePath(ROUTE_PATHS.APP.PRODUCT_DETAIL, { productId }),
};

// Route metadata for navigation
export const ROUTE_META = {
  [ROUTE_PATHS.APP.HOME]: {
    title: 'Trang chủ',
    description: 'Feed bài viết từ nghệ nhân',
    requiresAuth: true,
  },
  [ROUTE_PATHS.APP.DISCOVER]: {
    title: 'Khám phá',
    description: 'Tìm kiếm nghệ nhân và sản phẩm',
    requiresAuth: true,
  },
  [ROUTE_PATHS.APP.SHOP]: {
    title: 'Cửa hàng',
    description: 'Mua sắm sản phẩm thủ công',
    requiresAuth: true,
  },
  [ROUTE_PATHS.APP.CART]: {
    title: 'Giỏ hàng',
    description: 'Quản lý giỏ hàng',
    requiresAuth: true,
  },
  [ROUTE_PATHS.APP.ORDERS]: {
    title: 'Đơn hàng',
    description: 'Quản lý đơn hàng',
    requiresAuth: true,
  },
  [ROUTE_PATHS.APP.MESSAGES]: {
    title: 'Tin nhắn',
    description: 'Trò chuyện với nghệ nhân',
    requiresAuth: true,
  },
  [ROUTE_PATHS.APP.NOTIFICATIONS]: {
    title: 'Thông báo',
    description: 'Thông báo hoạt động',
    requiresAuth: true,
  },
  [ROUTE_PATHS.APP.PROFILE]: {
    title: 'Trang cá nhân',
    description: 'Thông tin cá nhân',
    requiresAuth: true,
  },
} as const;
