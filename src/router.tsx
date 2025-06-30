import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout, AuthLayout } from './components/layout';

// Pages
import { LandingPage } from './pages/home/LandingPage';
import { HomePage } from './pages/home/HomePage';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// Main pages
import { DiscoverPage } from './pages/discover/DiscoverPage';
import { SearchResultsPage } from './pages/discover/SearchResultsPage';

// Customer Posts
import { PostsPage as CustomerPostsPage } from './pages/posts/PostsPage';

// Artisan Posts
import { MyPostsPage } from './pages/posts/MyPostsPage';
import { CreatePostPage } from './pages/posts/CreatePostPage';
import { EditPostPage } from './pages/posts/EditPostPage';
import { PostDetailPage } from './pages/posts/PostDetailPage';

// Admin Posts
import { PostsManagementPage } from './pages/admin/PostsManagementPage';

// Product pages
import { ShopPage } from './pages/products/ShopPage';
import { ProductDetailPage } from './pages/products/ProductDetailPage';
import { CategoryProductsPage } from './pages/products/CategoryProductsPage';

// Artisan Product Pages
import { CreateProductPage } from './pages/products/CreateProductPage';
import { EditProductPage } from './pages/products/EditProductPage';
import { ArtisanProductsPage } from './pages/products/ArtisanProductsPage';
import { ProductStatsPage } from './pages/products/ProductStatsPage';

// Profile pages
import { ProfileManagementPage } from './pages/profile/ProfileManagementPage';
import { ArtisanProfilePage } from './pages/artisan/ArtisanProfilePage';
import { SettingsPage } from './pages/profile/SettingsPage';
import { MyArtisanProfilePage } from './pages/artisan/MyArtisanProfilePage';

// Cart & Orders
import { CartPage } from './pages/cart/CartPage';
import { CheckoutPage } from './pages/cart/CheckoutPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { OrderDetailPage } from './pages/orders/OrderDetailPage';
import { TrackingPage } from './pages/orders/TrackingPage';
// import { DisputePage } from './pages/orders/DisputePage';
// import { ReturnPage } from './pages/orders/ReturnPage';

// Price Negotiations
import { CustomerNegotiationsPage } from './pages/negotiations/CustomerNegotiationsPage';
import { ArtisanNegotiationsPage } from './pages/negotiations/ArtisanNegotiationsPage';
import { NegotiationDetailPage } from './pages/negotiations/NegotiationDetailPage';

import { WishlistPage } from './pages/wishlist/WishlistPage';

// Messages
import { MessagesPage } from './pages/messages/MessagesPage';
import { ConversationPage } from './pages/messages/ConversationPage';

// Notifications
import { NotificationsPage } from './pages/notifications/NotificationsPage';

// Artisan pages
import { UpgradeRequestPage } from './pages/artisan/UpgradeRequestPage';
import { DashboardPage } from './pages/artisan/DashboardPage';
import { CustomizePage } from './pages/artisan/CustomizePage';

// Admin pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UsersManagementPage } from './pages/admin/UsersManagementPage';
import { ArtisanRequestsPage } from './pages/admin/ArtisanRequestsPage';

// Error pages
import { NotFoundPage } from './pages/error/NotFoundPage';
import { UnauthorizedPage } from './pages/error/UnauthorizedPage';
import { ServerErrorPage } from './pages/error/ServerErrorPage';

// Protected Route component
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { UserRole } from './types/auth';
import { NegotiationRedirect } from './components/common/NegotiationRedirect';
import { RoleBasedRedirect } from './components/common/RoleBasedRedirect';
import { LandingPageRedirect } from './components/common/LandingPageRedirect';

