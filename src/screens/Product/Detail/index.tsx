import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ProductService } from '../../../services/product.service';
import { Button } from '../../../components/form/Button';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Avatar } from '../../../components/common/Avatar';
import { Loader } from '../../../components/feedback/Loader';
import { Alert } from '../../../components/feedback/Alert';
import { formatPrice, formatDate } from '../../../helpers/formatters';
import { ProductStatus } from '../../../types/product.types';
import {
  StarIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery(['product', id], () => ProductService.getProductById(id!), {
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader size="lg" text="Loading product..." />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert type="error" title="Error loading product" className="my-8">
        {(error as Error).message ||
          'Failed to load product. Please try again.'}
      </Alert>
    );
  }

  if (!product) {
    return (
      <Alert type="warning" title="Product not found" className="my-8">
        The product you're looking for doesn't exist or has been removed.
      </Alert>
    );
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= product.quantity) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    // Implement add to cart logic
    alert(`Added ${quantity} items to cart`);
  };

  const handleRequestQuote = () => {
    // Implement request quote logic
    navigate(`/quotes/create?productId=${product.id}`);
  };

  // Render star rating
  const renderRating = (rating: number | undefined, reviewCount: number) => {
    const stars = [];
    const ratingValue = rating || 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(ratingValue)) {
        stars.push(
          <StarIconSolid key={i} className="h-5 w-5 text-yellow-500" />,
        );
      } else if (i - 0.5 <= ratingValue) {
        stars.push(
          <StarIconSolid key={i} className="h-5 w-5 text-yellow-500" />,
        );
      } else {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-yellow-500" />);
      }
    }

    return (
      <div className="flex items-center">
        <div className="flex">{stars}</div>
        <span className="ml-2 text-sm text-gray-500">
          ({reviewCount} reviews)
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-gray-500 hover:text-accent">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link
                  to="/products"
                  className="text-gray-500 hover:text-accent"
                >
                  Products
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-700">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="bg-white rounded-lg overflow-hidden mb-4 h-96 flex items-center justify-center">
            <img
              src={product.images[selectedImage] || '/placeholder-product.png'}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, idx) => (
                <button
                  key={idx}
                  className={`border-2 rounded overflow-hidden h-16 ${
                    selectedImage === idx ? 'border-accent' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img
                    src={image}
                    alt={`${product.name} - view ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center mb-2">
                {renderRating(product.avgRating, product.reviewCount)}
              </div>
              {product.status === ProductStatus.OUT_OF_STOCK && (
                <Badge variant="warning" className="mb-2">
                  Out of Stock
                </Badge>
              )}
              {product.isCustomizable && (
                <Badge variant="info" className="mb-2 ml-2">
                  Customizable
                </Badge>
              )}
            </div>
            {product.seller && (
              <div>
                <Link
                  to={`/artisan/${product.seller.id}`}
                  className="flex items-center space-x-2"
                >
                  <Avatar
                    src={product.seller.avatarUrl || undefined}
                    firstName={product.seller.firstName}
                    lastName={product.seller.lastName}
                    size="sm"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {product.seller.artisanProfile?.shopName ||
                        `${product.seller.firstName} ${product.seller.lastName}`}
                    </p>
                    {product.seller.artisanProfile?.isVerified && (
                      <Badge variant="success" size="sm">
                        Verified Artisan
                      </Badge>
                    )}
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Price Section */}
          <div className="mb-6">
            <div className="flex items-center">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.discountPrice && (
                <span className="ml-2 text-xl text-gray-500 line-through">
                  {formatPrice(product.discountPrice)}
                </span>
              )}
            </div>
            {product.quantity > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {product.quantity} in stock
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Description
            </h3>
            <div className="prose max-w-none text-gray-700">
              {product.description || 'No description provided.'}
            </div>
          </div>

          {/* Product Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <Badge key={idx} variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Attributes Section */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b border-gray-200 py-2"
                  >
                    <span className="text-gray-500">{key}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Section */}
          <div className="mt-8">
            {product.status === ProductStatus.PUBLISHED &&
            product.quantity > 0 ? (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-24">
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="1"
                      max={product.quantity}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                    />
                  </div>

                  <div className="flex-1">
                    <Button
                      variant="primary"
                      isFullWidth
                      leftIcon={<ShoppingCartIcon className="h-5 w-5" />}
                      onClick={handleAddToCart}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>

                {product.isCustomizable && (
                  <Button
                    variant="outline"
                    leftIcon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
                    onClick={handleRequestQuote}
                  >
                    Request Customization Quote
                  </Button>
                )}
              </div>
            ) : (
              <Alert
                type="warning"
                title={
                  product.status === ProductStatus.OUT_OF_STOCK
                    ? 'Out of Stock'
                    : 'Currently Unavailable'
                }
              >
                {product.status === ProductStatus.OUT_OF_STOCK
                  ? 'This product is currently out of stock. Please check back later or contact the seller.'
                  : 'This product is currently unavailable for purchase.'}
              </Alert>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-8">
            <p className="text-sm text-gray-500">
              Listed on {formatDate(product.createdAt)}
              {product.updatedAt !== product.createdAt &&
                ` • Updated on ${formatDate(product.updatedAt)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section Placeholder */}
      <Card className="mt-12 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Customer Reviews
        </h2>
        <div className="text-center py-10">
          <p className="text-gray-500">Reviews section coming soon</p>
        </div>
      </Card>
    </div>
  );
};

export default ProductDetail;
