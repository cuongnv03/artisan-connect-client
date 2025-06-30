import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LandingPage } from '../../pages/home/LandingPage';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const LandingPageRedirect: React.FC = () => {
  const { state } = useAuth();

  // Show loading while auth is initializing
  if (!state.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang khởi tạo...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to role-based page
  if (state.isAuthenticated && state.user) {
    return <Navigate to="/" replace />;
  }

  // Show landing page for non-authenticated users
  return <LandingPage />;
};
