import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const NegotiationRedirect: React.FC = () => {
  const { state: authState } = useAuth();

  // Hiển thị loading khi chưa xác định được user
  if (!authState.isInitialized || authState.isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect based on user role
  if (authState.user?.role === 'ARTISAN') {
    return <Navigate to="/negotiations/received" replace />;
  }

  // Default to customer negotiations
  return <Navigate to="/negotiations/requests" replace />;
};
