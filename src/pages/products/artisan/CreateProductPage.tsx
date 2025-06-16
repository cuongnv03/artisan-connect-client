import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../../services/product.service';
import { ProductForm } from '../../../components/products/artisan/ProductForm/ProductForm';
import { CreateProductRequest } from '../../../types/product';

export const CreateProductPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get('duplicate');
  const [initialData, setInitialData] = useState<
    Partial<CreateProductRequest> | undefined
  >();
  const [loading, setLoading] = useState(!!duplicateId);

  useEffect(() => {
    if (duplicateId) {
      loadProductToDuplicate();
    }
  }, [duplicateId]);

  const loadProductToDuplicate = async () => {
    if (!duplicateId) return;

    try {
      setLoading(true);
      const product = await productService.getProduct(duplicateId);

      // Prepare data for duplication (remove ID fields, modify name)
      const duplicateData: Partial<CreateProductRequest> = {
        name: `${product.name} (Bản sao)`,
        description: product.description || undefined,
        price: product.price,
        discountPrice: product.discountPrice || undefined,
        quantity: 0, // Reset quantity for duplicated product
        minOrderQty: product.minOrderQty,
        maxOrderQty: product.maxOrderQty || undefined,
        isCustomizable: product.isCustomizable,
        allowNegotiation: product.allowNegotiation,
        categoryIds: product.categories?.map((c) => c.id) || [],
        images: [], // Reset images for duplicated product
        tags: product.tags,
      };

      setInitialData(duplicateData);
    } catch (err) {
      console.error('Error loading product to duplicate:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {duplicateId ? 'Sao chép sản phẩm' : 'Tạo sản phẩm mới'}
        </h1>
        <p className="text-gray-600">
          {duplicateId
            ? 'Tạo sản phẩm mới dựa trên sản phẩm đã có'
            : 'Điền thông tin để tạo sản phẩm mới'}
        </p>
      </div>

      <ProductForm initialData={initialData} />
    </div>
  );
};