// Admin Product pages
import { AdminProductsPage } from './pages/admin/products/AdminProductsPage';
import { CategoryAttributesPage } from './pages/admin/products/CategoryAttributesPage';
import { AdminCategoriesPage } from './pages/admin/products/AdminCategoriesPage';
import { CreateCategoryPage } from './pages/admin/products/CreateCategoryPage';
import { EditCategoryPage } from './pages/admin/products/EditCategoryPage';
import { CustomOrderRedirect } from './components/common/CustomOrderRedirect';
import { SentCustomOrdersPage } from './pages/custom-orders/SentCustomOrdersPage';
import { CreateCustomOrderPage } from './pages/custom-orders/CreateCustomOrderPage';
import { ReceivedCustomOrdersPage } from './pages/custom-orders/ReceivedCustomOrdersPage';
import { CustomOrderStatsPage } from './pages/custom-orders/CustomOrderStatsPage';
import { CustomOrderDetailPage } from './pages/custom-orders/CustomOrderDetailPage';
import { ArtisanRequestDetailPage } from './pages/admin/ArtisanRequestDetailPage';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: <RoleBasedRedirect />,
        },
        {
          path: 'landing',
          element: <LandingPageRedirect />,
        },
        {
          path: 'home',
          element: (
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          ),
        },

        // Discover routes
        {
          path: 'discover',
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <DiscoverPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'search',
              element: (
                <ProtectedRoute>
                  <SearchResultsPage />
                </ProtectedRoute>
              ),
            },
          ],
        },

        // Customer Posts Routes
        {
          path: 'posts',
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <CustomerPostsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: ':slug', // Cho customer xem chi tiết
              element: (
                <ProtectedRoute>
                  <CustomerPostsPage />
                </ProtectedRoute>
              ),
            },
            // Artisan routes trong posts
            {
              path: 'me', // /posts/me - My posts cho artisan
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <MyPostsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'create', // /posts/create
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <CreatePostPage />
                </ProtectedRoute>
              ),
            },
            {
              path: ':postId/edit', // /posts/:id/edit
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <EditPostPage />
                </ProtectedRoute>
              ),
            },
            // Artisan chi tiết (khác customer)
            {
              path: 'manage/:postId', // /posts/manage/:id - Chi tiết cho artisan
              element: (
                <ProtectedRoute
                  allowedRoles={[UserRole.ARTISAN, UserRole.ADMIN]}
                >
                  <PostDetailPage />
                </ProtectedRoute>
              ),
            },
          ],
        },

        // === SHOP ROUTES (Public product viewing) ===
        {
          path: 'shop',
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <ShopPage />
                </ProtectedRoute>
              ),
            },
            // {
            //   path: 'search',
            //   element: (
            //     <ProtectedRoute>
            //       <SearchPage />
            //     </ProtectedRoute>
            //   ),
            // },
            {
              path: 'categories/:categorySlug',
              element: (
                <ProtectedRoute>
                  <CategoryProductsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: ':productId',
              element: (
                <ProtectedRoute>
                  <ProductDetailPage />
                </ProtectedRoute>
              ),
            },
          ],
        },

        // === ARTISAN PRODUCT MANAGEMENT ROUTES ===
        {
          path: 'products',
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <ArtisanProductsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'create',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <CreateProductPage />
                </ProtectedRoute>
              ),
            },
            {
              path: ':productId',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <ProductDetailPage />
                </ProtectedRoute>
              ),
            },
            {
              path: ':productId/edit',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <EditProductPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'categories/:categoryId',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <ArtisanProductsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'stats',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <ProductStatsPage />
                </ProtectedRoute>
              ),
            },
          ],
        },

        {
          path: 'profile',
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <ProfileManagementPage />
                </ProtectedRoute>
              ),
            },
          ],
        },
        {
          path: 'settings',
          element: (
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          ),
        },

        {
          path: 'artisan',
          children: [
            {
              path: 'me',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <MyArtisanProfilePage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'dashboard',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <DashboardPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'customize',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <CustomizePage />
                </ProtectedRoute>
              ),
            },
            {
              path: ':userId', // Public artisan profile
              element: (
                <ProtectedRoute>
                  <ArtisanProfilePage />
                </ProtectedRoute>
              ),
            },
            // Upgrade request route
            {
              path: 'upgrade',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                  <UpgradeRequestPage />
                </ProtectedRoute>
              ),
            },
          ],
        },

        // === CART & CHECKOUT ROUTES
        {
          path: 'cart',
          element: (
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'checkout',
          element: (
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          ),
        },

        {
          path: 'orders',
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              ),
            },
            {
              path: ':orderId',
              element: (
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'tracking/:orderNumber',
              element: (
                <ProtectedRoute>
                  <TrackingPage />
                </ProtectedRoute>
              ),
            },
            // {
            //   path: 'disputes/:disputeId',
            //   element: (
            //     <ProtectedRoute>
            //       <DisputePage />
            //     </ProtectedRoute>
            //   ),
            // },
            // {
            //   path: 'returns/:returnId',
            //   element: (
            //     <ProtectedRoute>
            //       <ReturnPage />
            //     </ProtectedRoute>
            //   ),
            // },
          ],
        },

        // === PRICE NEGOTIATIONS ROUTES ===
        {
          path: 'negotiations',
          children: [
            // Root negotiations route - redirect based on role
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <NegotiationRedirect />
                </ProtectedRoute>
              ),
            },
            // Customer negotiations (gửi yêu cầu)
            {
              path: 'requests',
              element: (
                <ProtectedRoute>
                  <CustomerNegotiationsPage />
                </ProtectedRoute>
              ),
            },
            // Artisan negotiations (nhận yêu cầu)
            {
              path: 'received',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <ArtisanNegotiationsPage />
                </ProtectedRoute>
              ),
            },
            // Common detail page
            {
              path: ':id',
              element: (
                <ProtectedRoute>
                  <NegotiationDetailPage />
                </ProtectedRoute>
              ),
            },
          ],
        },

        {
          path: '/wishlist',
          element: (
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          ),
        },

        {
          path: 'notifications',
          element: (
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          ),
        },

        // Messages
        {
          path: 'messages',
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              ),
            },
            {
              path: ':userId',
              element: (
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              ),
            },
          ],
        },

        {
          path: 'custom-orders',
          children: [
            // Redirect root based on role
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <CustomOrderRedirect />
                </ProtectedRoute>
              ),
            },
            // Customer routes
            {
              path: 'requests',
              element: (
                <ProtectedRoute
                  allowedRoles={[UserRole.CUSTOMER, UserRole.ARTISAN]}
                >
                  <SentCustomOrdersPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'create',
              element: (
                <ProtectedRoute
                  allowedRoles={[UserRole.CUSTOMER, UserRole.ARTISAN]}
                >
                  <CreateCustomOrderPage />
                </ProtectedRoute>
              ),
            },
            // Artisan routes
            {
              path: 'received',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <ReceivedCustomOrdersPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'stats',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <CustomOrderStatsPage />
                </ProtectedRoute>
              ),
            },
            // Common detail page
            {
              path: ':id',
              element: (
                <ProtectedRoute>
                  <CustomOrderDetailPage />
                </ProtectedRoute>
              ),
            },
          ],
        },
      ],
    },

    // Auth routes
    {
      path: '/auth',
      element: <AuthLayout />,
      children: [
        {
          path: 'login',
          element: <LoginPage />,
        },
        {
          path: 'register',
          element: <RegisterPage />,
        },
        {
          path: 'forgot-password',
          element: <ForgotPasswordPage />,
        },
        {
          path: 'reset-password/:token',
          element: <ResetPasswordPage />,
        },
        {
          path: 'verify-email/:token',
          element: <VerifyEmailPage />,
        },
      ],
    },

    // Admin routes
    {
      path: '/admin',
      element: (
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to="/admin/dashboard" replace />,
        },
        {
          path: 'dashboard',
          element: <AdminDashboardPage />,
        },
        {
          path: 'users',
          element: <UsersManagementPage />,
        },
        {
          path: 'artisan-requests',
          element: <ArtisanRequestsPage />,
        },
        {
          path: 'artisan-requests/:id',
          element: <ArtisanRequestDetailPage />,
        },
        {
          path: 'products',
          children: [
            {
              index: true,
              element: <AdminProductsPage />,
            },
            // {
            //   path: ':productId',
            //   element: <AdminProductDetailPage />,
            // },
          ],
        },
        {
          path: 'categories',
          children: [
            {
              index: true,
              element: <AdminCategoriesPage />,
            },
            {
              path: 'create',
              element: <CreateCategoryPage />,
            },
            {
              path: ':categoryId/edit',
              element: <EditCategoryPage />,
            },
            {
              path: ':categoryId/attributes',
              element: <CategoryAttributesPage />,
            },
          ],
        },
        {
          path: 'posts',
          element: <PostsManagementPage />,
        },
      ],
    },

    // Error routes
    {
      path: '/unauthorized',
      element: <UnauthorizedPage />,
    },
    {
      path: '/server-error',
      element: <ServerErrorPage />,
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  },
);
