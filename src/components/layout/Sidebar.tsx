import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useMessage } from '../../contexts/MessageContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ShoppingBagIcon,
  UserIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  CogIcon,
  ChartBarIcon,
  UsersIcon,
  StarIcon,
  PresentationChartLineIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  TagIcon,
  CreditCardIcon,
  UserPlusIcon,
  ArrowTrendingUpIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  UserIcon as UserIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid,
  BellIcon as BellIconSolid,
  CogIcon as CogIconSolid,
} from '@heroicons/react/24/solid';
import {
  getNavigationMenu,
  isActiveMenu,
  ROUTE_PATHS,
} from '../../constants/routes';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IconMap {
  [key: string]: React.ComponentType<any>;
}

const ICON_MAP: IconMap = {
  home: HomeIcon,
  search: MagnifyingGlassIcon,
  'shopping-bag': ShoppingBagIcon,
  'shopping-cart': ShoppingCartIcon,
  edit: DocumentTextIcon,
  package: TagIcon,
  'trending-up': ArrowTrendingUpIcon,
  palette: PaintBrushIcon,
  'bar-chart': ChartBarIcon,
  'user-plus': UserPlusIcon,
  'message-circle': ChatBubbleLeftIcon,
  bell: BellIcon,
  user: UserIcon,
  settings: CogIcon,
  heart: HeartIcon,
  clipboard: ClipboardDocumentListIcon,
  star: StarIcon,
  dashboard: PresentationChartLineIcon,
  users: UsersIcon,
  'user-check': UserPlusIcon,
  'credit-card': CreditCardIcon,
};

const SOLID_ICON_MAP: IconMap = {
  home: HomeIconSolid,
  search: MagnifyingGlassIconSolid,
  'shopping-bag': ShoppingBagIconSolid,
  'shopping-cart': ShoppingCartIconSolid,
  edit: DocumentTextIcon,
  package: TagIcon,
  'trending-up': ArrowTrendingUpIcon,
  palette: PaintBrushIcon,
  'bar-chart': ChartBarIcon,
  'user-plus': UserPlusIcon,
  'message-circle': ChatBubbleLeftIconSolid,
  bell: BellIconSolid,
  user: UserIconSolid,
  settings: CogIconSolid,
  heart: HeartIcon,
  clipboard: ClipboardDocumentListIconSolid,
  star: StarIcon,
  dashboard: PresentationChartLineIcon,
  users: UsersIcon,
  'user-check': UserPlusIcon,
  'credit-card': CreditCardIcon,
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { state } = useAuth();
  const { state: cartState } = useCart();
  const { state: messageState } = useMessage();
  const { state: notificationState } = useNotification();
  const { user } = state;
  const location = useLocation();

  const navigationItems = getNavigationMenu(user?.role || 'CUSTOMER');

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

  const getIcon = (iconName: string, isActive: boolean) => {
    const IconComponent = isActive
      ? SOLID_ICON_MAP[iconName] || ICON_MAP[iconName]
      : ICON_MAP[iconName];
    return IconComponent || HomeIcon;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section - Fixed at top */}
          <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200">
            <Link
              to="/"
              className="flex items-center"
              onClick={() => onClose()}
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AC</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">
                Artisan Connect
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigationItems.map((item, index) => {
              // Handle separator
              if (item.type === 'separator') {
                return (
                  <div key={`separator-${index}`} className="my-4">
                    <div className="border-t border-gray-200"></div>
                    <div className="mt-4 px-3">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Kinh doanh
                      </h3>
                    </div>
                  </div>
                );
              }

              const isActive = isActiveMenu(item.path, location.pathname);
              const IconComponent = getIcon(item.icon, isActive);
              const badgeCount = item.badge ? getBadgeCount(item.badge) : 0;

              return (
                <div key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${
                        item.highlight
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : item.business
                          ? isActive
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-primary hover:text-white'
                          : isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    onClick={() => onClose()}
                  >
                    <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{item.label}</span>
                        {badgeCount > 0 && (
                          <span
                            className={`
                              ml-2 px-2 py-0.5 text-xs rounded-full
                              ${
                                isActive || item.highlight
                                  ? 'bg-white text-primary'
                                  : 'bg-red-500 text-white'
                              }
                            `}
                          >
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-xs opacity-75 mt-0.5 truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Submenu */}
                  {item.submenu && isActive && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu.map((subItem) => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`
                              block px-3 py-1.5 text-sm rounded-md transition-colors
                              ${
                                isSubActive
                                  ? 'bg-primary bg-opacity-20 text-primary font-medium'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }
                            `}
                            onClick={() => onClose()}
                          >
                            {subItem.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User info */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user?.avatarUrl ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={user.avatarUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role === 'ARTISAN' && 'Nghệ nhân'}
                  {user?.role === 'CUSTOMER' && 'Khách hàng'}
                  {user?.role === 'ADMIN' && 'Quản trị viên'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
