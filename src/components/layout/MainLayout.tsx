import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../store/AuthContext';

export const MainLayout: React.FC = () => {
  const { state } = useAuth();
  const { isAuthenticated, user } = state;

  // Determine if sidebar should be shown
  const showSidebar = isAuthenticated && user?.role !== 'CUSTOMER';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex flex-1">
        {showSidebar && <Sidebar />}

        <main
          className={`flex-1 px-4 py-8 md:px-8 lg:px-12 max-w-7xl mx-auto w-full`}
        >
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};
