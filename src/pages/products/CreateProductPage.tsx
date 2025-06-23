import React from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { ProductForm } from '../../components/products/ProductForm';
import { CreateProductRequest } from '../../types/product';
import { useToastContext } from '../../contexts/ToastContext';
import { getRouteHelpers } from '../../constants/routes';

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToastContext();

  const handleSubmit = async (data: CreateProductRequest) => {
    try {
      const product = await productService.createProduct(data);
      success('Tạo sản phẩm thành công!');
      navigate(getRouteHelpers.productDetail(product.id));
      return product;
    } catch (err: any) {
      error(err.message || 'Không thể tạo sản phẩm');
      return null;
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  return <ProductForm onSubmit={handleSubmit} onCancel={handleCancel} />;
};
