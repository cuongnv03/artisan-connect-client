import React from 'react';
import { UserIcon, MapPinIcon, CogIcon } from '@heroicons/react/24/outline';
import { Tabs } from '../../components/ui/Tabs';
import { BasicInfoSection } from '../../components/profile/BasicInfoSection';
import { ExtendedInfoSection } from '../../components/profile/ExtendedInfoSection';
import { AddressManagementSection } from '../../components/profile/AddressManagementSection';

export const ProfileManagementPage: React.FC = () => {
  const tabItems = [
    {
      key: 'basic',
      label: 'Thông tin cơ bản',
      icon: <UserIcon className="w-4 h-4" />,
      content: <BasicInfoSection />,
    },
    {
      key: 'extended',
      label: 'Thông tin mở rộng',
      icon: <CogIcon className="w-4 h-4" />,
      content: <ExtendedInfoSection />,
    },
    {
      key: 'addresses',
      label: 'Địa chỉ',
      icon: <MapPinIcon className="w-4 h-4" />,
      content: <AddressManagementSection />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lý thông tin cá nhân
        </h1>
        <p className="text-gray-600">
          Cập nhật thông tin cá nhân và địa chỉ của bạn
        </p>
      </div>

      <Tabs items={tabItems} variant="line" />
    </div>
  );
};
