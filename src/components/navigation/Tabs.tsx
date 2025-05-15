import React, { useState } from 'react';
import clsx from 'clsx';

interface Tab {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  variant?: 'underline' | 'pills' | 'contained';
  className?: string;
  tabsClassName?: string;
  contentClassName?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = 'underline',
  className = '',
  tabsClassName = '',
  contentClassName = '',
  orientation = 'horizontal',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) onChange(tabId);
  };

  // Find the active tab content
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  // Variant styles
  const getTabStyles = (tab: Tab, isActive: boolean): string => {
    switch (variant) {
      case 'pills':
        return clsx(
          'px-3 py-2 rounded-md text-sm font-medium',
          isActive
            ? 'bg-accent text-white shadow-sm'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
          tab.disabled && 'opacity-50 cursor-not-allowed',
        );

      case 'contained':
        return clsx(
          'px-4 py-2 text-sm font-medium',
          isActive
            ? 'bg-white border-t border-l border-r border-gray-200 rounded-t-md -mb-px'
            : 'bg-gray-100 text-gray-700 hover:text-gray-900 rounded-t-md',
          tab.disabled && 'opacity-50 cursor-not-allowed',
        );

      case 'underline':
      default:
        return clsx(
          'px-1 py-2 text-sm font-medium border-b-2',
          isActive
            ? 'border-accent text-accent-dark'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          tab.disabled && 'opacity-50 cursor-not-allowed',
        );
    }
  };

  return (
    <div
      className={clsx(
        'w-full',
        orientation === 'vertical' && 'flex',
        className,
      )}
    >
      {/* Tab List */}
      <div
        className={clsx(
          orientation === 'horizontal'
            ? 'flex border-b border-gray-200'
            : 'flex flex-col flex-shrink-0 border-r border-gray-200 w-48',
          tabsClassName,
        )}
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            className={getTabStyles(tab, activeTab === tab.id)}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
          >
            <div className="flex items-center">
              {tab.label}
              {tab.badge && (
                <span
                  className={clsx(
                    'ml-2 px-2 py-0.5 text-xs rounded-full',
                    activeTab === tab.id
                      ? 'bg-white text-accent'
                      : 'bg-gray-200 text-gray-700',
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className={clsx(
          'mt-2',
          orientation === 'vertical' && 'pl-4 flex-1',
          variant === 'contained' && 'border border-gray-200 rounded-b-md p-4',
          contentClassName,
        )}
      >
        {activeTabContent}
      </div>
    </div>
  );
};
