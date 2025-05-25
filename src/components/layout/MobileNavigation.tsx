import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ShoppingBagIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid';

export const MobileNavigation: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Trang chủ',
      href: '/home',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      name: 'Khám phá',
      href: '/discover',
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassIconSolid,
    },
    {
      name: 'Tạo',
      href: '/create-post',
      icon: PlusCircleIcon,
      activeIcon: PlusCircleIconSolid,
      special: true,
    },
    {
      name: 'Cửa hàng',
      href: '/shop',
      icon: ShoppingBagIcon,
      activeIcon: ShoppingBagIconSolid,
    },
    {
      name: 'Cá nhân',
      href: '/profile',
      icon: UserIcon,
      activeIcon: UserIconSolid,
    },
  ];

  const isActiveLink = (href: string) => {
    if (href === '/home' && location.pathname === '/') return true;
    return location.pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => {
          const isActive = isActiveLink(item.href);
          const IconComponent = isActive ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex flex-col items-center justify-center space-y-1 px-1
                ${isActive ? 'text-primary' : 'text-gray-500'}
                ${item.special ? 'relative' : ''}
              `}
            >
              {item.special ? (
                <div className="bg-primary text-white p-3 rounded-full shadow-lg -mt-6">
                  <IconComponent className="h-6 w-6" />
                </div>
              ) : (
                <IconComponent className="h-6 w-6" />
              )}

              {!item.special && (
                <span className="text-xs font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
