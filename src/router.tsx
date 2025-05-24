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
import { CreatePostPage } from './pages/posts/CreatePostPage';
import { ShopPage } from './pages/shop/ShopPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { CartPage } from './pages/cart/CartPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';

// Artisan pages
import { UpgradeRequestPage } from './pages/artisan/UpgradeRequestPage';
import { ArtisanDashboardPage } from './pages/artisan/DashboardPage';
import { ArtisanCustomizePage } from './pages/artisan/CustomizePage';

// Admin pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UsersManagementPage } from './pages/admin/UsersManagementPage';
import { ArtisanRequestsPage } from './pages/admin/ArtisanRequestsPage';

// Error pages
import { NotFoundPage } from './pages/error/NotFoundPage';
import { UnauthorizedPage } from './pages/error/UnauthorizedPage';

// Protected Route component
import { ProtectedRoute } from './components/common/ProtectedRoute';

export const router = createBrowserRouter([
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
      {
        path: 'discover',
        element: (
          <ProtectedRoute>
            <DiscoverPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'create-post',
        element: (
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'shop',
        element: (
          <ProtectedRoute>
            <ShopPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'messages',
        element: (
          <ProtectedRoute>
            <MessagesPage />
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
      {
        path: 'upgrade-to-artisan',
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <UpgradeRequestPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'artisan',
        children: [
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute allowedRoles={['ARTISAN']}>
                <ArtisanDashboardPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customize',
            element: (
              <ProtectedRoute allowedRoles={['ARTISAN']}>
                <ArtisanCustomizePage />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
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
  {
    path: '/admin',
    element: <AdminLayout />,
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
  // Redirects
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/register',
    element: <Navigate to="/auth/register" replace />,
  },
  // Error pages
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
