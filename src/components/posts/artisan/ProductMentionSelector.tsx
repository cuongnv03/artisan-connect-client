import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { productService } from '../../../services/product.service';
import { useDebounce } from '../../../hooks/useDebounce';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Avatar } from '../../ui/Avatar';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { formatPrice } from '../../../utils/format';

export interface ProductMentionData {
  productId: string;
  contextText: string;
  position: number;
  product: {
    id: string;
    name: string;
    slug?: string;
    images: string[];
    price: number;
    discountPrice?: number;
    status: string;
    seller: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      artisanProfile?: {
        shopName: string;
        isVerified: boolean;
      };
    };
  };
}

interface ProductMentionSelectorProps {
  mentions: ProductMentionData[];
  onChange: (mentions: ProductMentionData[]) => void;
  className?: string;
}

interface SearchProduct {
  id: string;
  name: string;
  slug?: string;
  images: string[];
  price: number;
  discountPrice?: number;
  status: string;
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    artisanProfile?: {
      shopName: string;
      isVerified: boolean;
    };
  };
}

export const ProductMentionSelector: React.FC<ProductMentionSelectorProps> = ({
  mentions,
  onChange,
  className = '',
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingMention, setEditingMention] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchProducts();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  const searchProducts = async () => {
    if (!debouncedSearchQuery.trim()) return;

    setIsSearching(true);
    try {
      const result = await productService.searchProducts({
        q: debouncedSearchQuery,
        page: 1,
        limit: 10,
      });
      setSearchResults(result.data);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addMention = (product: SearchProduct) => {
    const newMention: ProductMentionData = {
      productId: product.id,
      contextText: '',
      position: mentions.length,
      product,
    };

    onChange([...mentions, newMention]);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  const removeMention = (productId: string) => {
    const updatedMentions = mentions
      .filter((m) => m.productId !== productId)
      .map((m, index) => ({ ...m, position: index }));
    onChange(updatedMentions);
  };

  const updateMentionContext = (productId: string, contextText: string) => {
    const updatedMentions = mentions.map((m) =>
      m.productId === productId ? { ...m, contextText } : m,
    );
    onChange(updatedMentions);
  };

  const isProductAlreadyMentioned = (productId: string) => {
    return mentions.some((m) => m.productId === productId);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Sản phẩm đề cập trong bài viết
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<PlusIcon className="w-4 h-4" />}
          onClick={() => setIsSearchOpen(true)}
        >
          Thêm sản phẩm
        </Button>
      </div>

      {/* Current Mentions */}
      {mentions.length > 0 && (
        <div className="space-y-4 mb-6">
          {mentions.map((mention) => (
            <Card key={mention.productId} className="p-4">
              <div className="flex items-start space-x-4">
                <img
                  src={
                    mention.product.images?.[0] || '/placeholder-product.jpg'
                  }
                  alt={mention.product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {mention.product.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formatPrice(
                      mention.product.discountPrice || mention.product.price,
                    )}
                  </p>
                  <div className="flex items-center mt-1">
                    <Avatar
                      src={mention.product.seller.avatarUrl}
                      alt={`${mention.product.seller.firstName} ${mention.product.seller.lastName}`}
                      size="xs"
                    />
                    <span className="ml-2 text-xs text-gray-500">
                      {mention.product.seller.artisanProfile?.shopName ||
                        `${mention.product.seller.firstName} ${mention.product.seller.lastName}`}
                    </span>
                  </div>

                  {/* Context Text Input */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả ngữ cảnh (tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Sản phẩm này được làm từ..."
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                      value={mention.contextText}
                      onChange={(e) =>
                        updateMentionContext(mention.productId, e.target.value)
                      }
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeMention(mention.productId)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Tìm kiếm sản phẩm
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="md" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((product) => {
                      const isAlreadyMentioned = isProductAlreadyMentioned(
                        product.id,
                      );

                      return (
                        <div
                          key={product.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            isAlreadyMentioned
                              ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                              : 'hover:bg-gray-50 border-gray-200 hover:border-primary'
                          }`}
                          onClick={() =>
                            !isAlreadyMentioned && addMention(product)
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                product.images?.[0] ||
                                '/placeholder-product.jpg'
                              }
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {product.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {formatPrice(
                                  product.discountPrice || product.price,
                                )}
                              </p>
                              <div className="flex items-center">
                                <Avatar
                                  src={product.seller.avatarUrl}
                                  alt={`${product.seller.firstName} ${product.seller.lastName}`}
                                  size="xs"
                                />
                                <span className="ml-2 text-xs text-gray-500">
                                  {product.seller.artisanProfile?.shopName ||
                                    `${product.seller.firstName} ${product.seller.lastName}`}
                                </span>
                              </div>
                            </div>
                            {isAlreadyMentioned && (
                              <Badge variant="secondary" size="sm">
                                Đã thêm
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : searchQuery && !isSearching ? (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy sản phẩm nào
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nhập từ khóa để tìm kiếm sản phẩm
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
