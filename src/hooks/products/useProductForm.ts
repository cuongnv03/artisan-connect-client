import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../common/useForm';
import { useToastContext } from '../../contexts/ToastContext';
import { productService } from '../../services/product.service';
import {
  CreateProductRequest,
  UpdateProductRequest,
  Product,
  ProductStatus,
} from '../../types/product';

export interface UseProductFormOptions {
  initialData?: Partial<CreateProductRequest>;
  productId?: string;
  onSuccess?: (product: Product) => void;
}

export const useProductForm = (options: UseProductFormOptions = {}) => {
  const { initialData, productId, onSuccess } = options;
  const navigate = useNavigate();
  const { success, error: showError } = useToastContext();
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!productId;

  const validate = (values: CreateProductRequest) => {
    const errors: Record<string, string> = {};

    if (!values.name?.trim()) {
      errors.name = 'Tên sản phẩm là bắt buộc';
    } else if (values.name.length < 3) {
      errors.name = 'Tên sản phẩm phải có ít nhất 3 ký tự';
    } else if (values.name.length > 200) {
      errors.name = 'Tên sản phẩm không được quá 200 ký tự';
    }

    if (!values.price || values.price <= 0) {
      errors.price = 'Giá sản phẩm phải lớn hơn 0';
    }

    if (values.discountPrice && values.discountPrice >= values.price) {
      errors.discountPrice = 'Giá khuyến mãi phải nhỏ hơn giá gốc';
    }

    if (values.quantity < 0) {
      errors.quantity = 'Số lượng không thể âm';
    }

    if (!values.categoryIds?.length) {
      errors.categoryIds = 'Vui lòng chọn ít nhất một danh mục';
    } else if (values.categoryIds.length > 5) {
      errors.categoryIds = 'Tối đa 5 danh mục';
    }

    if (!values.images?.length) {
      errors.images = 'Vui lòng thêm ít nhất một hình ảnh';
    } else if (values.images.length > 10) {
      errors.images = 'Tối đa 10 hình ảnh';
    }

    // Validate variants
    if (values.variants && values.variants.length > 0) {
      const variantErrors: any[] = [];
      values.variants.forEach((variant, index) => {
        const vErrors: any = {};

        if (variant.price !== undefined && variant.price < 0) {
          vErrors.price = 'Giá biến thể phải >= 0';
        }

        if (variant.quantity < 0) {
          vErrors.quantity = 'Số lượng biến thể phải >= 0';
        }

        if (
          !variant.attributes ||
          Object.keys(variant.attributes).length === 0
        ) {
          vErrors.attributes = 'Biến thể phải có ít nhất 1 thuộc tính';
        }

        if (Object.keys(vErrors).length > 0) {
          variantErrors[index] = vErrors;
        }
      });

      if (variantErrors.length > 0) {
        errors.variants = variantErrors;
      }
    }

    return errors;
  };

  // ✅ SỬA: Đơn giản hóa handleSubmit
  const handleSubmit = async (values: CreateProductRequest): Promise<void> => {
    // Dùng status từ form, default là DRAFT cho create, giữ nguyên cho edit
    const status =
      values.status || (isEditing ? values.status : ProductStatus.DRAFT);
    await submitWithStatus(values, status);
  };

  // ✅ SỬA: Improved submitWithStatus function
  const submitWithStatus = async (
    values: CreateProductRequest,
    status: ProductStatus,
  ): Promise<Product> => {
    setSubmitting(true);
    try {
      let product: Product;

      const submitData = {
        ...values,
        status, // ✅ Đảm bảo status được truyền đúng
        featuredImage: values.featuredImage || values.images[0],
        tags: values.tags || [],
      };

      if (isEditing) {
        // ✅ SỬA: Cho editing, phân biệt update vs publish
        if (
          status === ProductStatus.PUBLISHED &&
          values.status === ProductStatus.DRAFT
        ) {
          // Nếu từ DRAFT -> PUBLISHED, dùng publishProduct API
          product = await productService.publishProduct(productId!);
        } else {
          // Ngược lại dùng updateProduct bình thường
          product = await productService.updateProduct(
            productId!,
            submitData as UpdateProductRequest,
          );
        }
        success('Cập nhật sản phẩm thành công!');
      } else {
        // ✅ SỬA: Cho create, truyền status vào data
        product = await productService.createProduct(submitData);
        success(
          `${
            status === ProductStatus.PUBLISHED ? 'Tạo và xuất bản' : 'Tạo'
          } sản phẩm thành công!`,
        );
      }

      if (onSuccess) {
        onSuccess(product);
      } else {
        navigate('/products/manage');
      }

      return product;
    } catch (err: any) {
      console.error('Submit error:', err);
      showError(
        err.message || `Không thể ${isEditing ? 'cập nhật' : 'tạo'} sản phẩm`,
      );
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const form = useForm<CreateProductRequest>({
    initialValues: {
      name: '',
      description: '',
      price: 0,
      discountPrice: undefined,
      quantity: 0,
      minOrderQty: 1,
      maxOrderQty: undefined,
      sku: '', // Default empty, sẽ auto-generate
      barcode: '',
      weight: undefined,
      dimensions: undefined,
      isCustomizable: false,
      allowNegotiation: true,
      shippingInfo: undefined,
      status: ProductStatus.DRAFT,
      tags: [],
      images: [],
      featuredImage: '',
      seoTitle: '',
      seoDescription: '',
      attributes: {},
      specifications: {},
      customFields: {},
      categoryIds: [],
      variants: [],
      ...initialData,
    },
    validate,
    onSubmit: handleSubmit, // Giờ return void
  });

  return {
    ...form,
    submitting,
    isEditing,
    submitWithStatus, // Export function để call từ component
  };
};
