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

// Customer Posts
import { PostsPage as CustomerPostsPage } from './pages/posts/customer/PostsPage';

// Artisan Posts
import { MyPostsPage } from './pages/posts/artisan/MyPostsPage';
import { CreatePostPage } from './pages/posts/artisan/CreatePostPage';
import { EditPostPage } from './pages/posts/artisan/EditPostPage';
import { PostDetailPage } from './pages/posts/artisan/PostDetailPage';

// Admin Posts
import { PostsManagementPage } from './pages/posts/admin/PostsManagementPage';

// Product pages
import { ShopPage } from './pages/products/customer/ShopPage';
import { SearchPage } from './pages/products/customer/SearchPage';
import { CategoryPage } from './pages/products/customer/CategoryPage';
import { ProductDetailPage } from './pages/products/customer/ProductDetailPage';

// Artisan Product Pages
import { ProductsPage as ArtisanProductsPage } from './pages/products/artisan/ProductsPage';
import { CreateProductPage } from './pages/products/artisan/CreateProductPage';
import { EditProductPage } from './pages/products/artisan/EditProductPage';

// Profile pages
import { ProfilePage } from './pages/profile/ProfilePage';
import { EditProfilePage } from './pages/profile/EditProfilePage';
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
import { AdminProductsPage } from './pages/products/admin/AdminProductsPage';
import { CategoryAttributesPage } from './pages/products/admin/CategoryAttributesPage';
import { AdminCategoriesPage } from './pages/products/admin/AdminCategoriesPage';
import { CreateCategoryPage } from './pages/products/admin/CreateCategoryPage';
import { EditCategoryPage } from './pages/products/admin/EditCategoryPage';

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

        // Product routes
        {
          path: 'products',
          children: [
            // Customer routes
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
            {
              path: ':slug',
              element: (
                <ProtectedRoute>
                  <ProductDetailPage />
                </ProtectedRoute>
              ),
            },

            // Artisan routes
            {
              path: 'manage',
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
                  path: ':productId/edit',
                  element: (
                    <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                      <EditProductPage />
                    </ProtectedRoute>
                  ),
                },
                // {
                //   path: 'stats',
                //   element: (
                //     <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
                //       <ProductStatsPage />
                //     </ProtectedRoute>
                //   ),
                // },
              ],
            },
          ],
        },

        // // Profile routes
        // {
        //   path: 'profile',
        //   children: [
        //     {
        //       index: true,
        //       element: (
        //         <ProtectedRoute>
        //           <ProfilePage />
        //         </ProtectedRoute>
        //       ),
        //     },
        //     {
        //       path: ':userId',
        //       element: (
        //         <ProtectedRoute>
        //           <ProfilePage />
        //         </ProtectedRoute>
        //       ),
        //     },
        //     {
        //       path: 'edit',
        //       element: (
        //         <ProtectedRoute>
        //           <EditProfilePage />
        //         </ProtectedRoute>
        //       ),
        //     },
        //   ],
        // },

        // // Settings
        // {
        //   path: 'settings',
        //   element: (
        //     <ProtectedRoute>
        //       <SettingsPage />
        //     </ProtectedRoute>
        //   ),
        // },

        // // Cart & Checkout
        // {
        //   path: 'cart',
        //   element: (
        //     <ProtectedRoute>
        //       <CartPage />
        //     </ProtectedRoute>
        //   ),
        // },
        // {
        //   path: 'checkout',
        //   element: (
        //     <ProtectedRoute>
        //       <CheckoutPage />
        //     </ProtectedRoute>
        //   ),
        // },

        // // Orders
        // {
        //   path: 'orders',
        //   children: [
        //     {
        //       index: true,
        //       element: (
        //         <ProtectedRoute>
        //           <OrdersPage />
        //         </ProtectedRoute>
        //       ),
        //     },
        //     {
        //       path: ':orderId',
        //       element: (
        //         <ProtectedRoute>
        //           <OrderDetailPage />
        //         </ProtectedRoute>
        //       ),
        //     },
        //     {
        //       path: 'tracking/:orderNumber',
        //       element: (
        //         <ProtectedRoute>
        //           <TrackingPage />
        //         </ProtectedRoute>
        //       ),
        //     },
        //   ],
        // },

        // // Messages
        // {
        //   path: 'messages',
        //   children: [
        //     {
        //       index: true,
        //       element: (
        //         <ProtectedRoute>
        //           <MessagesPage />
        //         </ProtectedRoute>
        //       ),
        //     },
        //     {
        //       path: ':userId',
        //       element: (
        //         <ProtectedRoute>
        //           <ConversationPage />
        //         </ProtectedRoute>
        //       ),
        //     },
        //   ],
        // },

        // // Notifications
        // {
        //   path: 'notifications',
        //   element: (
        //     <ProtectedRoute>
        //       <NotificationsPage />
        //     </ProtectedRoute>
        //   ),
        // },

        // // Artisan upgrade request
        // {
        //   path: 'upgrade-to-artisan',
        //   element: (
        //     <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
        //       <UpgradeRequestPage />
        //     </ProtectedRoute>
        //   ),
        // },

        // // Artisan routes
        // {
        //   path: 'artisan',
        //   children: [
        //     {
        //       path: 'dashboard',
        //       element: (
        //         <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
        //           <ArtisanDashboardPage />
        //         </ProtectedRoute>
        //       ),
        //     },
        //     {
        //       path: 'customize',
        //       element: (
        //         <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
        //           <ArtisanCustomizePage />
        //         </ProtectedRoute>
        //       ),
        //     },
        //     {
        //       path: 'products',
        //       children: [
        //         {
        //           index: true,
        //           element: (
        //             <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
        //               <ArtisanProductsPage />
        //             </ProtectedRoute>
        //           ),
        //         },
        //         {
        //           path: 'create',
        //           element: (
        //             <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
        //               <CreateProductPage />
        //             </ProtectedRoute>
        //           ),
        //         },
        //         {
        //           path: ':productId/edit',
        //           element: (
        //             <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
        //               <EditProductPage />
        //             </ProtectedRoute>
        //           ),
        //         },
        //       ],
        //     },
        //     {
        //       path: 'analytics',
        //       element: (
        //         <ProtectedRoute allowedRoles={[UserRole.ARTISAN]}>
        //           <ArtisanAnalyticsPage />
        //         </ProtectedRoute>
        //       ),
        //     },
        //   ],
        // },
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
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        // {
        //   index: true,
        //   element: <Navigate to="/admin/dashboard" replace />,
        // },
        // {
        //   path: 'dashboard',
        //   element: <AdminDashboardPage />,
        // },
        // {
        //   path: 'users',
        //   element: <UsersManagementPage />,
        // },
        // {
        //   path: 'artisan-requests',
        //   element: <ArtisanRequestsPage />,
        // },
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

    // // Redirects for legacy routes
    // {
    //   path: '/login',
    //   element: <Navigate to="/auth/login" replace />,
    // },
    // {
    //   path: '/register',
    //   element: <Navigate to="/auth/register" replace />,
    // },

    // // Error routes
    // {
    //   path: '/unauthorized',
    //   element: <UnauthorizedPage />,
    // },
    // {
    //   path: '/server-error',
    //   element: <ServerErrorPage />,
    // },
    // {
    //   path: '*',
    //   element: <NotFoundPage />,
    // },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  },
);
