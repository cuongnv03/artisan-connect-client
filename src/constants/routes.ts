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

  // ============================================================================
  // MAIN APP ROUTES (Customer + Artisan based on permissions)
  // ============================================================================
  APP: {
    // === HOME & DISCOVERY ===
    HOME: '/home', // Feed posts - API: /posts/feed/followed
    DISCOVER: '/discover', // Discovery page with artisans/products
    SEARCH: '/search', // Search - API: /artisans/search, /products/search

    // === POSTS MODULE ===
    POSTS: {
      LIST: '/posts', // API: GET /posts
      DETAIL: '/posts/:slug', // API: GET /posts/slug/:slug
      CREATE: '/posts/create', // API: POST /posts (artisan only)
      EDIT: '/posts/:id/edit', // API: PUT /posts/:id (artisan only)
      MY_POSTS: '/posts/me', // API: GET /posts/user/me (artisan only)
    },

    // === PRODUCTS MODULE ===
    PRODUCTS: {
      LIST: '/products', // API: GET /products
      DETAIL: '/products/:slug', // API: GET /products/slug/:slug
      SEARCH: '/products/search', // API: GET /products/search
      CATEGORY: '/products/category/:categorySlug', // API: GET /categories/slug/:slug
      MY_PRODUCTS: '/products/manage', // API: GET /products/my/products (artisan only)
      CREATE: '/products/create', // API: POST /products (artisan only)
      EDIT: '/products/:id/edit', // API: PUT /products/:id (artisan only)
      STATS: '/products/stats', // API: GET /products/my/stats (artisan only)
    },

    // === ORDERS MODULE ===
    ORDERS: {
      MY_PURCHASES: '/orders/purchases', // API: GET /orders/my-orders (customer view)
      MY_SALES: '/orders/sales', // API: GET /orders/my-artisan-orders (artisan view)
      DETAIL: '/orders/:id', // API: GET /orders/:id
      TRACKING: '/orders/:orderNumber/tracking', // API: GET /orders/number/:orderNumber
    },

    // === CART MODULE ===
    CART: {
      VIEW: '/cart', // API: GET /cart
      CHECKOUT: '/checkout', // API: POST /orders/from-cart
    },

    // === CUSTOM ORDERS MODULE ===
    CUSTOM_ORDERS: {
      MY_REQUESTS: '/custom-orders/requests', // API: GET /custom-orders/my-orders (customer view)
      MY_RECEIVED: '/custom-orders/received', // API: GET /custom-orders/my-orders (artisan view)
      DETAIL: '/custom-orders/:id', // API: GET /custom-orders/:id
      CREATE: '/custom-orders/create', // API: POST /custom-orders
      STATS: '/custom-orders/stats', // API: GET /custom-orders/stats
    },

    // === PRICE NEGOTIATIONS MODULE ===
    NEGOTIATIONS: {
      MY_REQUESTS: '/negotiations/requests', // API: GET /negotiations/my-negotiations (customer view)
      MY_RECEIVED: '/negotiations/received', // API: GET /negotiations/my-negotiations (artisan view)
      DETAIL: '/negotiations/:id', // API: GET /negotiations/:id
      STATS: '/negotiations/stats', // API: GET /negotiations/stats
    },

    // === REVIEWS MODULE ===
    REVIEWS: {
      MY_REVIEWS: '/reviews/my-reviews', // API: GET /reviews/user/me
      REVIEWABLE: '/reviews/reviewable-products', // API: GET /reviews/user/reviewable-products
      PRODUCT_REVIEWS: '/reviews/product/:productId', // API: GET /reviews/product/:productId
    },

    // === SOCIAL MODULE ===
    SOCIAL: {
      WISHLIST: '/wishlist', // API: GET /social/wishlist
    },

    // === MESSAGING MODULE ===
    MESSAGES: {
      LIST: '/messages', // API: GET /messages/conversations
      CONVERSATION: '/messages/:userId', // API: GET /messages/conversations/:userId
    },

    // === NOTIFICATIONS MODULE ===
    NOTIFICATIONS: '/notifications', // API: GET /notifications

    // === USER & PROFILE MODULE ===
    PROFILE: {
      MY_PROFILE: '/profile', // API: GET /users/profile
      USER_PROFILE: '/profile/:userId', // API: GET /users/:id (artisan only)
      EDIT: '/profile/edit', // API: PUT /users/profile
      ADDRESSES: '/profile/addresses', // API: GET /users/addresses
      SETTINGS: '/settings', // Account settings
    },

    // === ARTISAN MODULE ===
    ARTISAN: {
      UPGRADE_REQUEST: '/artisan/upgrade', // API: POST /artisans/upgrade-request
      DASHBOARD: '/artisan/dashboard', // API: GET /analytics/artisan/dashboard (artisan only)
      ANALYTICS: '/artisan/analytics', // API: GET /analytics/artisan/dashboard (artisan only)
      PROFILE: '/artisan/profile', // API: GET /artisans/profile (artisan only)
      SHOP_CUSTOMIZE: '/artisan/customize', // API: PUT /artisans/profile (artisan only)
    },

    // === DISPUTES & RETURNS ===
    DISPUTES: {
      MY_DISPUTES: '/disputes/my-disputes', // API: GET /orders/disputes/my
      DETAIL: '/disputes/:id', // API: GET /orders/disputes/:id
    },

    RETURNS: {
      MY_RETURNS: '/returns/my-returns', // API: GET /orders/returns/my
      DETAIL: '/returns/:id', // API: GET /orders/returns/:id
    },
  },

  // ============================================================================
  // ADMIN ROUTES (Separate interface)
  // ============================================================================
  ADMIN: {
    ROOT: '/admin',

    // === DASHBOARD & ANALYTICS ===
    DASHBOARD: '/admin/dashboard', // API: GET /analytics/platform/dashboard
    ANALYTICS: '/admin/analytics', // API: GET /analytics/platform/dashboard

    // === USER MANAGEMENT ===
    USERS: '/admin/users', // API: GET /users/search
    USER_DETAIL: '/admin/users/:userId', // API: GET /users/:id

    // === ARTISAN MANAGEMENT ===
    ARTISAN_REQUESTS: '/admin/artisan-requests', // API: GET /artisans/admin/upgrade-requests
    ARTISAN_VERIFICATION: '/admin/artisan-verification', // API: POST /artisans/admin/verify/:profileId

    // === CONTENT MANAGEMENT ===
    POSTS_MANAGEMENT: '/admin/posts', // API: GET /posts (admin view)
    POST_DETAIL: '/admin/posts/:postId', // API: GET /posts/:id

    PRODUCTS_MANAGEMENT: '/admin/products', // API: GET /products (admin view)
    PRODUCT_DETAIL: '/admin/products/:productId', // API: GET /products/:id

    // === CATEGORY MANAGEMENT ===
    CATEGORIES: '/admin/categories', // API: GET /categories
    CATEGORY_DETAIL: '/admin/categories/:categoryId', // API: GET /categories/:id

    // === ORDER MANAGEMENT ===
    ORDERS: '/admin/orders', // API: GET /orders (admin view)
    ORDER_DETAIL: '/admin/orders/:orderId', // API: GET /orders/:id

    // === CUSTOM ORDERS MANAGEMENT ===
    CUSTOM_ORDERS: '/admin/custom-orders', // API: GET /custom-orders (admin view)
    CUSTOM_ORDER_DETAIL: '/admin/custom-orders/:orderId', // API: GET /custom-orders/:id

    // === PRICE NEGOTIATIONS MANAGEMENT ===
    NEGOTIATIONS: '/admin/negotiations', // API: GET /negotiations (admin view)
    NEGOTIATION_DETAIL: '/admin/negotiations/:negotiationId', // API: GET /negotiations/:id

    // === DISPUTES MANAGEMENT ===
    DISPUTES: '/admin/disputes', // API: GET /orders/admin/disputes
    DISPUTE_DETAIL: '/admin/disputes/:disputeId', // API: GET /orders/disputes/:id

    // === RETURNS MANAGEMENT ===
    RETURNS: '/admin/returns', // API: GET /orders/admin/returns
    RETURN_DETAIL: '/admin/returns/:returnId', // API: GET /orders/returns/:id

    // === REVIEWS MANAGEMENT ===
    REVIEWS: '/admin/reviews', // API: GET /reviews (admin view)

    // === NOTIFICATIONS MANAGEMENT ===
    NOTIFICATIONS: '/admin/notifications', // API: GET /notifications (admin view)
  },

  // ============================================================================
  // ERROR ROUTES
  // ============================================================================
  ERROR: {
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/unauthorized',
    FORBIDDEN: '/403',
    SERVER_ERROR: '/server-error',
  },
} as const;

