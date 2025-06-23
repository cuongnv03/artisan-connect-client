import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../../hooks/products/useProduct';
import { productService } from '../../services/product.service';
import { ProductForm } from '../../components/products/ProductForm';
import { UpdateProductRequest } from '../../types/product';
import { useToastContext } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { getRouteHelpers } from '../../constants/routes';

export const EditProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { success, error } = useToastContext();

  const {
    product,
    loading,
    error: productError,
    isOwner,
  } = useProduct(
    productId || '',
    true, // management view
  );

  const handleSubmit = async (data: UpdateProductRequest) => {
    if (!productId) return null;

    try {
      const updatedProduct = await productService.updateProduct(
        productId,
        data,
      );
      success('Cập nhật sản phẩm thành công!');
      navigate(getRouteHelpers.productDetail(productId));
      return updatedProduct;
    } catch (err: any) {
      error(err.message || 'Không thể cập nhật sản phẩm');
      return null;
    }
  };

  const handleCancel = () => {
    navigate(getRouteHelpers.productDetail(productId || ''));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h1>
          <p className="text-gray-600">
            Sản phẩm này có thể đã bị xóa hoặc bạn không có quyền chỉnh sửa.
          </p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600">
            Bạn chỉ có thể chỉnh sửa sản phẩm của mình.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProductForm
      product={product}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};
