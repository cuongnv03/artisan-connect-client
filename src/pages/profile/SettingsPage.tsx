import React from 'react';
import {
  ShieldCheckIcon,
  BellIcon,
  EyeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Tabs } from '../../components/ui/Tabs';
import { SecuritySection } from '../../components/settings/SecuritySection';
import { DangerZoneSection } from '../../components/settings/DangerZoneSection';

export const SettingsPage: React.FC = () => {
  const tabItems = [
    {
      key: 'security',
      label: 'Bảo mật',
      icon: <ShieldCheckIcon className="w-4 h-4" />,
      content: <SecuritySection />,
    },
    {
      key: 'danger',
      label: 'Vùng nguy hiểm',
      icon: <TrashIcon className="w-4 h-4" />,
      content: <DangerZoneSection />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt tài khoản</h1>
        <p className="text-gray-600">
          Quản lý bảo mật và tùy chọn tài khoản của bạn
        </p>
      </div>

      <Tabs items={tabItems} variant="line" />
    </div>
  );
};
