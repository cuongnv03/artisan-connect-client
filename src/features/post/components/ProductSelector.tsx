import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Button } from '../../../components/common/Button';
import { Loader } from '../../../components/ui/Loader';
import { Alert } from '../../../components/ui/Alert';
import { Input } from '../../../components/common/Input';
import { ProductService } from '../../../services/product.service';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { formatPrice } from '../../../utils/formatters';

interface ProductSelectorProps {
  selectedProductIds: string[];
  onChange: (productIds: string[]) => void;
  maxProducts?: number;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedProductIds,
  onChange,
  maxProducts = 5,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSelector, setShowSelector] = useState(false);

  // Fetch user's products
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery(['user-products'], () => ProductService.getMyProducts(), {
    enabled: showSelector,
  });

  // Fetch selected products details
  const { data: selectedProducts, isLoading: isLoadingSelected } = useQuery(
    ['selected-products', selectedProductIds],
    () => ProductService.getProductsByIds(selectedProductIds),
    {
      enabled: selectedProductIds.length > 0,
    },
  );

  const filteredProducts = products?.data.filter(
    (product) =>
      !selectedProductIds.includes(product.id) &&
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleSelectProduct = (productId: string) => {
    if (selectedProductIds.length >= maxProducts) return;
    onChange([...selectedProductIds, productId]);
  };

  const handleRemoveProduct = (productId: string) => {
    onChange(selectedProductIds.filter((id) => id !== productId));
  };

  return (
    <div>
      {/* Selected Products */}
      <div className="space-y-3">
        {isLoadingSelected ? (
          <Loader size="sm" />
        ) : selectedProducts && selectedProducts.length > 0 ? (
          <div className="space-y-3">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center p-3 border border-gray-200 rounded-lg"
              >
                {product.images && product.images[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-md mr-3"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(product.id)}
                  className="ml-2 text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-2">
            No products selected. Add products to feature them in your post.
          </p>
        )}
      </div>

      {/* Add Product Button */}
      <div className="mt-4">
        {selectedProductIds.length < maxProducts ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSelector(true)}
            leftIcon={<PlusIcon className="h-4 w-4" />}
            isFullWidth
          >
            Add Product
          </Button>
        ) : (
          <p className="text-xs text-gray-500 text-center">
            Maximum {maxProducts} products reached
          </p>
        )}
      </div>

      {/* Product Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Select Products
            </h3>

            {/* Search Input */}
            <div className="mb-4">
              <Input
                placeholder="Search your products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftAddon={
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                }
              />
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="py-4 text-center">
                  <Loader size="md" />
                </div>
              ) : isError ? (
                <Alert type="error" variant="subtle">
                  Failed to load products
                </Alert>
              ) : filteredProducts && filteredProducts.length > 0 ? (
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelectProduct(product.id)}
                    >
                      {product.images && product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-md mr-3"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {searchQuery
                    ? 'No products match your search'
                    : 'No products available'}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowSelector(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
