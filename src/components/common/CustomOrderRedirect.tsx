import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const CustomOrderRedirect: React.FC = () => {
  const { state } = useAuth();

  if (!state.user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (state.user.role === 'CUSTOMER') {
    return <Navigate to="/custom-orders/requests" replace />;
  }

  if (state.user.role === 'ARTISAN') {
    return <Navigate to="/custom-orders/received" replace />;
  }

  return <Navigate to="/custom-orders/requests" replace />;
};
