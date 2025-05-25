import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';
import { Footer } from './Footer';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const MainLayout: React.FC = () => {
  const { state } = useAuth();
  const { isAuthenticated, isLoading } = state;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMobileMenuToggle={() => setSidebarOpen(true)} />

      <div className="flex min-h-[calc(100vh-4rem)]">
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main
          className={`flex-1 ${isAuthenticated ? 'md:ml-64' : ''} ${
            isAuthenticated ? 'pb-16 md:pb-0' : ''
          }`}
        >
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {isAuthenticated && <MobileNavigation />}
      {!isAuthenticated && <Footer />}
    </div>
  );
};
