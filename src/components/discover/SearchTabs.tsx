import React from 'react';
import {
  SparklesIcon,
  UserGroupIcon,
  FireIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '../ui/Badge';
import { SearchType } from '../../contexts/DiscoverContext';

interface SearchTabsProps {
  activeTab: SearchType;
  onTabChange: (tab: SearchType) => void;
  totals: Record<string, number>;
}

export const SearchTabs: React.FC<SearchTabsProps> = ({
  activeTab,
  onTabChange,
  totals,
}) => {
  const tabs = [
    { key: 'all', label: 'Tất cả', icon: SparklesIcon },
    { key: 'artisans', label: 'Nghệ nhân', icon: UserGroupIcon },
    { key: 'users', label: 'Người dùng', icon: UserGroupIcon },
    { key: 'posts', label: 'Bài viết', icon: FireIcon },
    { key: 'products', label: 'Sản phẩm', icon: ShoppingBagIcon },
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-lg max-w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key as SearchType)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
            {totals[tab.key] > 0 && (
              <Badge variant="secondary" size="sm" className="ml-2">
                {totals[tab.key]}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
