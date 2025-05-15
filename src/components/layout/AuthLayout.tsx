import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AuthLayout: React.FC = () => {
  const { state } = useAuth();
  const { isAuthenticated, isLoading } = state;

  // If user is already authenticated, redirect to home
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-16 w-auto"
          src="/logo.png"
          alt="Artisan Connect"
        />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-soft rounded-xl sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