// Helper function
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

// Route helpers
export const getRouteHelpers = {
  // Posts
  postDetail: (slug: string) =>
    getRoutePath(ROUTE_PATHS.APP.POSTS.DETAIL, { slug }),
  editPost: (id: string) => getRoutePath(ROUTE_PATHS.APP.POSTS.EDIT, { id }),

  // Products
  productDetail: (slug: string) =>
    getRoutePath(ROUTE_PATHS.APP.PRODUCTS.DETAIL, { slug }),
  editProduct: (id: string) =>
    getRoutePath(ROUTE_PATHS.APP.PRODUCTS.EDIT, { id }),

  // Orders
  orderDetail: (id: string) =>
    getRoutePath(ROUTE_PATHS.APP.ORDERS.DETAIL, { id }),
  orderTracking: (orderNumber: string) =>
    getRoutePath(ROUTE_PATHS.APP.ORDERS.TRACKING, { orderNumber }),

  // Custom Orders
  customOrderDetail: (id: string) =>
    getRoutePath(ROUTE_PATHS.APP.CUSTOM_ORDERS.DETAIL, { id }),

  // Negotiations
  negotiationDetail: (id: string) =>
    getRoutePath(ROUTE_PATHS.APP.NEGOTIATIONS.DETAIL, { id }),

  // Profile
  userProfile: (userId: string) =>
    getRoutePath(ROUTE_PATHS.APP.PROFILE.USER_PROFILE, { userId }),

  // Admin
  adminUserDetail: (userId: string) =>
    getRoutePath(ROUTE_PATHS.ADMIN.USER_DETAIL, { userId }),
  adminOrderDetail: (orderId: string) =>
    getRoutePath(ROUTE_PATHS.ADMIN.ORDER_DETAIL, { orderId }),
};

