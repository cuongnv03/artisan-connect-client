import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductForm } from '../../components/common/ProductForm';
import { CreateProductRequest, Product } from '../../types/product';
import { productService } from '../../services/product.service';
import { useToastContext } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';

export const EditProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    if (!productId) return;

    try {
      const productData = await productService.getProduct(productId);
      setProduct(productData);
    } catch (err) {
      error('Không thể tải thông tin sản phẩm');
      navigate('/artisan/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CreateProductRequest) => {
    if (!productId) return;

    try {
      await productService.updateProduct(productId, data);
      success('Sản phẩm đã được cập nhật thành công!');
      navigate('/artisan/products');
    } catch (err: any) {
      error(err.message || 'Không thể cập nhật sản phẩm');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Không tìm thấy sản phẩm
        </h2>
        <p className="text-gray-600 mb-4">
          Sản phẩm này không tồn tại hoặc bạn không có quyền chỉnh sửa.
        </p>
        <Button onClick={() => navigate('/artisan/products')}>
          Quay lại danh sách sản phẩm
        </Button>
      </div>
    );
  }

  // Convert product to form data
  const initialData: Partial<CreateProductRequest> = {
    name: product.name,
    description: product.description,
    price: product.price,
    discountPrice: product.discountPrice,
    quantity: product.quantity,
    categories: product.categories?.map((cat) => cat.id) || [],
    images: product.images,
    tags: product.tags,
    isCustomizable: product.isCustomizable,
    specifications: product.specifications,
    customFields: product.customFields,
    weight: product.weight,
    dimensions: product.dimensions,
    attributes:
      product.attributes?.map((attr) => ({
        key: attr.key,
        value: attr.value,
        unit: attr.unit,
      })) || [],
    variants:
      product.variants?.map((variant) => ({
        name: variant.name,
        price: variant.price,
        discountPrice: variant.discountPrice,
        quantity: variant.quantity,
        images: variant.images,
        weight: variant.weight,
        dimensions: variant.dimensions,
        attributes: variant.attributes.map((attr) => ({
          key: attr.key,
          value: attr.value,
        })),
      })) || [],
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
        <p className="text-gray-600 mt-1">
          Cập nhật thông tin sản phẩm "{product.name}"
        </p>
      </div>

      {/* Form */}
      <ProductForm initialData={initialData} onSubmit={handleSubmit} />
    </div>
  );
};
