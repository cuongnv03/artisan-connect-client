import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useMessage } from '../../contexts/MessageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Button } from '../ui/Button';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  BellIcon,
  ChatBubbleLeftIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  ChevronDownIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { SECONDARY_NAVIGATION, ROUTE_PATHS } from '../../constants/routes';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

const SECONDARY_ICON_MAP = {
  'shopping-cart': ShoppingCartIcon,
  heart: HeartIcon,
  'message-circle': ChatBubbleLeftIcon,
  bell: BellIcon,
  'trending-up': ArrowTrendingUpIcon,
  'bar-chart': ChartBarIcon,
};

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { state, logout } = useAuth();
  const { state: cartState } = useCart();
  const { state: messageState } = useMessage();
  const { state: notificationState } = useNotification();
  const { isAuthenticated, user } = state;
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        `${ROUTE_PATHS.APP.DISCOVER}?q=${encodeURIComponent(searchQuery)}`,
      );
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ARTISAN':
        return 'Nghệ nhân';
      case 'ADMIN':
        return 'Quản trị viên';
      default:
        return 'Khách hàng';
    }
  };

  const getBadgeCount = (badge?: string) => {
    switch (badge) {
      case 'cartCount':
        return cartState.itemCount;
      case 'messageCount':
        return messageState.unreadCount;
      case 'notificationCount':
        return notificationState.unreadCount;
      default:
        return 0;
    }
  };

  const getSecondaryNavigation = () => {
    const userRole = user?.role || 'CUSTOMER';
    return (
      SECONDARY_NAVIGATION[userRole as keyof typeof SECONDARY_NAVIGATION] || []
    );
  };

  const secondaryNavItems = getSecondaryNavigation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                type="button"
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 md:hidden"
                onClick={onMobileMenuToggle}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}

            {/* Logo - Only show when NOT authenticated */}
            {!isAuthenticated && (
              <Link to="/" className="flex items-center ml-2 md:ml-0">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AC</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                  Artisan Connect
                </span>
              </Link>
            )}
          </div>

          {/* Center - Search */}
          {isAuthenticated && (
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Tìm kiếm nghệ nhân, sản phẩm, bài viết..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-1 md:space-x-4">
            {isAuthenticated ? (
              <>
                {/* Secondary Navigation - Desktop */}
                <div className="hidden md:flex items-center space-x-1">
                  {secondaryNavItems.map((item) => {
                    const IconComponent =
                      SECONDARY_ICON_MAP[
                        item.icon as keyof typeof SECONDARY_ICON_MAP
                      ];
                    const badgeCount = item.badge
                      ? getBadgeCount(item.badge)
                      : 0;

                    if (!IconComponent) return null;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg relative"
                        title={item.label}
                      >
                        <IconComponent className="h-6 w-6" />
                        {badgeCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Secondary Navigation - Mobile */}
                <div className="flex md:hidden items-center space-x-1">
                  {secondaryNavItems.slice(0, 3).map((item) => {
                    const IconComponent =
                      SECONDARY_ICON_MAP[
                        item.icon as keyof typeof SECONDARY_ICON_MAP
                      ];
                    const badgeCount = item.badge
                      ? getBadgeCount(item.badge)
                      : 0;

                    if (!IconComponent) return null;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg relative"
                      >
                        <IconComponent className="h-5 w-5" />
                        {badgeCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {badgeCount > 9 ? '9+' : badgeCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center p-1 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  >
                    <div className="flex items-center">
                      {user?.avatarUrl ? (
                        <img
                          className="h-8 w-8 rounded-full object-cover"
                          src={user.avatarUrl}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                      ) : (
                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                      )}
                      <ChevronDownIcon className="ml-1 h-4 w-4 text-gray-400 hidden md:block" />
                    </div>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center">
                          {user?.avatarUrl ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.avatarUrl}
                              alt={`${user.firstName} ${user.lastName}`}
                            />
                          ) : (
                            <UserCircleIcon className="h-10 w-10 text-gray-400" />
                          )}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getRoleDisplayName(user?.role || '')}
                            </p>
                            <p className="text-xs text-gray-400">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        {user?.role === 'ARTISAN' && (
                          <>
                            <Link
                              to={'/artisan/me'}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              Trang cá nhân
                            </Link>
                          </>
                        )}

                        <Link
                          to={ROUTE_PATHS.APP.PROFILE.MY_PROFILE}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Thông tin cá nhân
                        </Link>

                        {user?.role === 'ARTISAN' && (
                          <>
                            <Link
                              to={ROUTE_PATHS.APP.ARTISAN.DASHBOARD}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              Bảng điều khiển nghệ nhân
                            </Link>
                            <Link
                              to={ROUTE_PATHS.APP.ARTISAN.SHOP_CUSTOMIZE}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              Tùy chỉnh trang cá nhân
                            </Link>
                          </>
                        )}

                        {user?.role === 'CUSTOMER' && (
                          <Link
                            to={ROUTE_PATHS.APP.ARTISAN.UPGRADE_REQUEST}
                            className="block px-4 py-2 text-sm text-primary hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            Trở thành nghệ nhân
                          </Link>
                        )}

                        {user?.role === 'ADMIN' && (
                          <Link
                            to={ROUTE_PATHS.ADMIN.ROOT}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            Quản trị hệ thống
                          </Link>
                        )}

                        <Link
                          to={ROUTE_PATHS.APP.PROFILE.SETTINGS}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Cài đặt
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 py-1">
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            handleLogout();
                            setIsProfileMenuOpen(false);
                          }}
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTE_PATHS.AUTH.LOGIN)}
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(ROUTE_PATHS.AUTH.REGISTER)}
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
