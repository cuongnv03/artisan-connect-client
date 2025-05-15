import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { getNavItemsByRole } from '../../constants/navigation';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { state } = useAuth();
  const { user } = state;

  // Get navigation items based on user role
  // For mobile, we'll only show the main items (up to 5)
  const navigationItems = getNavItemsByRole(user?.role).slice(0, 5);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 md:hidden z-10">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => {
          const active = isActive(item.path);
          const Icon = active ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={clsx(
                'flex flex-col items-center justify-center',
                active && 'text-accent',
                !active && 'text-gray-500',
                item.special && !active && 'text-accent',
              )}
            >
              <Icon className={clsx('h-6 w-6', item.special && 'h-8 w-8')} />
              <span className="text-xs mt-1">{item.name}</span>
              {item.badge && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
