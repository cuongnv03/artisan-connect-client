import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBox } from '../common/SearchBox';
import { Button } from '../ui/Button';
import { FireIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

interface DiscoverHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: (query: string) => void;
}

export const DiscoverHero: React.FC<DiscoverHeroProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
}) => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Khám phá thế giới nghệ thuật
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Tìm kiếm nghệ nhân, sản phẩm và câu chuyện thú vị từ cộng đồng thủ công
        Việt Nam
      </p>

      <div className="max-w-2xl mx-auto mb-6">
        <SearchBox
          value={searchQuery}
          onChange={onSearchChange}
          onSubmit={onSearch}
          placeholder="Tìm kiếm nghệ nhân, sản phẩm, bài viết..."
        />
      </div>
    </div>
  );
};
