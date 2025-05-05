import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  HeartIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  HeartIcon as HeartIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid';

export const MobileNav: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Home',
      path: '/',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      name: 'Discover',
      path: '/discover',
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassIconSolid,
    },
    {
      name: 'Create',
      path: '/post/create',
      icon: PlusCircleIcon,
      activeIcon: PlusCircleIconSolid,
      special: true,
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: HeartIcon,
      activeIcon: HeartIconSolid,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: UserIcon,
      activeIcon: UserIconSolid,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 md:hidden">
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
            </Link>
          );
        })}
      </div>
    </div>
  );
};
