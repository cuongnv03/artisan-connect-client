import React from 'react';
import clsx from 'clsx';

interface FeedFilterBarProps {
  selected: string;
  onChange: (filter: string) => void;
}

export const FeedFilterBar: React.FC<FeedFilterBarProps> = ({
  selected,
  onChange,
}) => {
  const filters = [
    { id: 'all', label: 'All Posts' },
    { id: 'STORY', label: 'Stories' },
    { id: 'TUTORIAL', label: 'Tutorials' },
    { id: 'PRODUCT_SHOWCASE', label: 'Products' },
    { id: 'BEHIND_THE_SCENES', label: 'Behind the Scenes' },
    { id: 'EVENT', label: 'Events' },
  ];

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex space-x-2 pb-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onChange(filter.id)}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              selected === filter.id
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};
