import React, { useState } from 'react';
import {
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { CreateNegotiationForm } from '../negotiations/CreateNegotiationForm';
import { useAuth } from '../../contexts/AuthContext';
import { useCartOperations } from '../../contexts/CartContext';
import { useWishlist } from '../../hooks/wishlist/useWishlist';
import { WishlistItemType } from '../../types/wishlist';
import { Product, ProductVariant } from '../../types/product';

interface ProductQuickActionsProps {
  product: Product;
  selectedVariant?: ProductVariant | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  isOwner?: boolean;
  className?: string;
}

export const ProductQuickActions: React.FC<ProductQuickActionsProps> = ({
  product,
  selectedVariant,
  quantity,
  onQuantityChange,
  isOwner = false,
  className = '',
}) => {
  const { state: authState } = useAuth();
  const { addToCartWithLoading, loading } = useCartOperations();
  const { toggleWishlistItem } = useWishlist();

  const [isWishlisted, setIsWishlisted] = useState(
    product.isWishlisted || false,
  );
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);

  const availableQuantity = selectedVariant?.quantity || product.quantity;
  const canAddToCart =
    authState.isAuthenticated &&
    !isOwner &&
    product.status === 'PUBLISHED' &&
    availableQuantity > 0;

  const canNegotiate =
    authState.isAuthenticated &&
    !isOwner &&
    product.allowNegotiation &&
    product.status === 'PUBLISHED';

  const handleAddToCart = async () => {
    if (!canAddToCart) return;

    await addToCartWithLoading(product.id, quantity, selectedVariant?.id);
  };

  const handleWishlistToggle = async () => {
    if (!authState.isAuthenticated) return;

    const newStatus = await toggleWishlistItem(
      WishlistItemType.PRODUCT,
      product.id,
    );
    setIsWishlisted(newStatus);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || product.name,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copy URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isOwner) {
    return (
      <div
        className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center text-yellow-800">
          <EyeIcon className="w-5 h-5 mr-2" />
          <span className="text-sm">
            Đây là sản phẩm của bạn. Khách hàng sẽ thấy các nút mua hàng tại
            đây.
          </span>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <div
        className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}
      >
        <p className="text-sm text-gray-600 text-center">
          <a href="/auth/login" className="text-primary hover:underline">
            Đăng nhập
          </a>{' '}
          để mua hàng và tương tác với sản phẩm
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Số lượng:</span>
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="p-2 hover:bg-gray-100 disabled:opacity-50"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
          <button
            onClick={() =>
              onQuantityChange(Math.min(availableQuantity, quantity + 1))
            }
            className="p-2 hover:bg-gray-100 disabled:opacity-50"
            disabled={quantity >= availableQuantity}
          >
            +
          </button>
        </div>
        <span className="text-sm text-gray-600">
          {availableQuantity} có sẵn
        </span>
      </div>

      {/* Main Actions */}
      <div className="flex gap-3">
        {canAddToCart && (
          <Button
            onClick={handleAddToCart}
            loading={loading[`add-${product.id}`]}
            disabled={availableQuantity === 0}
            className="flex-1"
            leftIcon={<ShoppingCartIcon className="w-5 h-5" />}
          >
            Thêm vào giỏ
          </Button>
        )}

        <Button
          variant="outline"
          onClick={handleWishlistToggle}
          leftIcon={
            isWishlisted ? (
              <HeartIconSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )
          }
        >
          {isWishlisted ? 'Đã yêu thích' : 'Yêu thích'}
        </Button>

        <Button
          variant="outline"
          onClick={handleShare}
          leftIcon={<ShareIcon className="w-5 h-5" />}
        >
          Chia sẻ
        </Button>
      </div>

      {/* Negotiation Button */}
      {canNegotiate && (
        <Button
          variant="secondary"
          onClick={() => setShowNegotiationModal(true)}
          className="w-full"
          leftIcon={<ChatBubbleLeftRightIcon className="w-5 h-5" />}
        >
          Thương lượng giá
        </Button>
      )}

      {/* Out of Stock Message */}
      {availableQuantity === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 text-center">
            Sản phẩm hiện đã hết hàng
          </p>
        </div>
      )}

      {/* Negotiation Modal */}
      <Modal
        isOpen={showNegotiationModal}
        onClose={() => setShowNegotiationModal(false)}
        title="Thương lượng giá sản phẩm"
        size="lg"
      >
        <CreateNegotiationForm
          product={product}
          onSuccess={() => setShowNegotiationModal(false)}
          onCancel={() => setShowNegotiationModal(false)}
        />
      </Modal>
    </div>
  );
};
