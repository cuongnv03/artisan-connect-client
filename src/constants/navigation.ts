import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  HeartIcon,
  UserIcon,
  ShoppingBagIcon,
  StarIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  CogIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';

import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  HeartIcon as HeartIconSolid,
  UserIcon as UserIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  StarIcon as StarIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid,
  CogIcon as CogIconSolid,
  InboxIcon as InboxIconSolid,
} from '@heroicons/react/24/solid';

import { UserRole } from '../types/user.types';

export interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  activeIcon: React.ComponentType<any>;
  badge?: number;
  special?: boolean;
  children?: Omit<NavItem, 'icon' | 'activeIcon' | 'children'>[];
}

// Common navigation items for all authenticated users
export const getCommonNavItems = (): NavItem[] => [
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
];

// Navigation items for customers
export const getCustomerNavItems = (): NavItem[] => [
  ...getCommonNavItems(),
  {
    name: 'Create',
    path: '/post/create',
    icon: PlusCircleIcon,
    activeIcon: PlusCircleIconSolid,
    special: true,
  },
  {
    name: 'Profile',
    path: '/profile',
    icon: UserIcon,
    activeIcon: UserIconSolid,
  },
];

// Navigation items for artisans
export const getArtisanNavItems = (): NavItem[] => [
  ...getCommonNavItems(),
  {
    name: 'Dashboard',
    path: '/artisan/dashboard',
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid,
  },
  {
    name: 'Products',
    path: '/products/manage',
    icon: ShoppingBagIcon,
    activeIcon: ShoppingBagIconSolid,
    badge: 3,
    children: [
      { name: 'All Products', path: '/products/manage' },
      { name: 'Add Product', path: '/products/create' },
      { name: 'Categories', path: '/products/categories' },
    ],
  },
  {
    name: 'Create Post',
    path: '/post/create',
    icon: PlusCircleIcon,
    activeIcon: PlusCircleIconSolid,
    special: true,
  },
  {
    name: 'Orders',
    path: '/orders',
    icon: InboxIcon,
    activeIcon: InboxIconSolid,
    badge: 5,
  },
  {
    name: 'Profile',
    path: '/artisan/profile',
    icon: UserIcon,
    activeIcon: UserIconSolid,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: CogIcon,
    activeIcon: CogIconSolid,
  },
];

// Navigation items for admins
export const getAdminNavItems = (): NavItem[] => [
  ...getCommonNavItems(),
  {
    name: 'Dashboard',
    path: '/admin/dashboard',
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid,
  },
  {
    name: 'Users',
    path: '/admin/users',
    icon: UserIcon,
    activeIcon: UserIconSolid,
  },
  {
    name: 'Artisans',
    path: '/admin/artisans',
    icon: StarIcon,
    activeIcon: StarIconSolid,
  },
  {
    name: 'Products',
    path: '/admin/products',
    icon: ShoppingBagIcon,
    activeIcon: ShoppingBagIconSolid,
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: CogIcon,
    activeIcon: CogIconSolid,
  },
];

// Get navigation items based on user role
export const getNavItemsByRole = (role?: UserRole): NavItem[] => {
  switch (role) {
    case 'ARTISAN':
      return getArtisanNavItems();
    case 'ADMIN':
      return getAdminNavItems();
    case 'CUSTOMER':
    default:
      return getCustomerNavItems();
  }
};
