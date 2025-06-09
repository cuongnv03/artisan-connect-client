import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductForm } from '../../components/common/ProductForm';
import { CreateProductRequest } from '../../types/product';
import { productService } from '../../services/product.service';
import { useToastContext } from '../../contexts/ToastContext';

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToastContext();

  const handleSubmit = async (data: CreateProductRequest) => {
    try {
      const product = await productService.createProduct(data);
      success('Sản phẩm đã được tạo thành công!');
      navigate(`/artisan/products/${product.id}/edit`);
    } catch (err: any) {
      error(err.message || 'Không thể tạo sản phẩm');
      throw err;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tạo sản phẩm mới</h1>
        <p className="text-gray-600 mt-1">
          Thêm sản phẩm mới vào cửa hàng của bạn
        </p>
      </div>

      {/* Form */}
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
};
