import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ProductForm } from '../../components/products/ProductForm';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useToastContext } from '../../contexts/ToastContext';
import { productService } from '../../services/product.service';
import { CreateProductRequest } from '../../types/product';

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { success } = useToastContext();

  const handleSubmit = async (data: CreateProductRequest) => {
    const product = await productService.createProduct(data);
    success(
      `Tạo sản phẩm thành công! ${
        data.status === 'PUBLISHED' ? 'Đã đăng bán' : 'Đã lưu nháp'
      }`,
    );
    navigate(`/products/${product.id}`);
  };

  const handleCancel = () => {
    navigate('/products');
  };

  return (
    <>
      <Helmet>
        <title>Tạo sản phẩm mới - Artisan Connect</title>
        <meta
          name="description"
          content="Thêm sản phẩm thủ công mới vào cửa hàng"
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <PlusIcon className="w-8 h-8 text-primary mr-3" />
                Tạo sản phẩm mới
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Thêm sản phẩm thủ công độc đáo vào cửa hàng của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Progress Tips */}
        <Card className="p-4 mb-8 bg-blue-50 border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            💡 Mẹo tạo sản phẩm hấp dẫn
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Sử dụng tên sản phẩm mô tả và hấp dẫn</li>
            <li>• Thêm nhiều ảnh chất lượng từ nhiều góc độ</li>
            <li>• Mô tả chi tiết chất liệu và cách sử dụng</li>
            <li>• Chọn đúng danh mục để dễ tìm kiếm</li>
            <li>• Thêm thẻ phù hợp với sản phẩm</li>
          </ul>
        </Card>

        {/* Product Form */}
        <ProductForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Tạo sản phẩm"
        />
      </div>
    </>
  );
};
