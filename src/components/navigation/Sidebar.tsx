import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';
import { getNavItemsByRole, NavItem } from '../../constants/navigation';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
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

  // Get navigation items based on user role
  const navItems = getNavItemsByRole(user?.role);

  const renderNavItem = (item: NavItem) => (
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
            <span className="mr-3">
              {isActive(item.path) ? (
                <item.activeIcon className="w-5 h-5" />
              ) : (
                <item.icon className="w-5 h-5" />
              )}
            </span>
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
            item.special && 'bg-accent text-white hover:bg-accent-dark',
          )}
        >
          <span className="mr-3">
            {isActive(item.path) ? (
              <item.activeIcon className="w-5 h-5" />
            ) : (
              <item.icon className="w-5 h-5" />
            )}
          </span>
          <span className="flex-1">{item.name}</span>
          {item.badge && (
            <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 flex flex-col w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-300 ease-in-out transform md:translate-x-0 md:static md:z-auto pt-16',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
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
            {navItems.map(renderNavItem)}
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
    </>
  );
};
