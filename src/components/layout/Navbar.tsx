import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import {
  Bars3Icon,
  BellIcon,
  ChatBubbleLeftEllipsisIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { NotificationBadge } from '../../features/notification/components/NotificationBadge';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { state, logout } = useAuth();
  const { isAuthenticated, user } = state;
  const navigate = useNavigate();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            {isAuthenticated && user?.role !== 'CUSTOMER' && (
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 md:hidden"
                onClick={onMenuClick}
              >
                <Bars3Icon className="block h-6 w-6" />
              </button>
            )}

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.png"
                alt="Artisan Connect"
              />
              <span className="ml-2 text-lg font-semibold text-gray-900 hidden sm:block">
                Artisan Connect
              </span>
            </Link>
          </div>

          {/* Search */}
          {isAuthenticated && (
            <div className="flex-1 max-w-md mx-4 md:mx-8 flex items-center">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 text-sm placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent"
                    placeholder="Search artisans, products, posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right side icons and profile */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/messages"
                  className="p-2 text-gray-500 rounded-full hover:text-accent hover:bg-gray-100"
                >
                  <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
                </Link>

                <Link
                  to="/notifications"
                  className="p-2 text-gray-500 rounded-full hover:text-accent hover:bg-gray-100"
                >
                  <NotificationBadge />
                </Link>

                <div className="relative ml-3">
                  <button
                    type="button"
                    className="flex items-center focus:outline-none"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  >
                    <Avatar
                      src={user?.avatarUrl}
                      firstName={user?.firstName}
                      lastName={user?.lastName}
                      size="sm"
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium">{`${user?.firstName} ${user?.lastName}`}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Your Profile
                      </Link>

                      {user?.role === 'ARTISAN' && (
                        <Link
                          to="/artisan/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Artisan Dashboard
                        </Link>
                      )}

                      {user?.role === 'CUSTOMER' && (
                        <Link
                          to="/artisan/upgrade"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Become an Artisan
                        </Link>
                      )}

                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Settings
                      </Link>

                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          handleLogout();
                          setIsProfileMenuOpen(false);
                        }}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
