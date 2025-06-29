import React, { useState, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon,
  CalendarIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  LinkIcon,
  SparklesIcon,
  PaintBrushIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FileUpload } from '../common/FileUpload';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useToastContext } from '../../contexts/ToastContext';
import { uploadService } from '../../services/upload.service';
import { productService } from '../../services/product.service';
import { Product, ProductStatus } from '../../types/product';

interface CustomOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomOrderFormData) => void;
  loading?: boolean;
  artisanId?: string;
  referenceProductId?: string;
}

interface CreateCustomOrderFormData {
  artisanId: string;
  title: string;
  description: string;
  referenceProductId?: string;
  specifications?: Record<string, any>;
  attachmentUrls?: string[];
  estimatedPrice?: number;
  customerBudget?: number;
  timeline?: string;
  expiresInDays?: number;
}

const MATERIAL_SUGGESTIONS = [
  'Gỗ sồi',
  'Gỗ teak',
  'Gỗ mahogany',
  'Gốm sứ Bát Tràng',
  'Gốm sứ Chu Đậu',
  'Vải lụa',
  'Vải cotton',
  'Vải thổ cẩm',
  'Đồng thau',
  'Bạc 925',
  'Mây tre đan',
  'Cói',
  'Nhựa thông',
  'Da bò thật',
  'Da cá sấu',
];

const STYLE_SUGGESTIONS = [
  'Truyền thống Việt Nam',
  'Hiện đại tối giản',
  'Vintage cổ điển',
  'Bohemian tự do',
  'Scandinavian',
  'Industrial',
  'Á Đông zen',
  'Rustic làng quê',
  'Art Deco',
  'Contemporary',
];

const COLOR_SUGGESTIONS = [
  'Nâu gỗ tự nhiên',
  'Trắng ngà',
  'Đen matte',
  'Xanh navy',
  'Vàng đồng cổ',
  'Đỏ đất nung',
  'Xanh lá mint',
  'Hồng pastel',
  'Tím lavender',
  'Cam terracotta',
];