// Route metadata với API mapping
export const ROUTE_META = {
  // === MAIN APP ROUTES ===
  [ROUTE_PATHS.APP.HOME]: {
    title: 'Bảng tin',
    description: 'Feed bài viết từ nghệ nhân theo dõi',
    requiresAuth: true,
    allowedRoles: ['CUSTOMER', 'ARTISAN'],
    api: 'GET /posts/feed/followed',
  },

  [ROUTE_PATHS.APP.POSTS.MY_POSTS]: {
    title: 'Bài viết của tôi',
    description: 'Quản lý bài viết',
    requiresAuth: true,
    allowedRoles: ['ARTISAN'],
    api: 'GET /posts/user/me',
  },

  [ROUTE_PATHS.APP.POSTS.CREATE]: {
    title: 'Tạo bài viết',
    description: 'Tạo bài viết mới',
    requiresAuth: true,
    allowedRoles: ['ARTISAN'],
    api: 'POST /posts',
  },

  [ROUTE_PATHS.APP.PRODUCTS.MY_PRODUCTS]: {
    title: 'Sản phẩm của tôi',
    description: 'Quản lý sản phẩm',
    requiresAuth: true,
    allowedRoles: ['ARTISAN'],
    api: 'GET /products/my/products',
  },

  [ROUTE_PATHS.APP.PRODUCTS.CREATE]: {
    title: 'Tạo sản phẩm',
    description: 'Tạo sản phẩm mới',
    requiresAuth: true,
    allowedRoles: ['ARTISAN'],
    api: 'POST /products',
  },

  [ROUTE_PATHS.APP.ORDERS.MY_SALES]: {
    title: 'Đơn hàng bán',
    description: 'Quản lý đơn hàng bán',
    requiresAuth: true,
    allowedRoles: ['ARTISAN'],
    api: 'GET /orders/my-artisan-orders',
  },

  [ROUTE_PATHS.APP.ARTISAN.DASHBOARD]: {
    title: 'Dashboard',
    description: 'Tổng quan kinh doanh',
    requiresAuth: true,
    allowedRoles: ['ARTISAN'],
    api: 'GET /analytics/artisan/dashboard',
  },

  // === ADMIN ROUTES ===
  [ROUTE_PATHS.ADMIN.DASHBOARD]: {
    title: 'Quản trị hệ thống',
    description: 'Tổng quan toàn hệ thống',
    requiresAuth: true,
    allowedRoles: ['ADMIN'],
    layout: 'admin',
    api: 'GET /analytics/platform/dashboard',
  },

  [ROUTE_PATHS.ADMIN.USERS]: {
    title: 'Quản lý người dùng',
    description: 'Quản lý tài khoản người dùng',
    requiresAuth: true,
    allowedRoles: ['ADMIN'],
    layout: 'admin',
    api: 'GET /users/search',
  },

  [ROUTE_PATHS.ADMIN.ARTISAN_REQUESTS]: {
    title: 'Yêu cầu nâng cấp artisan',
    description: 'Xử lý yêu cầu nâng cấp',
    requiresAuth: true,
    allowedRoles: ['ADMIN'],
    layout: 'admin',
    api: 'GET /artisans/admin/upgrade-requests',
  },
} as const;

