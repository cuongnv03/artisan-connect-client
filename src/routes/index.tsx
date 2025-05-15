import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { AuthLayout } from '../components/layout/AuthLayout';

// Auth pages
import Login from '../screens/Auth/Login';
import Register from '../screens/Auth/Register';
import ForgotPassword from '../screens/Auth/ForgotPassword';
import ResetPassword from '../screens/Auth/ResetPassword';
import VerifyEmail from '../screens/Auth/VerifyEmail';

// Homepage
import HomePage from '../screens/Home';

// Feed & Discovery pages
import { NewsFeed } from '../screens/Home/Feed';
import DiscoverPage from '@/screens/Discover';

// Post pages
import PostDetail from '@/screens/Post/Detail';
import PostEditor from '@/screens/Post/Editor';

// Profile pages
import Profile from '../screens/Profile';
import ChangePassword from '../screens/Profile/ChangePassword';

// Artisan pages
import ArtisanProfile from '../screens/Artisan/Profile';
import ArtisanDashboard from '../screens/Artisan/Dashboard';
import ArtisanUpgrade from '../screens/Artisan/Upgrade';

// Product pages
import ProductsManage from '../screens/Product/Manage';
import ProductCreate from '../screens/Product/Create';
import ProductCategories from '../screens/Product/Categories';
import ProductDetail from '../screens/Product/Detail';

// Order pages
import OrdersList from '../screens/Order/List';
import OrderDetail from '../screens/Order/Detail';
import Checkout from '../screens/Order/Checkout';
import OrderConfirmation from '../screens/Order/Confirmation';

// Messages
import MessagesList from '../screens/Messages/List';
import MessageDetail from '../screens/Messages/Detail';

// Notifications
import NotificationsPage from '@/screens/Notification';

// Settings
import SettingsPage from '../screens/Settings';

// Error pages
import NotFound from '../components/feedback/NotFound';
import Unauthorized from '../components/feedback/Unauthorized';

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
          {/* <Route path="/notifications" element={<NotificationsPage />} /> */}
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
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/order-confirmation/:id"
            element={<OrderConfirmation />}
          />

          {/* Message routes */}
          {/* <Route path="/messages" element={<MessagesList />} />
          <Route path="/messages/:id" element={<MessageDetail />} /> */}
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
