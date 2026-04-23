import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout, AuthLayout } from './components/layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { NegotiationRedirect } from './components/common/NegotiationRedirect';
import { RoleBasedRedirect } from './components/common/RoleBasedRedirect';
import { LandingPageRedirect } from './components/common/LandingPageRedirect';
import { CustomOrderRedirect } from './components/common/CustomOrderRedirect';
import { UserRole } from './types/auth';

const lz = (fn: () => Promise<any>, name: string) =>
  lazy(() => fn().then((m) => ({ default: m[name] })));

// Home
const LandingPage = lz(() => import('./pages/home/LandingPage'), 'LandingPage');
const HomePage = lz(() => import('./pages/home/HomePage'), 'HomePage');

// Auth
const LoginPage = lz(() => import('./pages/auth/LoginPage'), 'LoginPage');
const RegisterPage = lz(
  () => import('./pages/auth/RegisterPage'),
  'RegisterPage',
);
const ForgotPasswordPage = lz(
  () => import('./pages/auth/ForgotPasswordPage'),
  'ForgotPasswordPage',
);
const ResetPasswordPage = lz(
  () => import('./pages/auth/ResetPasswordPage'),
  'ResetPasswordPage',
);
const VerifyEmailPage = lz(
  () => import('./pages/auth/VerifyEmailPage'),
  'VerifyEmailPage',
);

// Discover
const DiscoverPage = lz(
  () => import('./pages/discover/DiscoverPage'),
  'DiscoverPage',
);
const SearchResultsPage = lz(
  () => import('./pages/discover/SearchResultsPage'),
  'SearchResultsPage',
);

// Posts
const CustomerPostsPage = lz(
  () => import('./pages/posts/PostsPage'),
  'PostsPage',
);
const MyPostsPage = lz(() => import('./pages/posts/MyPostsPage'), 'MyPostsPage');
const CreatePostPage = lz(
  () => import('./pages/posts/CreatePostPage'),
  'CreatePostPage',
);
const EditPostPage = lz(
  () => import('./pages/posts/EditPostPage'),
  'EditPostPage',
);
const PostDetailPage = lz(
  () => import('./pages/posts/PostDetailPage'),
  'PostDetailPage',
);

// Admin posts
const PostsManagementPage = lz(
  () => import('./pages/admin/PostsManagementPage'),
  'PostsManagementPage',
);

// Shop / Products
const ShopPage = lz(() => import('./pages/products/ShopPage'), 'ShopPage');
const ProductDetailPage = lz(
  () => import('./pages/products/ProductDetailPage'),
  'ProductDetailPage',
);
const CategoryProductsPage = lz(
  () => import('./pages/products/CategoryProductsPage'),
  'CategoryProductsPage',
);
const CreateProductPage = lz(
  () => import('./pages/products/CreateProductPage'),
  'CreateProductPage',
);
const EditProductPage = lz(
  () => import('./pages/products/EditProductPage'),
  'EditProductPage',
);
const ArtisanProductsPage = lz(
  () => import('./pages/products/ArtisanProductsPage'),
  'ArtisanProductsPage',
);
const ProductStatsPage = lz(
  () => import('./pages/products/ProductStatsPage'),
  'ProductStatsPage',
);

// Profile
const ProfileManagementPage = lz(
  () => import('./pages/profile/ProfileManagementPage'),
  'ProfileManagementPage',
);
const ArtisanProfilePage = lz(
  () => import('./pages/artisan/ArtisanProfilePage'),
  'ArtisanProfilePage',
);
const SettingsPage = lz(
  () => import('./pages/profile/SettingsPage'),
  'SettingsPage',
);
const MyArtisanProfilePage = lz(
  () => import('./pages/artisan/MyArtisanProfilePage'),
  'MyArtisanProfilePage',
);

// Cart & Orders
const CartPage = lz(() => import('./pages/cart/CartPage'), 'CartPage');
const CheckoutPage = lz(
  () => import('./pages/cart/CheckoutPage'),
  'CheckoutPage',
);
const OrdersPage = lz(
  () => import('./pages/orders/OrdersPage'),
  'OrdersPage',
);
const OrderDetailPage = lz(
  () => import('./pages/orders/OrderDetailPage'),
  'OrderDetailPage',
);
const TrackingPage = lz(
  () => import('./pages/orders/TrackingPage'),
  'TrackingPage',
);

// Negotiations
const CustomerNegotiationsPage = lz(
  () => import('./pages/negotiations/CustomerNegotiationsPage'),
  'CustomerNegotiationsPage',
);
const ArtisanNegotiationsPage = lz(
  () => import('./pages/negotiations/ArtisanNegotiationsPage'),
  'ArtisanNegotiationsPage',
);
const NegotiationDetailPage = lz(
  () => import('./pages/negotiations/NegotiationDetailPage'),
  'NegotiationDetailPage',
);

