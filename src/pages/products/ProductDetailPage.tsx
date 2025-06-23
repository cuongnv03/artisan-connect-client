import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProduct } from '../../hooks/products/useProduct';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ProductVariantSelector } from '../../components/products/customer/ProductVariantSelector';
import { PriceNegotiationButton } from '../../components/products/customer/ProductDetailPage/PriceNegotiationButton';
import {
  HeartIcon,
  ShareIcon,
  StarIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { addToCart } = useCart();
  const { success, error: showError } = useToastContext();

  // ✅ ALL HOOKS MUST BE DECLARED AT TOP LEVEL - SAME ORDER EVERY RENDER
  const { product, loading, error, refetch } = useProduct({
    slug,
    enabled: !!slug,
  });

  // ✅ ALL STATE HOOKS - ALWAYS CALLED IN SAME ORDER
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // ✅ EFFECTS - ALWAYS CALLED IN SAME ORDER
  useEffect(() => {
    if (product?.id) {
      setIsWishlisted(product.isWishlisted || false);
    }
  }, [product?.id]);

  // ✅ HELPER FUNCTIONS
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (!authState.isAuthenticated) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product!.id, quantity);
    } catch (err) {
      // Error handled in cart context
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIconSolid
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  // ✅ CONDITIONAL RENDERING - AFTER ALL HOOKS
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Không tìm thấy sản phẩm
        </h1>
        <p className="text-gray-600 mb-6">
          Sản phẩm có thể đã bị xóa hoặc không tồn tại
        </p>
        <Button onClick={() => navigate('/products')}>Quay về cửa hàng</Button>
      </div>
    );
  }

  // ✅ NOW PRODUCT IS GUARANTEED TO EXIST
  const currentPrice = product.discountPrice || product.price;
  const discountPercentage = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/products')}
          leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Cửa hàng
        </Button>
        <span>/</span>
        {product.categories && product.categories[0] && (
          <>
            <Link
              to={`/products/category/${product.categories[0].slug}`}
              className="hover:text-primary"
            >
              {product.categories[0].name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Product Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={
                product.images[currentImageIndex] || '/placeholder-image.jpg'
              }
              alt={product.name}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setShowImageModal(true)}
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 flex-shrink-0 ${
                    currentImageIndex === index
                      ? 'border-primary'
                      : 'border-gray-200'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            {/* Rating */}
            {product.avgRating && (
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-2">
                  {renderStars(Math.round(product.avgRating))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.avgRating.toFixed(1)} ({product.reviewCount} đánh
                  giá)
                </span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-sm text-gray-600">
                  {product.salesCount} đã bán
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(currentPrice)}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <Badge variant="danger">-{discountPercentage}%</Badge>
                  </>
                )}
              </div>
            </div>

            {/* Seller Info */}
            {product.seller && (
              <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-6">
                <Avatar
                  src={product.seller.avatarUrl}
                  alt={`${product.seller.firstName} ${product.seller.lastName}`}
                  size="md"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <Link
                      to={`/artisan/${product.seller.id}`}
                      className="text-gray-900 hover:text-primary"
                    >
                      <h3 className="font-medium text-gray-900">
                        {product.seller.artisanProfile?.shopName ||
                          `${product.seller.firstName} ${product.seller.lastName}`}
                      </h3>
                      {product.seller.artisanProfile?.isVerified && (
                        <ShieldCheckIcon className="w-4 h-4 text-blue-500 ml-1" />
                      )}
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600">
                    @{product.seller.username}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/messages/${product.seller?.id}`)}
                >
                  <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                  Nhắn tin
                </Button>
              </div>
            )}

            {/* Variant Selector */}
            {product.hasVariants &&
              product.variants &&
              product.variants.length > 0 && (
                <div className="mb-6">
                  <ProductVariantSelector
                    variants={product.variants}
                    selectedVariantId={selectedVariant || undefined}
                    onVariantChange={setSelectedVariant}
                  />
                </div>
              )}

            {/* Quantity & Actions */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700 mr-3">
                    Số lượng:
                  </label>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x">{quantity}</span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.quantity, quantity + 1))
                      }
                      className="px-3 py-2 hover:bg-gray-100"
                      disabled={quantity >= product.quantity}
                    >
                      +
                    </button>
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  {product.quantity} sản phẩm có sẵn
                </span>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={
                    product.quantity === 0 ||
                    isAddingToCart ||
                    !authState.isAuthenticated
                  }
                  loading={isAddingToCart}
                  leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
                  className="flex-1"
                >
                  {product.quantity === 0
                    ? 'Hết hàng'
                    : !authState.isAuthenticated
                    ? 'Đăng nhập để mua'
                    : 'Thêm vào giỏ'}
                </Button>
                {/* Thêm button thương lượng */}
                <PriceNegotiationButton product={product} />
                <Button
                  variant="outline"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  {isWishlisted ? (
                    <HeartIconSolid className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                </Button>
                <Button variant="outline">
                  <ShareIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.isCustomizable && (
                <div className="flex items-center text-green-600">
                  <ShieldCheckIcon className="w-4 h-4 mr-2" />
                  Có thể tùy chỉnh
                </div>
              )}
              {product.allowNegotiation && (
                <div className="flex items-center text-blue-600">
                  <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                  Có thể thương lượng
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <TruckIcon className="w-4 h-4 mr-2" />
                Miễn phí vận chuyển
              </div>
              <div className="flex items-center text-gray-600">
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                Đảm bảo chất lượng
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      {product.description && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Mô tả sản phẩm
          </h2>
          <div className="prose max-w-none text-gray-600">
            {product.description}
          </div>
        </div>
      )}

      {/* Image Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        size="xl"
      >
        <div className="text-center">
          <img
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="max-w-full max-h-[80vh] mx-auto"
          />
          {product.images.length > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    currentImageIndex === index ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
