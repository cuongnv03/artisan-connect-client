import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../../../hooks/products/useProduct';
import { ProductForm } from '../../../components/products/artisan/ProductForm/ProductForm';
import { CreateProductRequest } from '../../../types/product';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const EditProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct({
    productId,
    enabled: !!productId,
  });

  const [initialData, setInitialData] = useState<
    Partial<CreateProductRequest> | undefined
  >();

  useEffect(() => {
    if (product) {
      const formData: Partial<CreateProductRequest> = {
        name: product.name,
        description: product.description || undefined,
        price: product.price,
        discountPrice: product.discountPrice || undefined,
        quantity: product.quantity,
        minOrderQty: product.minOrderQty,
        maxOrderQty: product.maxOrderQty || undefined,
        sku: product.sku || undefined,
        isCustomizable: product.isCustomizable,
        allowNegotiation: product.allowNegotiation,
        categoryIds: product.categories?.map((c) => c.id) || [],
        images: product.images,
        tags: product.tags,
        featuredImage: product.featuredImage || undefined,
        seoTitle: product.seoTitle || undefined,
        seoDescription: product.seoDescription || undefined,
      };

      setInitialData(formData);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h1>
          <p className="text-gray-600 mb-4">
            Sản phẩm có thể đã bị xóa hoặc bạn không có quyền chỉnh sửa
          </p>
          <Button onClick={() => navigate('/products/manage')}>
            Quay về danh sách sản phẩm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/products/manage')}
          leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Quay lại
        </Button>
      </div>

      <div className="">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
        <p className="text-gray-600">
          Cập nhật thông tin sản phẩm "{product.name}"
        </p>
      </div>

      {initialData && (
        <ProductForm initialData={initialData} productId={productId} />
      )}
    </div>
  );
};
