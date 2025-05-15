import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
}) => {
  const { state } = useAuth();
  const location = useLocation();

  // Check if the user is still being loaded
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Check if the user is authenticated
  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the user has the required role
  if (roles && state.user && !roles.includes(state.user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
