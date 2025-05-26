import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  PresentationChartBarIcon,
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  activeIcon: React.ComponentType<any>;
  badge?: number;
  description?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { state } = useAuth();
  const { user } = state;
  const location = useLocation();

  const getNavigationItems = (): NavItem[] => {
    const commonItems: NavItem[] = [
      {
        name: 'Trang chủ',
        href: '/home',
        icon: HomeIcon,
        activeIcon: HomeIconSolid,
        description: 'Feed bài viết từ nghệ nhân bạn theo dõi',
      },
      {
        name: 'Khám phá',
        href: '/discover',
        icon: MagnifyingGlassIcon,
        activeIcon: MagnifyingGlassIconSolid,
        description: 'Tìm kiếm nghệ nhân, sản phẩm, bài viết',
      },
      {
        name: 'Cửa hàng',
        href: '/shop',
        icon: ShoppingBagIcon,
        activeIcon: ShoppingBagIconSolid,
        description: 'Duyệt và mua sắm sản phẩm',
      },
      {
        name: 'Bài viết',
        href: '/posts/my-posts',
        icon: PlusCircleIcon,
        activeIcon: PlusCircleIconSolid,
        description: 'Quản lý bài viết',
      },
    ];

    const roleSpecificItems: NavItem[] = [];

    if (user?.role === 'CUSTOMER') {
      roleSpecificItems.push(
        {
          name: 'Giỏ hàng',
          href: '/cart',
          icon: ShoppingCartIcon,
          activeIcon: ShoppingCartIconSolid,
          badge: 0, // TODO: get from cart context
        },
        {
          name: 'Đơn hàng',
          href: '/orders',
          icon: ClipboardDocumentListIcon,
          activeIcon: ClipboardDocumentListIconSolid,
          description: 'Đơn hàng bạn đã đặt',
        },
        {
          name: 'Trở thành nghệ nhân',
          href: '/upgrade-to-artisan',
          icon: StarIcon,
          activeIcon: StarIcon,
          description: 'Yêu cầu nâng cấp tài khoản',
        },
      );
    }

    if (user?.role === 'ARTISAN') {
      roleSpecificItems.push(
        {
          name: 'Bảng điều khiển',
          href: '/artisan/dashboard',
          icon: CreditCardIcon,
          activeIcon: CreditCardIcon,
          description: 'Thống kê và phân tích',
        },
        {
          name: 'Quản lý sản phẩm',
          href: '/artisan/products',
          icon: TagIcon,
          activeIcon: TagIcon,
          description: 'Sản phẩm của bạn',
        },
        {
          name: 'Giỏ hàng',
          href: '/cart',
          icon: ShoppingCartIcon,
          activeIcon: ShoppingCartIconSolid,
          badge: 0,
        },
        {
          name: 'Đơn hàng',
          href: '/orders',
          icon: ClipboardDocumentListIcon,
          activeIcon: ClipboardDocumentListIconSolid,
          description: 'Đơn hàng bán và mua',
        },
        {
          name: 'Phân tích',
          href: '/artisan/analytics',
          icon: ChartBarIcon,
          activeIcon: ChartBarIcon,
          description: 'Phân tích hiệu suất bán hàng',
        },
        {
          name: 'Tùy chỉnh trang',
          href: '/artisan/customize',
          icon: PaintBrushIcon,
          activeIcon: PaintBrushIcon,
          description: 'Tùy chỉnh giao diện cá nhân',
        },
      );
    }

    if (user?.role === 'ADMIN') {
      roleSpecificItems.push(
        {
          name: 'Dashboard Admin',
          href: '/admin/dashboard',
          icon: PresentationChartLineIcon,
          activeIcon: PresentationChartLineIcon,
          description: 'Tổng quan hệ thống',
        },
        {
          name: 'Quản lý người dùng',
          href: '/admin/users',
          icon: UsersIcon,
          activeIcon: UsersIcon,
          description: 'Quản lý tài khoản người dùng',
        },
        {
          name: 'Duyệt nghệ nhân',
          href: '/admin/artisan-requests',
          icon: StarIcon,
          activeIcon: StarIcon,
          description: 'Phê duyệt yêu cầu nghệ nhân',
          badge: 0, // TODO: get pending requests count
        },
        {
          name: 'Quản lý nội dung',
          href: '/admin/content',
          icon: DocumentTextIcon,
          activeIcon: DocumentTextIcon,
          description: 'Kiểm duyệt bài viết, sản phẩm',
        },
      );
    }

    const communicationItems: NavItem[] = [
      {
        name: 'Tin nhắn',
        href: '/messages',
        icon: ChatBubbleLeftIcon,
        activeIcon: ChatBubbleLeftIconSolid,
        badge: 0, // TODO: get unread count
      },
      {
        name: 'Thông báo',
        href: '/notifications',
        icon: BellIcon,
        activeIcon: BellIconSolid,
        badge: 0, // TODO: get unread count
      },
    ];

    const settingsItems: NavItem[] = [
      {
        name: 'Trang cá nhân',
        href: '/profile',
        icon: UserIcon,
        activeIcon: UserIconSolid,
      },
      {
        name: 'Cài đặt',
        href: '/settings',
        icon: CogIcon,
        activeIcon: CogIconSolid,
      },
    ];

    return [
      ...commonItems,
      ...roleSpecificItems,
      ...communicationItems,
      ...settingsItems,
    ];
  };

  const navigationItems = getNavigationItems();

  const isActiveLink = (href: string) => {
    if (href === '/home' && location.pathname === '/') return true;
    return location.pathname.startsWith(href);
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
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-hidden">
            {navigationItems.map((item) => {
              const isActive = isActiveLink(item.href);
              const IconComponent = isActive ? item.activeIcon : item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  onClick={() => onClose()}
                >
                  <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{item.name}</span>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`
                      ml-2 px-2 py-0.5 text-xs rounded-full
                      ${
                        isActive
                          ? 'bg-white text-primary'
                          : 'bg-red-500 text-white'
                      }
                    `}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
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
