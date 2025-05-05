import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { AuthLayout } from '../components/layout/AuthLayout';

// Auth pages
import Login from '../features/auth/components/Login';
import Register from '../features/auth/components/Register';
import ForgotPassword from '../features/auth/components/ForgotPassword';
import ResetPassword from '../features/auth/components/ResetPassword';
import VerifyEmail from '../features/auth/components/VerifyEmail';

// Homepage
import HomePage from '../features/home/components/HomePage';

// Feed & Discovery pages
import { NewsFeed } from '../features/feed/components/NewsFeed';
import DiscoverPage from '../features/discover/components/DiscoverPage';

// Post pages
import PostDetail from '../features/post/components/PostDetail';
import PostEditor from '../features/post/components/PostEditor';

// Profile pages
import Profile from '../features/profile/components/Profile';
import ChangePassword from '../features/profile/components/ChangePassword';

// Artisan pages
import ArtisanProfile from '../features/artisan/components/ArtisanProfile';
import ArtisanDashboard from '../features/artisan/components/ArtisanDashboard';
import ArtisanUpgrade from '../features/artisan/components/ArtisanUpgrade';

// Product pages
import ProductsManage from '../features/product/components/ProductsManage';
import ProductCreate from '../features/product/components/ProductCreate';
import ProductCategories from '../features/product/components/ProductCategories';
import ProductDetail from '../features/product/components/ProductDetail';

// Order pages
import OrdersList from '../features/order/components/OrdersList';
import OrderDetail from '../features/order/components/OrderDetail';

// Messages
import MessagesList from '../features/message/components/MessagesList';
import MessageDetail from '../features/message/components/MessageDetail';

// Notifications
import NotificationsPage from '../features/notification/components/NotificationsPage';

// Settings
import SettingsPage from '../features/settings/components/SettingsPage';

// Error pages
import NotFound from '../components/common/NotFound';
import Unauthorized from '../components/common/Unauthorized';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes with auth layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
        </Route>

        {/* Protected routes with main layout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Common routes */}
          <Route path="/feed" element={<NewsFeed />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Profile routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Post routes */}
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/post/create" element={<PostEditor />} />
          <Route path="/post/edit/:id" element={<PostEditor />} />

          {/* Artisan routes */}
          <Route
            path="/artisan/profile"
            element={
              <ProtectedRoute roles={['ARTISAN']}>
                <ArtisanProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/artisan/dashboard"
            element={
              <ProtectedRoute roles={['ARTISAN']}>
                <ArtisanDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/artisan/upgrade" element={<ArtisanUpgrade />} />
          <Route path="/artisan/:id" element={<ArtisanProfile />} />

          {/* Product routes - artisan only */}
          <Route
            path="/products/manage"
            element={
              <ProtectedRoute roles={['ARTISAN']}>
                <ProductsManage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/create"
            element={
              <ProtectedRoute roles={['ARTISAN']}>
                <ProductCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/categories"
            element={
              <ProtectedRoute roles={['ARTISAN']}>
                <ProductCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/edit/:id"
            element={
              <ProtectedRoute roles={['ARTISAN']}>
                <ProductCreate />
              </ProtectedRoute>
            }
          />

          {/* Product detail - public but in protected layout */}
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* Order routes - artisan only */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute roles={['ARTISAN']}>
                <OrdersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute roles={['ARTISAN']}>
                <OrderDetail />
              </ProtectedRoute>
            }
          />

          {/* Message routes */}
          <Route path="/messages" element={<MessagesList />} />
          <Route path="/messages/:id" element={<MessageDetail />} />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                {/* Admin components would go here */}
                <div>Admin Panel (Placeholder)</div>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Public routes with main layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
