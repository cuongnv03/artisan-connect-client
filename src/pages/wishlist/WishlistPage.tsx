import React, { useState } from 'react';
import { WishlistItemType } from '../../types/wishlist';
import { useWishlist } from '../../hooks/wishlist/useWishlist';
import { useCart } from '../../contexts/CartContext';
import { WishlistGrid } from '../../components/wishlist/WishlistGrid';
import { Tabs, TabItem } from '../../components/ui/Tabs';
import {
  HeartIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export const WishlistPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  const {
    wishlistItems: allItems,
    loading,
    error,
    hasMore,
    removeFromWishlist,
    loadMore,
  } = useWishlist();

  const { addToCart } = useCart();

  const handleRemove = async (itemType: WishlistItemType, itemId: string) => {
    await removeFromWishlist(itemType, itemId);
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
  };

  // Filter items based on active tab
  const getFilteredItems = () => {
    switch (activeTab) {
      case 'products':
        return allItems.filter(
          (item) => item.itemType === WishlistItemType.PRODUCT,
        );
      case 'posts':
        return allItems.filter(
          (item) => item.itemType === WishlistItemType.POST,
        );
      default:
        return allItems;
    }
  };

  const filteredItems = getFilteredItems();
  const productCount = allItems.filter(
    (item) => item.itemType === WishlistItemType.PRODUCT,
  ).length;
  const postCount = allItems.filter(
    (item) => item.itemType === WishlistItemType.POST,
  ).length;

  const tabItems: TabItem[] = [
    {
      key: 'all',
      label: 'Tất cả',
      icon: <HeartIcon className="w-4 h-4" />,
      badge: allItems.length,
      content: (
        <WishlistGrid
          items={filteredItems}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onRemove={handleRemove}
          onAddToCart={handleAddToCart}
          onLoadMore={loadMore}
        />
      ),
    },
    {
      key: 'products',
      label: 'Sản phẩm',
      icon: <ShoppingBagIcon className="w-4 h-4" />,
      badge: productCount,
      content: (
        <WishlistGrid
          items={filteredItems}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onRemove={handleRemove}
          onAddToCart={handleAddToCart}
          onLoadMore={loadMore}
        />
      ),
    },
    {
      key: 'posts',
      label: 'Bài viết',
      icon: <DocumentTextIcon className="w-4 h-4" />,
      badge: postCount,
      content: (
        <WishlistGrid
          items={filteredItems}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onRemove={handleRemove}
          onAddToCart={handleAddToCart}
          onLoadMore={loadMore}
        />
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Danh sách yêu thích
        </h1>
        <p className="text-gray-600">
          Quản lý những sản phẩm và bài viết bạn yêu thích
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={setActiveTab}
        variant="line"
        size="md"
      />
    </div>
  );
};
