import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartOperations, useCartValidation } from '../../hooks/cart';
import { cartService } from '../../services/cart.service';
import { useToastContext } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConfirmModal } from '../../components/ui/Modal';

// Cart Components
import { CartHeader } from '../../components/cart/CartHeader';
import { CartItemsList } from '../../components/cart/CartItemsList/CartItemsList';
import { CartSummary } from '../../components/cart/CartSummary';
import { EmptyCart } from '../../components/cart/EmptyCart';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { error } = useToastContext();

  // Custom hooks
  const {
    summary,
    isLoading,
    updating,
    loadCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartOperations();

  const { validateForCheckout } = useCartValidation();

  // Local state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load cart on mount
  useEffect(() => {
    if (!summary) {
      loadCart();
    }
  }, []);

  // Handlers
  const handleClearCart = async () => {
    await clearCart();
    setShowClearConfirm(false);
  };

  const handleCheckout = async () => {
    try {
      // Validate cart before checkout
      const validation = await validateForCheckout();

      if (!validation.isValid) {
        error(`Có lỗi với giỏ hàng: ${validation.errors.join(', ')}`);
        return;
      }

      if (validation.warnings.length > 0) {
        // Log warnings but don't show as errors to user
        validation.warnings.forEach((warning) => {
          console.warn('Cart warning:', warning);
        });
      }

      navigate('/checkout');
    } catch (err: any) {
      error(err.message || 'Không thể tiến hành thanh toán');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!summary || summary.totalItems === 0) {
    return <EmptyCart />;
  }

  // Cart with items
  return (
    <div className="max-w-6xl mx-auto">
      <CartHeader
        summary={summary}
        onClearCart={() => setShowClearConfirm(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items - Group by Seller */}
        <div className="lg:col-span-2">
          <CartItemsList
            summary={summary}
            updating={updating}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            formatPrice={formatPrice}
          />
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <CartSummary
            summary={summary}
            onCheckout={handleCheckout}
            formatPrice={formatPrice}
          />
        </div>
      </div>

      {/* Clear Cart Confirmation */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearCart}
        title="Xóa tất cả sản phẩm"
        message="Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?"
        confirmText="Xóa tất cả"
        type="danger"
      />
    </div>
  );
};
