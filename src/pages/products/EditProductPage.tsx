import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  PencilIcon,
  ArrowLeftIcon,
  EyeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { ProductForm } from '../../components/products/ProductForm';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useProduct } from '../../hooks/products/useProduct';
import { useToastContext } from '../../contexts/ToastContext';
import { productService } from '../../services/product.service';
import { UpdateProductRequest } from '../../types/product';

export const EditProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { success } = useToastContext();
  const { product, loading, error } = useProduct(productId!, true);

  const handleSubmit = async (data: UpdateProductRequest) => {
    await productService.updateProduct(productId!, data);
    success('Cập nhật sản phẩm thành công!');
    navigate(`/products/${productId}`);
  };

  const handleCancel = () => {
    navigate(`/products/${productId}`);
  };

  const handleQuickPublish = async () => {
    if (!productId) return;
    try {
      await productService.publishProduct(productId);
      success('Đã đăng bán sản phẩm');
      navigate(`/products/${productId}`);
    } catch (err: any) {
      // Error handled by ProductForm
    }
  };

  const handleQuickUnpublish = async () => {
    if (!productId) return;
    try {
      await productService.unpublishProduct(productId);
      success('Đã ẩn sản phẩm');
      navigate(`/products/${productId}`);
    } catch (err: any) {
      // Error handled by ProductForm
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || 'Không tìm thấy sản phẩm'}
          </p>
          <Button onClick={() => navigate('/products')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Chỉnh sửa: {product.name} - Artisan Connect</title>
        <meta
          name="description"
          content={`Chỉnh sửa sản phẩm ${product.name}`}
        />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/products')}
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
            >
              Quay lại
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <PencilIcon className="w-8 h-8 text-primary mr-3" />
                Chỉnh sửa sản phẩm
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Cập nhật thông tin cho "{product.name}"
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/products/${productId}`)}
                leftIcon={<EyeIcon className="w-4 h-4" />}
              >
                Xem chi tiết
              </Button>

              {product.status === 'DRAFT' ? (
                <Button
                  variant="secondary"
                  onClick={handleQuickPublish}
                  leftIcon={<ClockIcon className="w-4 h-4" />}
                >
                  Đăng bán ngay
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleQuickUnpublish}
                  leftIcon={<ClockIcon className="w-4 h-4" />}
                >
                  Ẩn sản phẩm
                </Button>
              )}
            </div>
          </div>

          {/* Status Info */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge
                  variant={
                    product.status === 'PUBLISHED'
                      ? 'success'
                      : product.status === 'DRAFT'
                      ? 'secondary'
                      : 'warning'
                  }
                >
                  {product.status === 'PUBLISHED'
                    ? 'Đang bán'
                    : product.status === 'DRAFT'
                    ? 'Nháp'
                    : 'Hết hàng'}
                </Badge>

                <span className="text-sm text-gray-600">
                  Cập nhật lần cuối:{' '}
                  {new Date(product.updatedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div className="text-sm text-gray-600">
                ID: {product.id.slice(0, 8)}...
              </div>
            </div>
          </Card>
        </div>

        {/* Product Form */}
        <ProductForm
          mode="edit"
          product={product}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Cập nhật sản phẩm"
        />
      </div>
    </>
  );
};
