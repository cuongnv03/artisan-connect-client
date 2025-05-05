import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useAuth } from '../../store/AuthContext';

export const MainLayout: React.FC = () => {
  const { state } = useAuth();
  const { isAuthenticated, user } = state;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine if sidebar should be shown
  const showSidebar = isAuthenticated;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1">
        {showSidebar && <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />}

        <main
          className={`flex-1 pt-16 pb-16 md:pb-0 ${
            showSidebar ? 'md:pl-0' : ''
          }`}
        >
          <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {isAuthenticated && <MobileNav />}
      {!isAuthenticated && <Footer />}
    </div>
  );
};
