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
  StarIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CreditCardIcon,
  UserPlusIcon,
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
} from '@heroicons/react/24/solid';
import {
  getNavigationMenu,
  isActiveMenu,
  ROUTE_PATHS,
} from '../../constants/routes';

interface IconMap {
  [key: string]: React.ComponentType<any>;
}

const ICON_MAP: IconMap = {
  home: HomeIcon,
  search: MagnifyingGlassIcon,
  'shopping-bag': ShoppingBagIcon,
  'shopping-cart': ShoppingCartIcon,
  edit: PlusCircleIcon,
  package: TagIcon,
  'trending-up': ArrowTrendingUpIcon,
  palette: PlusCircleIcon,
  'bar-chart': ChartBarIcon,
  'user-plus': UserPlusIcon,
  'message-circle': ChatBubbleLeftIcon,
  bell: BellIcon,
  user: UserIcon,
  heart: UserIcon,
  clipboard: ClipboardDocumentListIcon,
  star: StarIcon,
  dashboard: CreditCardIcon,
  users: UserIcon,
  'user-check': UserPlusIcon,
  'credit-card': CreditCardIcon,
};

const SOLID_ICON_MAP: IconMap = {
  home: HomeIconSolid,
  search: MagnifyingGlassIconSolid,
  'shopping-bag': ShoppingBagIconSolid,
  'shopping-cart': ShoppingCartIconSolid,
  edit: PlusCircleIconSolid,
  package: TagIcon,
  'trending-up': ArrowTrendingUpIcon,
  palette: PlusCircleIconSolid,
  'bar-chart': ChartBarIcon,
  'user-plus': UserPlusIcon,
  'message-circle': ChatBubbleLeftIconSolid,
  bell: BellIconSolid,
  user: UserIconSolid,
  heart: UserIconSolid,
  clipboard: ClipboardDocumentListIconSolid,
  star: StarIcon,
  dashboard: CreditCardIcon,
  users: UserIconSolid,
  'user-check': UserPlusIcon,
  'credit-card': CreditCardIcon,
};

export const MobileNavigation: React.FC = () => {
  const { state } = useAuth();
  const { state: cartState } = useCart();
  const { state: messageState } = useMessage();
  const { state: notificationState } = useNotification();
  const { user } = state;
  const location = useLocation();

  const allNavigationItems = getNavigationMenu(user?.role || 'CUSTOMER');

  // Filter navigation items for mobile (select most important ones)
  const getMobileNavigationItems = () => {
    const userRole = user?.role || 'CUSTOMER';

    if (userRole === 'CUSTOMER') {
      return [
        allNavigationItems.find((item) => item.path === ROUTE_PATHS.APP.HOME),
        allNavigationItems.find(
          (item) => item.path === ROUTE_PATHS.APP.DISCOVER,
        ),
        allNavigationItems.find(
          (item) => item.path === ROUTE_PATHS.APP.ARTISAN.UPGRADE_REQUEST,
        ), // Special create button
        allNavigationItems.find(
          (item) => item.path === ROUTE_PATHS.APP.SHOP.BASE,
        ),
        allNavigationItems.find(
          (item) => item.path === ROUTE_PATHS.APP.ORDERS.MY_PURCHASES,
        ),
      ].filter(Boolean);
    }

    if (userRole === 'ARTISAN') {
      return [
        allNavigationItems.find((item) => item.path === ROUTE_PATHS.APP.HOME),
        allNavigationItems.find(
          (item) => item.path === ROUTE_PATHS.APP.ARTISAN.DASHBOARD,
        ),
        allNavigationItems.find(
          (item) => item.path === ROUTE_PATHS.APP.POSTS.MY_POSTS,
        ), // Create posts
        allNavigationItems.find(
          (item) => item.path === ROUTE_PATHS.APP.PRODUCTS.BASE,
        ),
        allNavigationItems.find(
          (item) => item.path === ROUTE_PATHS.APP.ORDERS.MY_SALES,
        ),
      ].filter(Boolean);
    }

    if (userRole === 'ADMIN') {
      return [
        {
          path: ROUTE_PATHS.ADMIN.DASHBOARD,
          icon: 'dashboard',
          label: 'Tổng quan',
        },
        {
          path: ROUTE_PATHS.ADMIN.ARTISAN_REQUESTS,
          icon: 'user-check',
          label: 'Nghệ nhân',
        },
        {
          path: ROUTE_PATHS.ADMIN.POSTS_MANAGEMENT,
          icon: 'edit',
          label: 'Bài viết',
        },
        {
          path: ROUTE_PATHS.ADMIN.PRODUCTS_MANAGEMENT,
          icon: 'package',
          label: 'Sản phẩm',
        },
        {
          path: ROUTE_PATHS.ADMIN.ORDERS,
          icon: 'shopping-cart',
          label: 'Đơn hàng',
        },
      ];
    }

    return [];
  };

  const navigationItems = getMobileNavigationItems();

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

  const isActiveLink = (href: string) => {
    return isActiveMenu(href, location.pathname);
  };

  const getSpecialItem = () => {
    const userRole = user?.role || 'CUSTOMER';

    if (userRole === 'CUSTOMER') {
      return navigationItems.find(
        (item) => item?.path === ROUTE_PATHS.APP.ARTISAN.UPGRADE_REQUEST,
      );
    }

    if (userRole === 'ARTISAN') {
      return navigationItems.find(
        (item) => item?.path === ROUTE_PATHS.APP.POSTS.MY_POSTS,
      );
    }

    return null;
  };

  const specialItem = getSpecialItem();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item, index) => {
          if (!item) return null;

          const isActive = isActiveLink(item.path);
          const IconComponent = getIcon(item.icon, isActive);
          const badgeCount = item.badge ? getBadgeCount(item.badge) : 0;
          const isSpecial = specialItem && item.path === specialItem.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center space-y-1 px-1 relative
                ${isActive ? 'text-primary' : 'text-gray-500'}
                ${isSpecial ? 'relative' : ''}
              `}
            >
              {isSpecial ? (
                <div
                  className={`
                  p-3 rounded-full shadow-lg -mt-6
                  ${
                    user?.role === 'CUSTOMER'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-primary text-white'
                  }
                `}
                >
                  <IconComponent className="h-6 w-6" />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <IconComponent className="h-6 w-6" />
                    {badgeCount > 0 && (
                      <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {badgeCount > 9 ? '9+' : badgeCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium truncate">
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
