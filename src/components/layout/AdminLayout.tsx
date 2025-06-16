import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
  PresentationChartLineIcon,
  UsersIcon,
  StarIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { NAVIGATION_MENUS, ROUTE_PATHS } from '../../constants/routes';

export const AdminLayout: React.FC = () => {
  const { state } = useAuth();
  const { user, isLoading, isAuthenticated } = state;
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  const adminNavItems = NAVIGATION_MENUS.ADMIN.map((item) => ({
    name: item.label,
    href: item.path,
    icon:
      item.icon === 'dashboard'
        ? PresentationChartLineIcon
        : item.icon === 'users'
        ? UsersIcon
        : item.icon === 'user-check'
        ? StarIcon
        : item.icon === 'edit'
        ? DocumentTextIcon
        : item.icon === 'package'
        ? DocumentTextIcon
        : item.icon === 'shopping-cart'
        ? ChartBarIcon
        : PresentationChartLineIcon,
    description: item.subtitle || '',
    badge: 0, // TODO: get actual counts from API
  }));

  const isActiveLink = (href: string) => {
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AC</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Admin Panel
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-gray-700">Chế độ quản trị</span>
              </div>

              <Link
                to={ROUTE_PATHS.APP.HOME}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Về trang chính
              </Link>

              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={user?.avatarUrl || 'https://via.placeholder.com/32'}
                  alt={`${user?.firstName} ${user?.lastName}`}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Admin Sidebar */}
        <div
          className={`${
            sidebarCollapsed ? 'w-16' : 'w-64'
          } bg-white shadow-sm border-r border-gray-200 transition-all duration-300`}
        >
          <nav className="mt-6 px-3">
            <div className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = isActiveLink(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${
                        isActive
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    title={sidebarCollapsed ? item.name : ''}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Collapse Toggle */}
          <div className="absolute bottom-6 left-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <svg
                className={`h-5 w-5 transition-transform ${
                  sidebarCollapsed ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Admin Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