// Wishlist / Notifications / Messages
const WishlistPage = lz(
  () => import('./pages/wishlist/WishlistPage'),
  'WishlistPage',
);
const MessagesPage = lz(
  () => import('./pages/messages/MessagesPage'),
  'MessagesPage',
);
const NotificationsPage = lz(
  () => import('./pages/notifications/NotificationsPage'),
  'NotificationsPage',
);

// Artisan
const UpgradeRequestPage = lz(
  () => import('./pages/artisan/UpgradeRequestPage'),
  'UpgradeRequestPage',
);
const DashboardPage = lz(
  () => import('./pages/artisan/DashboardPage'),
  'DashboardPage',
);
const CustomizePage = lz(
  () => import('./pages/artisan/CustomizePage'),
  'CustomizePage',
);

// Admin
const AdminDashboardPage = lz(
  () => import('./pages/admin/AdminDashboardPage'),
  'AdminDashboardPage',
);
const UsersManagementPage = lz(
  () => import('./pages/admin/UsersManagementPage'),
  'UsersManagementPage',
);
const ArtisanRequestsPage = lz(
  () => import('./pages/admin/ArtisanRequestsPage'),
  'ArtisanRequestsPage',
);
const ArtisanRequestDetailPage = lz(
  () => import('./pages/admin/ArtisanRequestDetailPage'),
  'ArtisanRequestDetailPage',
);
const AdminProductsPage = lz(
  () => import('./pages/admin/products/AdminProductsPage'),
  'AdminProductsPage',
);
const AdminCategoriesPage = lz(
  () => import('./pages/admin/products/AdminCategoriesPage'),
  'AdminCategoriesPage',
);
const CreateCategoryPage = lz(
  () => import('./pages/admin/products/CreateCategoryPage'),
  'CreateCategoryPage',
);
const EditCategoryPage = lz(
  () => import('./pages/admin/products/EditCategoryPage'),
  'EditCategoryPage',
);
const AdminOrdersPage = lz(
  () => import('./pages/admin/orders/AdminOrdersPage'),
  'AdminOrdersPage',
);

// Custom Orders
const SentCustomOrdersPage = lz(
  () => import('./pages/custom-orders/SentCustomOrdersPage'),
  'SentCustomOrdersPage',
);
const CreateCustomOrderPage = lz(
  () => import('./pages/custom-orders/CreateCustomOrderPage'),
  'CreateCustomOrderPage',
);
const ReceivedCustomOrdersPage = lz(
  () => import('./pages/custom-orders/ReceivedCustomOrdersPage'),
  'ReceivedCustomOrdersPage',
);
const CustomOrderStatsPage = lz(
  () => import('./pages/custom-orders/CustomOrderStatsPage'),
  'CustomOrderStatsPage',
);
const CustomOrderDetailPage = lz(
  () => import('./pages/custom-orders/CustomOrderDetailPage'),
  'CustomOrderDetailPage',
);

// Error pages
const NotFoundPage = lz(
  () => import('./pages/error/NotFoundPage'),
  'NotFoundPage',
);
const UnauthorizedPage = lz(
  () => import('./pages/error/UnauthorizedPage'),
  'UnauthorizedPage',
);
const ServerErrorPage = lz(
  () => import('./pages/error/ServerErrorPage'),
  'ServerErrorPage',
);

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
              path: ':slug',
              element: (
                <ProtectedRoute>
                  <CustomerPostsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'me',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <MyPostsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'create',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <CreatePostPage />
                </ProtectedRoute>
              ),
            },
            {
              path: ':postId/edit',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <EditPostPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'manage/:postId',
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

        // Shop
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

        // Artisan Product Management
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
              path: ':userId',
              element: (
                <ProtectedRoute>
                  <ArtisanProfilePage />
                </ProtectedRoute>
              ),
            },
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

        // Cart & Checkout
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

        // Orders
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
          ],
        },

        // Negotiations
        {
          path: 'negotiations',
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <NegotiationRedirect />
                </ProtectedRoute>
              ),
            },
            {
              path: 'requests',
              element: (
                <ProtectedRoute>
                  <CustomerNegotiationsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'received',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <ArtisanNegotiationsPage />
                </ProtectedRoute>
              ),
            },
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

        // Custom Orders
        {
          path: 'custom-orders',
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <CustomOrderRedirect />
                </ProtectedRoute>
              ),
            },
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
          ],
        },
        {
          path: 'posts',
          element: <PostsManagementPage />,
        },
        {
          path: 'orders',
          element: <AdminOrdersPage />,
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
      v7_relativeSplatPath: true,
    },
  },
);
