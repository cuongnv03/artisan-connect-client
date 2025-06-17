import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Select } from '../ui/Dropdown';
import { NotificationType } from '../../types/notification';
import { useNotificationFilters } from '../../hooks/notifications/useNotificationFilters';

interface NotificationFiltersProps {
  filters: {
    type: NotificationType | '';
    isRead: boolean | '';
  };
  onFilterChange: (filters: any) => void;
  onRefresh: () => void;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filters,
  onFilterChange,
  onRefresh,
}) => {
  const { typeOptions, statusOptions } = useNotificationFilters();

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center">
          <FunnelIcon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-700">Bộ lọc:</span>
        </div>

        <div className="flex flex-col md:flex-row gap-3 flex-1">
          <Select
            value={filters.type}
            onChange={(value) =>
              handleFilterChange('type', value as NotificationType)
            }
            options={typeOptions}
            className="md:w-48"
          />

          <Select
            value={filters.isRead.toString()}
            onChange={(value) =>
              handleFilterChange('isRead', value === '' ? '' : value === 'true')
            }
            options={statusOptions}
            className="md:w-48"
          />
        </div>

        <Button variant="ghost" size="sm" onClick={onRefresh}>
          Làm mới
        </Button>
      </div>
    </Card>
  );
};
