// src/components/ui/Tabs.tsx
import React, { useState } from 'react';

export interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  className?: string;
  variant?: 'line' | 'card' | 'pills';
  size?: 'sm' | 'md' | 'lg';
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveKey,
  activeKey,
  onChange,
  className = '',
  variant = 'line',
  size = 'md',
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey || items[0]?.key || '',
  );

  const currentActiveKey =
    activeKey !== undefined ? activeKey : internalActiveKey;

  const handleTabClick = (key: string) => {
    const item = items.find((item) => item.key === key);
    if (item?.disabled) return;

    if (activeKey === undefined) {
      setInternalActiveKey(key);
    }
    onChange?.(key);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const getTabClasses = (item: TabItem, isActive: boolean) => {
    const baseClasses =
      'inline-flex items-center font-medium transition-colors focus:outline-none';
    const sizeClass = sizeClasses[size];

    if (variant === 'line') {
      return `${baseClasses} ${sizeClass} border-b-2 ${
        isActive
          ? 'border-accent text-accent'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      } ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
    }

    if (variant === 'card') {
      return `${baseClasses} ${sizeClass} border rounded-t-lg ${
        isActive
          ? 'border-accent border-b-white bg-white text-accent -mb-px'
          : 'border-gray-300 text-gray-500 hover:text-gray-700'
      } ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
    }

    // pills variant
    return `${baseClasses} ${sizeClass} rounded-lg ${
      isActive
        ? 'bg-accent text-white'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
    } ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
  };

  const activeItem = items.find((item) => item.key === currentActiveKey);

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div
        className={`flex ${
          variant === 'line' ? 'border-b border-gray-200' : 'space-x-1'
        }`}
      >
        {items.map((item) => {
          const isActive = item.key === currentActiveKey;

          return (
            <button
              key={item.key}
              className={getTabClasses(item, isActive)}
              onClick={() => handleTabClick(item.key)}
              disabled={item.disabled}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
              {item.badge && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    isActive
                      ? 'bg-white text-accent'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div
        className={`${
          variant === 'card'
            ? 'border border-gray-300 border-t-0 rounded-b-lg bg-white p-4'
            : 'mt-4'
        }`}
      >
        {activeItem?.content}
      </div>
    </div>
  );
};
