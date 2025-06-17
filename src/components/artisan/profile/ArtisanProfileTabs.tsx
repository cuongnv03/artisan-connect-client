import React, { useState } from 'react';
import {
  DocumentTextIcon,
  ShoppingBagIcon,
  StarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Tabs } from '../../ui/Tabs';
import { ArtisanPostsSection } from './ArtisanPostsSection';
import { ArtisanProductsSection } from './ArtisanProductsSection';
import { ArtisanFollowersSection } from './ArtisanFollowersSection';
import { UserProfileDto } from '../../../types/user';

interface ArtisanProfileTabsProps {
  artisan: UserProfileDto;
  isOwnProfile: boolean;
}

export const ArtisanProfileTabs: React.FC<ArtisanProfileTabsProps> = ({
  artisan,
  isOwnProfile,
}) => {
  const tabItems = [
    {
      key: 'posts',
      label: 'Bài viết',
      icon: <DocumentTextIcon className="w-4 h-4" />,
      content: (
        <ArtisanPostsSection artisan={artisan} isOwnProfile={isOwnProfile} />
      ),
    },
    {
      key: 'products',
      label: 'Sản phẩm',
      icon: <ShoppingBagIcon className="w-4 h-4" />,
      content: (
        <ArtisanProductsSection artisan={artisan} isOwnProfile={isOwnProfile} />
      ),
    },
    {
      key: 'followers',
      label: 'Người theo dõi',
      icon: <UserGroupIcon className="w-4 h-4" />,
      badge: artisan.followerCount,
      content: <ArtisanFollowersSection artisan={artisan} />,
    },
  ];

  return <Tabs items={tabItems} variant="line" />;
};
