import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { useToastContext } from '../../contexts/ToastContext';
import { cartService } from '../../services/cart.service';
import { CartItem, CartSummary } from '../../types/order';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/ui/Modal';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const [itemsResult, summaryResult] = await Promise.all([
        cartService.getCart(),
        cartService.getCartSummary(),
      ]);
      setCartItems(itemsResult);
      setCartSummary(summaryResult);
    } catch (err) {
      console.error('Error loading cart:', err);
      error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(productId);
      return;
    }

    setUpdating(productId);
    try {
      await cartService.updateCartItem(productId, newQuantity);
      await loadCart();
      success('Đã cập nhật số lượng');
    } catch (err) {
      error('Không thể cập nhật số lượng');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    setUpdating(productId);
    try {
      await cartService.removeFromCart(productId);
      await loadCart();
      success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err) {
      error('Không thể xóa sản phẩm');
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      await loadCart();
      success('Đã xóa tất cả sản phẩm');
      setShowClearConfirm(false);
    } catch (err) {
      error('Không thể xóa giỏ hàng');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="max-w-7xl mx-auto">
        <EmptyState
          icon={<ShoppingCartIcon className="w-16 h-16" />}
          title="Giỏ hàng trống"
          description="Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá cửa hàng để tìm những sản phẩm thú vị!"
          action={{
            label: 'Tiếp tục mua sắm',
            onClick: () => navigate('/shop'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Giỏ hàng của bạn
          </h1>
          <p className="text-gray-600">
            {cartSummary?.totalItems} sản phẩm trong giỏ hàng
          </p>
        </div>

        {cartItems.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowClearConfirm(true)}
            leftIcon={<TrashIcon className="w-4 h-4" />}
          >
            Xóa tất cả
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={
                        item.product.images[0] ||
                        'https://via.placeholder.com/150'
                      }
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link
                          to={`/products/${
                            item.product.slug || item.product.id
                          }`}
                          className="font-medium text-gray-900 hover:text-accent"
                        >
                          {item.product.name}
                        </Link>
                        {item.product.seller && (
                          <p className="text-sm text-gray-500 mt-1">
                            Bởi {item.product.seller.firstName}{' '}
                            {item.product.seller.lastName}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        disabled={updating === item.productId}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Quantity */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Số lượng:</span>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            disabled={
                              updating === item.productId || item.quantity <= 1
                            }
                            className="p-2 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 min-w-[50px] text-center">
                            {updating === item.productId ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            disabled={updating === item.productId}
                            className="p-2 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-lg font-semibold text-accent">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-sm text-gray-500">
                            {formatPrice(item.price)} x {item.quantity}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tóm tắt đơn hàng
            </h2>

            {cartSummary && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">
                    {formatPrice(cartSummary.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">
                    {cartSummary.estimatedShipping > 0
                      ? formatPrice(cartSummary.estimatedShipping)
                      : 'Miễn phí'}
                  </span>
                </div>

                <hr className="my-4" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-accent">
                    {formatPrice(cartSummary.estimatedTotal)}
                  </span>
                </div>

                <Button
                  fullWidth
                  onClick={handleCheckout}
                  className="mt-6"
                  leftIcon={<ShoppingBagIcon className="w-4 h-4" />}
                >
                  Tiến hành thanh toán
                </Button>

                <Link to="/shop">
                  <Button variant="outline" fullWidth className="mt-3">
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Clear Cart Confirmation */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearCart}
        title="Xóa tất cả sản phẩm"
        message="Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?"
        confirmText="Xóa tất cả"
        type="danger"
      />
    </div>
  );
};