export const CustomOrderForm: React.FC<CustomOrderFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  artisanId,
  referenceProductId,
}) => {
  const { success: showSuccess, error: showError } = useToastContext();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedPrice: '',
    customerBudget: '',
    timeline: '',
    expiresInDays: '7',
    referenceProductId: referenceProductId || '',
    specifications: {
      materials: '',
      dimensions: '',
      colors: '',
      style: '',
      features: '',
      notes: '',
      technique: '',
      inspiration: '',
      usage: '',
      occasion: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [artisanProducts, setArtisanProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedReferenceProduct, setSelectedReferenceProduct] =
    useState<Product | null>(null);

  const totalSteps = 4;

  // Helper function for formatting price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Handle form field changes
  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { name, value } = e.target;
      // console.log('Input change:', name, value); // Debug log

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
    },
    [errors],
  );

  // Handle specification changes
  const handleSpecificationChange = useCallback(
    (field: string, value: string) => {
      // console.log('Spec change:', field, value); // Debug log
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [field]: value,
        },
      }));
    },
    [],
  );

  // Add suggestion to specification field
  const addSuggestion = useCallback((field: string, suggestion: string) => {
    setFormData((prev) => {
      const currentValue = prev.specifications[field];
      const newValue = currentValue
        ? `${currentValue}, ${suggestion}`
        : suggestion;

      return {
        ...prev,
        specifications: {
          ...prev.specifications,
          [field]: newValue,
        },
      };
    });
  }, []);

  // Reference product handlers
  const handleReferenceProductChange = useCallback(
    (productId: string) => {
      const product = artisanProducts.find((p) => p.id === productId);
      setSelectedReferenceProduct(product || null);
      setFormData((prev) => ({
        ...prev,
        referenceProductId: productId,
      }));
    },
    [artisanProducts],
  );

  const clearReferenceProduct = useCallback(() => {
    setSelectedReferenceProduct(null);
    setFormData((prev) => ({
      ...prev,
      referenceProductId: '',
    }));
  }, []);

  // Validation - FIXED
  const validateForm = useCallback(() => {
    // console.log('Validating form with data:', formData); // Debug log
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự để rõ ràng';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc';
    } else if (formData.description.trim().length < 50) {
      newErrors.description =
        'Mô tả phải có ít nhất 50 ký tự để nghệ nhân hiểu rõ';
    }

    // Price validation (optional fields)
    if (formData.estimatedPrice && formData.estimatedPrice.trim()) {
      const price = Number(formData.estimatedPrice);
      if (isNaN(price) || price <= 0) {
        newErrors.estimatedPrice = 'Giá ước tính phải là số dương';
      }
    }

    if (formData.customerBudget && formData.customerBudget.trim()) {
      const budget = Number(formData.customerBudget);
      if (isNaN(budget) || budget <= 0) {
        newErrors.customerBudget = 'Ngân sách phải là số dương';
      }
    }

    // console.log('Validation errors:', newErrors); // Debug log
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission - FIXED
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Form submitted!'); // Debug log

      if (!validateForm()) {
        console.log('Validation failed'); // Debug log
        return;
      }

      if (!artisanId) {
        showError('Không tìm thấy thông tin nghệ nhân');
        return;
      }

      try {
        console.log('Starting form submission process...'); // Debug log
        let attachmentUrls: string[] = [];

        if (attachmentFiles.length > 0) {
          setUploadingFiles(true);
          const uploadPromises = attachmentFiles.map((file) =>
            uploadService.uploadImage(file, { folder: 'custom-orders' }),
          );
          const uploadResults = await Promise.all(uploadPromises);
          attachmentUrls = uploadResults.map((result) => result.url);
        }

        // Build specifications object
        const specifications = Object.entries(formData.specifications)
          .filter(([, value]) => value && value.trim())
          .reduce((acc, [key, value]) => {
            acc[key] = value.trim();
            return acc;
          }, {} as Record<string, string>);

        const submitData: CreateCustomOrderFormData = {
          artisanId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          referenceProductId: formData.referenceProductId || undefined,
          specifications:
            Object.keys(specifications).length > 0 ? specifications : undefined,
          attachmentUrls:
            attachmentUrls.length > 0 ? attachmentUrls : undefined,
          estimatedPrice: formData.estimatedPrice
            ? Number(formData.estimatedPrice)
            : undefined,
          customerBudget: formData.customerBudget
            ? Number(formData.customerBudget)
            : undefined,
          timeline: formData.timeline.trim() || undefined,
          expiresInDays: formData.expiresInDays
            ? Number(formData.expiresInDays)
            : undefined,
        };

        console.log('Submitting data:', submitData); // Debug log
        await onSubmit(submitData);

        // Reset form after successful submission
        resetForm();
      } catch (error: any) {
        console.error('Form submission error:', error); // Debug log
        showError(error.message || 'Có lỗi xảy ra khi tải file');
      } finally {
        setUploadingFiles(false);
      }
    },
    [formData, attachmentFiles, artisanId, onSubmit, validateForm, showError],
  );

  // Reset form function
  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      estimatedPrice: '',
      customerBudget: '',
      timeline: '',
      expiresInDays: '7',
      referenceProductId: '',
      specifications: {
        materials: '',
        dimensions: '',
        colors: '',
        style: '',
        features: '',
        notes: '',
        technique: '',
        inspiration: '',
        usage: '',
        occasion: '',
      },
    });
    setAttachmentFiles([]);
    setCurrentStep(1);
    setSelectedReferenceProduct(null);
    setErrors({});
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Navigation
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Handle button click for debugging
  const handleButtonClick = useCallback(() => {
    console.log('Submit button clicked!'); // Debug log
    console.log('Current form data:', formData); // Debug log
    console.log('Current step:', currentStep); // Debug log
    console.log('Loading state:', loading, uploadingFiles); // Debug log
  }, [formData, currentStep, loading, uploadingFiles]);

  // Load artisan products
  useEffect(() => {
    const loadArtisanProducts = async () => {
      if (!artisanId || !isOpen) return;

      setLoadingProducts(true);
      try {
        const response = await productService.getProducts({
          sellerId: artisanId,
          status: ProductStatus.PUBLISHED,
          limit: 50,
        });
        setArtisanProducts(response.data);

        if (referenceProductId) {
          const refProduct = response.data.find(
            (p) => p.id === referenceProductId,
          );
          if (refProduct) {
            setSelectedReferenceProduct(refProduct);
            setFormData((prev) => ({
              ...prev,
              referenceProductId: referenceProductId,
            }));
          }
        }
      } catch (error) {
        console.error('Error loading artisan products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadArtisanProducts();
  }, [artisanId, isOpen, referenceProductId]);

  // Check if form can be submitted
  const canSubmit =
    formData.title.trim().length >= 10 &&
    formData.description.trim().length >= 50;
  // console.log('Can submit:', canSubmit, {
  //   titleLength: formData.title.trim().length,
  //   descriptionLength: formData.description.trim().length,
  //   loading,
  //   uploadingFiles
  // }); // Debug log

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              step <= currentStep
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step}
          </div>
          {step < 4 && (
            <div
              className={`w-20 h-1 mx-2 rounded transition-all duration-300 ${
                step < currentStep
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500'
                  : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Ý tưởng của bạn
              </h3>
              <p className="text-gray-600">
                Hãy chia sẻ ý tưởng sản phẩm mà bạn mong muốn
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề sản phẩm mong muốn{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="VD: Bình gốm sứ phong cách Nhật Bản với họa tiết hoa anh đào"
                  className="w-full text-lg border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length} ký tự (tối thiểu 10 ký tự)
                </p>
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết ý tưởng <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Hãy mô tả chi tiết về sản phẩm bạn mong muốn: 
- Công dụng và cách sử dụng
- Kích thước tổng quan
- Phong cách và cảm nhận mong muốn
- Câu chuyện hoặc ý nghĩa đặc biệt
- Bất kỳ yêu cầu đặc biệt nào khác..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 placeholder-gray-400"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/2000 ký tự (tối thiểu 50 ký tự)
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SwatchIcon className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Thông số kỹ thuật
              </h3>
              <p className="text-gray-600">
                Cung cấp thông tin chi tiết để nghệ nhân hiểu rõ
              </p>
            </div>

            {/* Reference Product Selection */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Sản phẩm tham khảo (tùy chọn)
              </h3>

              {loadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2 text-gray-500">
                    Đang tải sản phẩm...
                  </span>
                </div>
              ) : artisanProducts.length > 0 ? (
                <div className="space-y-3">
                  <select
                    value={formData.referenceProductId}
                    onChange={(e) =>
                      handleReferenceProductChange(e.target.value)
                    }
                    className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="">Chọn sản phẩm tham khảo...</option>
                    {artisanProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {formatPrice(product.price)}
                      </option>
                    ))}
                  </select>

                  {selectedReferenceProduct && (
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-4">
                        <img
                          src={selectedReferenceProduct.images[0]}
                          alt={selectedReferenceProduct.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900">
                            {selectedReferenceProduct.name}
                          </h4>
                          <p className="text-blue-700 font-medium">
                            {formatPrice(selectedReferenceProduct.price)}
                          </p>
                          <p className="text-sm text-blue-600 mt-1 line-clamp-2">
                            {selectedReferenceProduct.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={clearReferenceProduct}
                          className="text-blue-400 hover:text-blue-600"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span>Nghệ nhân này chưa có sản phẩm nào</span>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Materials */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chất liệu mong muốn
                </label>
                <textarea
                  rows={3}
                  value={formData.specifications.materials}
                  onChange={(e) =>
                    handleSpecificationChange('materials', e.target.value)
                  }
                  placeholder="VD: Gỗ sồi tự nhiên, không sơn PU..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {MATERIAL_SUGGESTIONS.slice(0, 6).map((material) => (
                    <button
                      key={material}
                      type="button"
                      onClick={() => addSuggestion('materials', material)}
                      className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                    >
                      + {material}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu sắc & tông màu
                </label>
                <textarea
                  rows={3}
                  value={formData.specifications.colors}
                  onChange={(e) =>
                    handleSpecificationChange('colors', e.target.value)
                  }
                  placeholder="VD: Nâu gỗ tự nhiên, điểm nhấn vàng đồng..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {COLOR_SUGGESTIONS.slice(0, 6).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => addSuggestion('colors', color)}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                    >
                      + {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Other specification fields... */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kích thước & tỷ lệ
                </label>
                <textarea
                  rows={3}
                  value={formData.specifications.dimensions}
                  onChange={(e) =>
                    handleSpecificationChange('dimensions', e.target.value)
                  }
                  placeholder="VD: Cao 30cm, đường kính 15cm, phù hợp để bàn..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phong cách & cảm nhận
                </label>
                <textarea
                  rows={3}
                  value={formData.specifications.style}
                  onChange={(e) =>
                    handleSpecificationChange('style', e.target.value)
                  }
                  placeholder="VD: Phong cách Á Đông hiện đại, thanh lịch..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {STYLE_SUGGESTIONS.slice(0, 5).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => addSuggestion('style', style)}
                      className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                    >
                      + {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional specification fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kỹ thuật chế tác mong muốn
                </label>
                <input
                  type="text"
                  value={formData.specifications.technique}
                  onChange={(e) =>
                    handleSpecificationChange('technique', e.target.value)
                  }
                  placeholder="VD: Khắc thủ công, inlay gỗ, men rạn..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Công dụng & cách sử dụng
                </label>
                <input
                  type="text"
                  value={formData.specifications.usage}
                  onChange={(e) =>
                    handleSpecificationChange('usage', e.target.value)
                  }
                  placeholder="VD: Trang trí phòng khách, cắm hoa, quà tặng..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tính năng đặc biệt
                </label>
                <textarea
                  rows={3}
                  value={formData.specifications.features}
                  onChange={(e) =>
                    handleSpecificationChange('features', e.target.value)
                  }
                  placeholder="VD: Có thể tháo rời, chống nước, có đèn LED..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dịp sử dụng
                </label>
                <input
                  type="text"
                  value={formData.specifications.occasion}
                  onChange={(e) =>
                    handleSpecificationChange('occasion', e.target.value)
                  }
                  placeholder="VD: Cưới hỏi, khai trương, hàng ngày..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nguồn cảm hứng & ghi chú thêm
              </label>
              <textarea
                rows={4}
                value={formData.specifications.inspiration}
                onChange={(e) =>
                  handleSpecificationChange('inspiration', e.target.value)
                }
                placeholder="Chia sẻ câu chuyện, cảm hứng, hoặc bất kỳ yêu cầu đặc biệt nào khác..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhotoIcon className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Hình ảnh tham khảo
              </h3>
              <p className="text-gray-600">
                Thêm hình ảnh để nghệ nhân hiểu rõ hơn về ý tưởng
              </p>
            </div>

            <FileUpload
              files={attachmentFiles}
              onFilesChange={setAttachmentFiles}
              accept="image"
              multiple={true}
              maxFiles={15}
              maxSize={5}
              className="border-2 border-dashed border-green-300 hover:border-green-400 transition-colors rounded-xl"
            />

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-green-900 mb-2 flex items-center">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Gợi ý hình ảnh tham khảo hiệu quả:
              </h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Hình ảnh sản phẩm tương tự bạn thích</li>
                <li>• Màu sắc, họa tiết, texture mong muốn</li>
                <li>• Không gian sử dụng sản phẩm</li>
                <li>• Sketch, vẽ tay nếu có</li>
                <li>• Reference từ Pinterest, Instagram</li>
              </ul>
            </div>

            {referenceProductId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-900 mb-1 flex items-center">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Sản phẩm tham khảo đã chọn
                </h5>
                <p className="text-sm text-blue-800">
                  Đã liên kết với một sản phẩm từ cửa hàng của nghệ nhân làm mẫu
                  tham khảo
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Ngân sách & thời gian
              </h3>
              <p className="text-gray-600">
                Thông tin cuối cùng để hoàn tất yêu cầu
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá ước tính (VNĐ)
                </label>
                <input
                  type="number"
                  name="estimatedPrice"
                  value={formData.estimatedPrice}
                  onChange={handleInputChange}
                  placeholder="500000"
                  className="w-full text-lg border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {errors.estimatedPrice && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.estimatedPrice}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Giá bạn dự kiến cho sản phẩm này
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngân sách tối đa (VNĐ)
                </label>
                <input
                  type="number"
                  name="customerBudget"
                  value={formData.customerBudget}
                  onChange={handleInputChange}
                  placeholder="1000000"
                  className="w-full text-lg border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {errors.customerBudget && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.customerBudget}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Ngân sách tối đa bạn có thể chi trả
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian mong muốn
                </label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Chọn thời gian</option>
                  <option value="1 tuần">1 tuần (khẩn cấp)</option>
                  <option value="2 tuần">2 tuần</option>
                  <option value="1 tháng">1 tháng</option>
                  <option value="2-3 tháng">2-3 tháng</option>
                  <option value="Linh hoạt">Linh hoạt theo nghệ nhân</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hạn phản hồi
                </label>
                <select
                  name="expiresInDays"
                  value={formData.expiresInDays}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="3">3 ngày</option>
                  <option value="7">1 tuần</option>
                  <option value="14">2 tuần</option>
                  <option value="30">1 tháng</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Nghệ nhân sẽ phản hồi trong thời gian này
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-amber-900 mb-2">
                💡 Lưu ý về ngân sách:
              </h5>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Giá ước tính giúp nghệ nhân có hướng báo giá</li>
                <li>• Ngân sách tối đa sẽ không hiển thị với nghệ nhân</li>
                <li>• Bạn vẫn có thể thương lượng khi nhận được báo giá</li>
                <li>• Giá cuối cùng sẽ được thỏa thuận qua tin nhắn</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      showCloseButton={false}
      closeOnOverlayClick={!loading && !uploadingFiles}
      closeOnEscape={!loading && !uploadingFiles}
    >
      <div className="relative max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-6 border-b border-gray-200">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 left-4 w-8 h-8 bg-orange-300 rounded-full"></div>
            <div className="absolute top-8 right-8 w-6 h-6 bg-pink-300 rounded-full"></div>
            <div className="absolute bottom-4 left-1/3 w-4 h-4 bg-purple-300 rounded-full"></div>
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl shadow-lg">
                <WrenchScrewdriverIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Tạo đề xuất Custom Order
                </h2>
                <p className="text-gray-600 mt-1">
                  Chia sẻ ý tưởng của bạn với nghệ nhân
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading || uploadingFiles}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-xl transition-all duration-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <StepIndicator />
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1 || loading || uploadingFiles}
              >
                Quay lại
              </Button>

              <div className="flex space-x-3">
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  >
                    Tiếp tục
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    onClick={handleButtonClick} // Debug click
                    loading={loading || uploadingFiles}
                    disabled={!canSubmit || loading || uploadingFiles}
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
                    {uploadingFiles ? 'Đang tải hình ảnh...' : 'Gửi đề xuất'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Debug info */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs">
            <div>Can Submit: {canSubmit ? 'YES' : 'NO'}</div>
            <div>Title: {formData.title.length} chars</div>
            <div>Desc: {formData.description.length} chars</div>
            <div>Step: {currentStep}</div>
          </div>
        )} */}

        {/* Loading Overlay */}
        {(loading || uploadingFiles) && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-medium text-gray-700">
                {uploadingFiles
                  ? 'Đang tải hình ảnh...'
                  : 'Đang tạo đề xuất...'}
              </p>
              <p className="text-sm text-gray-500">Vui lòng đợi...</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
