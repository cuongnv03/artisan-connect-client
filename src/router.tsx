import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout, AuthLayout, AdminLayout } from './components/layout';

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
import { TrendingPage } from './pages/discover/TrendingPage';

import { CreatePostPage } from './pages/posts/CreatePostPage';
import { EditPostPage } from './pages/posts/EditPostPage';
import { PostDetailPage } from './pages/posts/PostDetailPage';
import { MyPostsPage } from './pages/posts/MyPostsPage';

import { ShopPage } from './pages/shop/ShopPage';
import { ProductDetailPage } from './pages/shop/ProductDetailPage';
import { CategoryPage } from './pages/shop/CategoryPage';
import { SearchPage } from './pages/shop/SearchPage';

// Profile pages
import { ProfilePage } from './pages/profile/ProfilePage';
import { EditProfilePage } from './pages/profile/EditProfilePage';
import { AddressPage } from './pages/profile/AddressPage';
import { SettingsPage } from './pages/profile/SettingsPage';

// Cart & Orders
import { CartPage } from './pages/cart/CartPage';
import { CheckoutPage } from './pages/cart/CheckoutPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { OrderDetailPage } from './pages/orders/OrderDetailPage';
import { TrackingPage } from './pages/orders/TrackingPage';

// Messages
import { MessagesPage } from './pages/messages/MessagesPage';
import { ConversationPage } from './pages/messages/ConversationPage';

// Notifications
import { NotificationsPage } from './pages/notifications/NotificationsPage';

// Artisan pages
import { UpgradeRequestPage } from './pages/artisan/UpgradeRequestPage';
import { DashboardPage as ArtisanDashboardPage } from './pages/artisan/DashboardPage';
import { CustomizePage as ArtisanCustomizePage } from './pages/artisan/CustomizePage';
import { ProductsPage as ArtisanProductsPage } from './pages/artisan/ProductsPage';
import { AnalyticsPage as ArtisanAnalyticsPage } from './pages/artisan/AnalyticsPage';

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

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: <LandingPage />,
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
            {
              path: 'trending',
              element: (
                <ProtectedRoute>
                  <TrendingPage />
                </ProtectedRoute>
              ),
            },
          ],
        },

        // Posts routes
        {
          path: 'create-post',
          element: (
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'posts',
          children: [
            {
              path: 'my-posts',
              element: (
                <ProtectedRoute>
                  <MyPostsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: ':postId',
              element: (
                <ProtectedRoute>
                  <PostDetailPage />
                </ProtectedRoute>
              ),
            },
            {
              path: ':postId/edit',
              element: (
                <ProtectedRoute>
                  <EditPostPage />
                </ProtectedRoute>
              ),
            },
          ],
        },

        // Shop routes
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
              path: 'search',
              element: (
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'category/:categorySlug',
              element: (
                <ProtectedRoute>
                  <CategoryPage />
                </ProtectedRoute>
              ),
            },
          ],
        },

        // Product routes
        {
          path: 'products/:productId',
          element: (
            <ProtectedRoute>
              <ProductDetailPage />
            </ProtectedRoute>
          ),
        },

        // Profile routes
        {
          path: 'profile',
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              ),
            },
            {
              path: ':userId',
              element: (
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'edit',
              element: (
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'addresses',
              element: (
                <ProtectedRoute>
                  <AddressPage />
                </ProtectedRoute>
              ),
            },
          ],
        },

        // Settings
        {
          path: 'settings',
          element: (
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          ),
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
              path: 'tracking/:trackingNumber',
              element: (
                <ProtectedRoute>
                  <TrackingPage />
                </ProtectedRoute>
              ),
            },
          ],
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
                  <ConversationPage />
                </ProtectedRoute>
              ),
            },
          ],
        },

        // Notifications
        {
          path: 'notifications',
          element: (
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          ),
        },

        // Artisan upgrade request
        {
          path: 'upgrade-to-artisan',
          element: (
            <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
              <UpgradeRequestPage />
            </ProtectedRoute>
          ),
        },

        // Artisan routes
        {
          path: 'artisan',
          children: [
            {
              path: 'dashboard',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <ArtisanDashboardPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'customize',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <ArtisanCustomizePage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'products',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <ArtisanProductsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'analytics',
              element: (
                <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                  <ArtisanAnalyticsPage />
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
          path: 'reset-password',
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
          <AdminLayout />
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
      ],
    },

    // Redirects for legacy routes
    {
      path: '/login',
      element: <Navigate to="/auth/login" replace />,
    },
    {
      path: '/register',
      element: <Navigate to="/auth/register" replace />,
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