// Navigation menus
export const NAVIGATION_MENUS = {
  CUSTOMER: [
    {
      path: ROUTE_PATHS.APP.HOME,
      label: 'Trang chủ',
      subtitle: 'Bảng tin',
      icon: 'home',
    },
    {
      path: ROUTE_PATHS.APP.DISCOVER,
      label: 'Khám phá',
      icon: 'search',
    },
    {
      path: ROUTE_PATHS.APP.PRODUCTS.LIST,
      label: 'Cửa hàng',
      icon: 'shopping-bag',
    },
    {
      path: ROUTE_PATHS.APP.ORDERS.MY_PURCHASES,
      label: 'Đơn hàng đặt',
      icon: 'shopping-cart',
    },
    {
      path: ROUTE_PATHS.APP.ARTISAN.UPGRADE_REQUEST,
      label: 'Trở thành nghệ nhân',
      icon: 'user-plus',
      highlight: true, // Để highlight menu này
    },
  ],

  ARTISAN: [
    {
      path: ROUTE_PATHS.APP.HOME,
      label: 'Trang chủ',
      icon: 'home',
    },
    {
      path: ROUTE_PATHS.APP.DISCOVER,
      label: 'Khám phá',
      icon: 'search',
    },
    {
      path: ROUTE_PATHS.APP.PRODUCTS.LIST,
      label: 'Cửa hàng',
      icon: 'shopping-bag',
    },
    {
      path: ROUTE_PATHS.APP.ORDERS.MY_PURCHASES,
      label: 'Đơn hàng đặt',
      icon: 'shopping-cart',
    },
    // Separator để phân biệt phần business
    { type: 'separator' },
    {
      path: ROUTE_PATHS.APP.ARTISAN.DASHBOARD,
      label: 'Dashboard',
      icon: 'bar-chart',
      business: true,
    },
    {
      path: ROUTE_PATHS.APP.POSTS.MY_POSTS,
      label: 'Bài viết',
      subtitle: 'Quản lý bài viết',
      icon: 'edit',
      business: true,
    },
    {
      path: ROUTE_PATHS.APP.PRODUCTS.MY_PRODUCTS,
      label: 'Sản phẩm',
      subtitle: 'Quản lý sản phẩm',
      icon: 'package',
      business: true,
    },
    {
      path: ROUTE_PATHS.APP.ORDERS.MY_SALES,
      label: 'Đơn hàng bán',
      subtitle: 'Quản lý đơn hàng, tranh chấp, trả hàng',
      icon: 'trending-up',
      business: true,
      submenu: [
        { path: ROUTE_PATHS.APP.ORDERS.MY_SALES, label: 'Đơn hàng' },
        { path: ROUTE_PATHS.APP.DISPUTES.MY_DISPUTES, label: 'Tranh chấp' },
        { path: ROUTE_PATHS.APP.RETURNS.MY_RETURNS, label: 'Trả hàng' },
        {
          path: ROUTE_PATHS.APP.CUSTOM_ORDERS.MY_RECEIVED,
          label: 'Đơn tùy chỉnh',
        },
        {
          path: ROUTE_PATHS.APP.NEGOTIATIONS.MY_RECEIVED,
          label: 'Thương lượng giá',
        },
      ],
    },
    {
      path: ROUTE_PATHS.APP.ARTISAN.SHOP_CUSTOMIZE,
      label: 'Tùy chỉnh giao diện',
      icon: 'palette',
      business: true,
    },
  ],

  ADMIN: [
    {
      path: ROUTE_PATHS.ADMIN.DASHBOARD,
      label: 'Tổng quan',
      icon: 'dashboard',
    },
    {
      path: ROUTE_PATHS.ADMIN.USERS,
      label: 'Người dùng',
      icon: 'users',
    },
    {
      path: ROUTE_PATHS.ADMIN.ARTISAN_REQUESTS,
      label: 'Yêu cầu nghệ nhân',
      icon: 'user-check',
    },
    {
      path: ROUTE_PATHS.ADMIN.POSTS_MANAGEMENT,
      label: 'Bài viết',
      icon: 'edit',
    },
    {
      path: ROUTE_PATHS.ADMIN.PRODUCTS_MANAGEMENT,
      label: 'Sản phẩm',
      icon: 'package',
    },
    {
      path: ROUTE_PATHS.ADMIN.ORDERS,
      label: 'Đơn hàng',
      icon: 'shopping-cart',
      submenu: [
        { path: ROUTE_PATHS.ADMIN.ORDERS, label: 'Tất cả đơn hàng' },
        { path: ROUTE_PATHS.ADMIN.CUSTOM_ORDERS, label: 'Đơn tùy chỉnh' },
        { path: ROUTE_PATHS.ADMIN.NEGOTIATIONS, label: 'Thương lượng giá' },
        { path: ROUTE_PATHS.ADMIN.DISPUTES, label: 'Tranh chấp' },
        { path: ROUTE_PATHS.ADMIN.RETURNS, label: 'Trả hàng' },
      ],
    },
  ],
} as const;

