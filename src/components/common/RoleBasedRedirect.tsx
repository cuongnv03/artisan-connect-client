import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const RoleBasedRedirect: React.FC = () => {
  const { state } = useAuth();

  // Show loading while auth is initializing
  if (!state.isInitialized || state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show landing page
  if (!state.isAuthenticated || !state.user) {
    return <Navigate to="/landing" replace />;
  }

  // Redirect based on user role
  switch (state.user.role) {
    case UserRole.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case UserRole.ARTISAN:
      return <Navigate to="/home" replace />;
    case UserRole.CUSTOMER:
      return <Navigate to="/home" replace />;
  }
};
