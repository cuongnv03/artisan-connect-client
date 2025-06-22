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

      const duplicateData: Partial<CreateProductRequest> = {
        name: `${product.name} (Bản sao)`,
        description: product.description || undefined,
        price: product.price,
        discountPrice: product.discountPrice || undefined,
        quantity: 0,
        minOrderQty: product.minOrderQty,
        maxOrderQty: product.maxOrderQty || undefined,
        isCustomizable: product.isCustomizable,
        allowNegotiation: product.allowNegotiation,
        categoryIds: product.categories?.map((c) => c.id) || [],
        images: [],
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
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Loại bỏ tiêu đề trùng lặp - chỉ render form
  return <ProductForm initialData={initialData} />;
};
