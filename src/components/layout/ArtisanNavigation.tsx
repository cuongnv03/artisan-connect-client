import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { ROUTE_PATHS } from '../../constants/routes';

const navigation = [
  {
    name: 'Dashboard',
    href: ROUTE_PATHS.APP.ARTISAN.DASHBOARD,
    icon: HomeIcon,
  },
  {
    name: 'Sản phẩm',
    href: ROUTE_PATHS.APP.ARTISAN.PRODUCTS,
    icon: CubeIcon,
  },
  {
    name: 'Thống kê',
    href: ROUTE_PATHS.APP.ARTISAN.ANALYTICS,
    icon: ChartBarIcon,
  },
  {
    name: 'Tùy chỉnh',
    href: ROUTE_PATHS.APP.ARTISAN.CUSTOMIZE,
    icon: Cog6ToothIcon,
  },
];

export const ArtisanNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive =
          location.pathname === item.href ||
          (item.href === ROUTE_PATHS.APP.ARTISAN.PRODUCTS &&
            location.pathname.startsWith('/artisan/products'));

        return (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              isActive
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon
              className={`mr-3 h-6 w-6 ${
                isActive
                  ? 'text-white'
                  : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            {item.name}
          </Link>
        );
      })}

      {/* Quick Create Product Button */}
      <Link
        to={ROUTE_PATHS.APP.ARTISAN.CREATE_PRODUCT}
        className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-primary hover:bg-primary hover:text-white border border-primary border-dashed"
      >
        <PlusIcon className="mr-3 h-6 w-6" />
        Thêm sản phẩm
      </Link>
    </nav>
  );
};
