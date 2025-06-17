import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ArtisanProfilePage } from './ArtisanProfilePage';
import { Navigate } from 'react-router-dom';

export const MyArtisanProfilePage: React.FC = () => {
  const { state: authState } = useAuth();

  // Redirect đến trang cá nhân với userId của chính mình
  if (authState.user?.id) {
    return <Navigate to={`/artisan/${authState.user.id}`} replace />;
  }

  return <Navigate to="/profile" replace />;
};
