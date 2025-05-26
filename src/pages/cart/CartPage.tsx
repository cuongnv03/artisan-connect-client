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
import { useCart } from '../../contexts/CartContext';
import { cartService } from '../../services/cart.service';
import { CartItem, CartSummary } from '../../types/cart';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/ui/Modal';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const {
    state: cartState,
    loadCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCart();
  const [updating, setUpdating] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (!cartState.summary) {
      loadCart();
    }
  }, []);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(productId);
      return;
    }

    setUpdating(productId);
    try {
      await updateCartItem(productId, newQuantity);
    } catch (err) {
      // Error already handled in context
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setUpdating(productId);
    try {
      await removeFromCart(productId);
    } catch (err) {
      // Error already handled in context
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setShowClearConfirm(false);
    } catch (err) {
      // Error already handled in context
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleCheckout = async () => {
    try {
      // Validate cart before checkout
      const validation = await cartService.validateForCheckout();

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

  if (cartState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (!cartState.summary || cartState.summary.totalItems === 0) {
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

  const { summary } = cartState;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Giỏ hàng của bạn
          </h1>
          <p className="text-gray-600">
            {summary.totalItems} mặt hàng, {summary.totalQuantity} sản phẩm
          </p>
        </div>

        {summary.totalItems > 0 && (
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
        {/* Cart Items - Group by Seller */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {summary.groupedBySeller.map((sellerGroup) => (
              <Card key={sellerGroup.sellerId} className="p-6">
                {/* Seller Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {sellerGroup.sellerInfo.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {sellerGroup.sellerInfo.shopName ||
                          sellerGroup.sellerInfo.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        @{sellerGroup.sellerInfo.username}
                        {sellerGroup.sellerInfo.isVerified && (
                          <span className="ml-1 text-primary">✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Tổng</p>
                    <p className="font-semibold text-primary">
                      {formatPrice(sellerGroup.total)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {sellerGroup.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={
                            item.product?.images?.[0] ||
                            'https://via.placeholder.com/150'
                          }
                          alt={item.product?.name || 'Product'}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Link
                              to={`/products/${
                                item.product?.slug || item.productId
                              }`}
                              className="font-medium text-gray-900 hover:text-primary"
                            >
                              {item.product?.name || 'Unknown Product'}
                            </Link>

                            {/* Price info */}
                            <div className="text-sm text-gray-600 mt-1">
                              {item.product?.discountPrice &&
                              item.product.discountPrice <
                                item.product.price ? (
                                <>
                                  <span className="text-primary font-medium">
                                    {formatPrice(item.product.discountPrice)}
                                  </span>
                                  <span className="ml-2 line-through text-gray-400">
                                    {formatPrice(item.product.price)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-900 font-medium">
                                  {formatPrice(
                                    item.product?.price || item.price,
                                  )}
                                </span>
                              )}
                            </div>

                            {/* Stock warning */}
                            {item.product &&
                              item.product.quantity < item.quantity && (
                                <p className="text-sm text-red-500 mt-1">
                                  ⚠️ Chỉ còn {item.product.quantity} sản phẩm
                                </p>
                              )}
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            disabled={updating === item.productId}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          {/* Quantity */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                              Số lượng:
                            </span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity - 1,
                                  )
                                }
                                disabled={
                                  updating === item.productId ||
                                  item.quantity <= 1
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
                                  updateQuantity(
                                    item.productId,
                                    item.quantity + 1,
                                  )
                                }
                                disabled={
                                  updating === item.productId ||
                                  (item.product &&
                                    item.quantity >= item.product.quantity)
                                }
                                className="p-2 hover:bg-gray-50 disabled:opacity-50"
                              >
                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-lg font-semibold text-primary">
                              {formatPrice(
                                (item.product?.discountPrice ||
                                  item.product?.price ||
                                  item.price) * item.quantity,
                              )}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-sm text-gray-500">
                                {formatPrice(
                                  item.product?.discountPrice ||
                                    item.product?.price ||
                                    item.price,
                                )}{' '}
                                x {item.quantity}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Tạm tính ({summary.totalQuantity} sản phẩm)
                </span>
                <span className="font-medium">
                  {formatPrice(summary.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="font-medium">
                  {summary.total > summary.subtotal
                    ? formatPrice(summary.total - summary.subtotal)
                    : 'Tính khi thanh toán'}
                </span>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng cộng</span>
                <span className="text-primary">
                  {formatPrice(summary.total)}
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

            {/* Seller breakdown */}
            {summary.groupedBySeller.length > 1 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Phân theo người bán
                </h3>
                <div className="space-y-2">
                  {summary.groupedBySeller.map((group) => (
                    <div
                      key={group.sellerId}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {group.sellerInfo.shopName || group.sellerInfo.name}
                      </span>
                      <span className="font-medium">
                        {formatPrice(group.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
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