// Helper để lấy menu theo role
export const getNavigationMenu = (userRole: string) => {
  switch (userRole) {
    case 'CUSTOMER':
      return NAVIGATION_MENUS.CUSTOMER;
    case 'ARTISAN':
      return NAVIGATION_MENUS.ARTISAN;
    case 'ADMIN':
      return NAVIGATION_MENUS.ADMIN;
    default:
      return NAVIGATION_MENUS.CUSTOMER;
  }
};

// Helper để check active menu
export const isActiveMenu = (
  menuPath: string,
  currentPath: string,
): boolean => {
  if (menuPath === currentPath) return true;

  // Special cases for nested routes
  if (
    menuPath === ROUTE_PATHS.APP.POSTS.MY_POSTS &&
    currentPath.startsWith('/posts/')
  )
    return true;
  if (
    menuPath === ROUTE_PATHS.APP.PRODUCTS.MY_PRODUCTS &&
    currentPath.startsWith('/products/')
  )
    return true;
  if (
    menuPath === ROUTE_PATHS.APP.ORDERS.MY_SALES &&
    currentPath.startsWith('/orders/sales')
  )
    return true;

  return false;
};

// Helper để lấy breadcrumb
export const getBreadcrumb = (path: string) => {
  const breadcrumbs = [];

  // Add logic to generate breadcrumb based on current path
  if (path.startsWith('/admin/')) {
    breadcrumbs.push({ label: 'Quản trị', path: ROUTE_PATHS.ADMIN.DASHBOARD });
  } else {
    breadcrumbs.push({ label: 'Trang chủ', path: ROUTE_PATHS.APP.HOME });
  }

  // Add more specific breadcrumb logic based on your needs

  return breadcrumbs;
};

// Menu configuration cho responsive design
export const MENU_CONFIG = {
  MOBILE_BREAKPOINT: 768,
  SHOW_LABELS_ON_MOBILE: false,
  COLLAPSIBLE_BUSINESS_SECTION: true, // Cho artisan menu
  HIGHLIGHT_BUSINESS_SECTION: true,
} as const;

// Secondary navigation (header actions)
export const SECONDARY_NAVIGATION = {
  CUSTOMER: [
    {
      path: ROUTE_PATHS.APP.CART.VIEW,
      icon: 'shopping-cart',
      badge: 'cartCount',
    },
    { path: ROUTE_PATHS.APP.SOCIAL.WISHLIST, icon: 'heart' },
    {
      path: ROUTE_PATHS.APP.MESSAGES.LIST,
      icon: 'message-circle',
      badge: 'messageCount',
    },
    {
      path: ROUTE_PATHS.APP.NOTIFICATIONS,
      icon: 'bell',
      badge: 'notificationCount',
    },
  ],

  ARTISAN: [
    {
      path: ROUTE_PATHS.APP.CART.VIEW,
      icon: 'shopping-cart',
      badge: 'cartCount',
    },
    { path: ROUTE_PATHS.APP.SOCIAL.WISHLIST, icon: 'heart' },
    {
      path: ROUTE_PATHS.APP.MESSAGES.LIST,
      icon: 'message-circle',
      badge: 'messageCount',
    },
    {
      path: ROUTE_PATHS.APP.NOTIFICATIONS,
      icon: 'bell',
      badge: 'notificationCount',
    },
    {
      path: ROUTE_PATHS.APP.ARTISAN.ANALYTICS,
      icon: 'trending-up',
      label: 'Thống kê',
    },
  ],

  ADMIN: [
    {
      path: ROUTE_PATHS.ADMIN.NOTIFICATIONS,
      icon: 'bell',
      badge: 'notificationCount',
    },
    { path: ROUTE_PATHS.ADMIN.ANALYTICS, icon: 'bar-chart', label: 'Thống kê' },
  ],
} as const;
