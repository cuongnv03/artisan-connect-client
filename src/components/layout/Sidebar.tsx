import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import clsx from 'clsx';
import {
  HomeIcon,
  UserIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CogIcon,
  ChatBubbleLeftIcon,
  InboxIcon,
  TagIcon,
  StarIcon,
  PencilSquareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  children?: Omit<NavItem, 'icon' | 'children'>[];
}

export const Sidebar: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const location = useLocation();

  // State to track expanded menu items
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

  // Toggle expanded state of menu items
  const toggleExpand = (name: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Determine if a path is active
  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  // Navigation items based on user role
  const getNavItems = (): NavItem[] => {
    const commonItems: NavItem[] = [
      {
        name: 'Dashboard',
        icon: <HomeIcon className="w-5 h-5" />,
        path: '/',
      },
      {
        name: 'Profile',
        icon: <UserIcon className="w-5 h-5" />,
        path: '/profile',
      },
    ];

    // Artisan-specific items
    if (user?.role === 'ARTISAN') {
      return [
        ...commonItems,
        {
          name: 'Artisan',
          icon: <StarIcon className="w-5 h-5" />,
          path: '/artisan',
          children: [
            { name: 'Dashboard', path: '/artisan/dashboard' },
            { name: 'Profile', path: '/artisan/profile' },
            { name: 'Shop Settings', path: '/artisan/settings' },
          ],
        },
        {
          name: 'Products',
          icon: <ShoppingBagIcon className="w-5 h-5" />,
          path: '/products',
          badge: 3,
          children: [
            { name: 'All Products', path: '/products/manage' },
            { name: 'Add Product', path: '/products/create' },
            { name: 'Categories', path: '/products/categories' },
          ],
        },
        {
          name: 'Orders',
          icon: <InboxIcon className="w-5 h-5" />,
          path: '/orders',
          badge: 5,
        },
        {
          name: 'Content',
          icon: <PencilSquareIcon className="w-5 h-5" />,
          path: '/content',
          children: [
            { name: 'Posts', path: '/content/posts' },
            { name: 'Create Post', path: '/content/posts/create' },
            { name: 'Drafts', path: '/content/drafts' },
          ],
        },
        {
          name: 'Sales',
          icon: <ChartBarIcon className="w-5 h-5" />,
          path: '/sales',
        },
        {
          name: 'Messages',
          icon: <ChatBubbleLeftIcon className="w-5 h-5" />,
          path: '/messages',
          badge: 2,
        },
        {
          name: 'Settings',
          icon: <CogIcon className="w-5 h-5" />,
          path: '/settings',
        },
      ];
    }

    // Admin-specific items
    if (user?.role === 'ADMIN') {
      return [
        ...commonItems,
        {
          name: 'Users',
          icon: <UserIcon className="w-5 h-5" />,
          path: '/admin/users',
        },
        {
          name: 'Artisans',
          icon: <StarIcon className="w-5 h-5" />,
          path: '/admin/artisans',
        },
        {
          name: 'Products',
          icon: <ShoppingBagIcon className="w-5 h-5" />,
          path: '/admin/products',
        },
        {
          name: 'Orders',
          icon: <InboxIcon className="w-5 h-5" />,
          path: '/admin/orders',
        },
        {
          name: 'Categories',
          icon: <TagIcon className="w-5 h-5" />,
          path: '/admin/categories',
        },
        {
          name: 'Reports',
          icon: <ChartBarIcon className="w-5 h-5" />,
          path: '/admin/reports',
        },
        {
          name: 'Settings',
          icon: <CogIcon className="w-5 h-5" />,
          path: '/admin/settings',
        },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full py-4">
        <div className="px-4">
          <h2 className="text-lg font-semibold text-gray-900 ml-2">
            {user?.role === 'ARTISAN'
              ? 'Artisan Dashboard'
              : user?.role === 'ADMIN'
              ? 'Admin Panel'
              : 'Navigation'}
          </h2>
        </div>

        <nav className="mt-6 flex-1 px-2 space-y-1">
          {navItems.map((item) => (
            <div key={item.name}>
              {item.children ? (
                // Parent item with submenu
                <div>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={clsx(
                      'group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md',
                      isActive(item.path)
                        ? 'bg-accent-light text-accent-dark'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                    )}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <span className="ml-3">
                      {expandedItems[item.name] ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </span>
                  </button>

                  {/* Submenu */}
                  {expandedItems[item.name] && (
                    <div className="mt-1 space-y-1 pl-10">
                      {item.children.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className={clsx(
                            'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                            isActive(subItem.path)
                              ? 'text-accent-dark font-medium'
                              : 'text-gray-700 hover:text-gray-900',
                          )}
                        >
                          {subItem.name}
                          {subItem.badge && (
                            <span className="ml-auto bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                              {subItem.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular menu item
                <Link
                  to={item.path}
                  className={clsx(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    isActive(item.path)
                      ? 'bg-accent-light text-accent-dark'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="mt-auto px-4 py-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full"
                src={user?.avatarUrl || 'https://via.placeholder.com/40'}
                alt={`${user?.firstName} ${user?.lastName}`}
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{`${user?.firstName} ${user?.lastName}`}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
