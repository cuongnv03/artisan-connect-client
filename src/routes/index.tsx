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

// Profile pages
import Profile from '../features/profile/components/Profile';
import ChangePassword from '../features/profile/components/ChangePassword';

// Artisan pages
import ArtisanProfile from '../features/artisan/components/ArtisanProfile';
import ArtisanDashboard from '../features/artisan/components/ArtisanDashboard';
import ArtisanUpgrade from '../features/artisan/components/ArtisanUpgrade';

// Other pages
import HomePage from '../features/home/components/HomePage';
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
          {/* Profile routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          {/* <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/addresses" element={<Addresses />} /> */}

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
