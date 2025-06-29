import React, { useState, useEffect } from 'react';
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
import { useForm } from '../../hooks/common/useForm';
import { uploadService } from '../../services/upload.service';
import { useToastContext } from '../../contexts/ToastContext';

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

interface FormData {
  title: string;
  description: string;
  estimatedPrice: string;
  customerBudget: string;
  timeline: string;
  expiresInDays: string;
  // Detailed specifications như form sản phẩm
  specifications: {
    materials: string;
    dimensions: string;
    colors: string;
    style: string;
    features: string;
    notes: string;
    technique: string; // Kỹ thuật chế tác
    inspiration: string; // Nguồn cảm hứng
    usage: string; // Công dụng
    occasion: string; // Dịp sử dụng
  };
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
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
  } = useForm<FormData>({
    initialValues: {
      title: '',
      description: '',
      estimatedPrice: '',
      customerBudget: '',
      timeline: '',
      expiresInDays: '7',
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
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      if (!values.title.trim()) {
        errors.title = 'Tiêu đề là bắt buộc';
      } else if (values.title.length < 10) {
        errors.title = 'Tiêu đề phải có ít nhất 10 ký tự để rõ ràng';
      }

      if (!values.description.trim()) {
        errors.description = 'Mô tả là bắt buộc';
      } else if (values.description.length < 50) {
        errors.description =
          'Mô tả phải có ít nhất 50 ký tự để nghệ nhân hiểu rõ';
      }

      if (
        values.estimatedPrice &&
        (isNaN(Number(values.estimatedPrice)) ||
          Number(values.estimatedPrice) <= 0)
      ) {
        errors.estimatedPrice = 'Giá ước tính phải là số dương';
      }

      if (
        values.customerBudget &&
        (isNaN(Number(values.customerBudget)) ||
          Number(values.customerBudget) <= 0)
      ) {
        errors.customerBudget = 'Ngân sách phải là số dương';
      }

      return errors;
    },
    onSubmit: async (data) => {
      await handleFormSubmit(data);
    },
  });

  const handleFormSubmit = async (data: FormData) => {
    if (!artisanId) {
      showError('Không tìm thấy thông tin nghệ nhân');
      return;
    }

    try {
      let attachmentUrls: string[] = [];

      if (attachmentFiles.length > 0) {
        setUploadingFiles(true);
        const uploadPromises = attachmentFiles.map((file) =>
          uploadService.uploadImage(file, { folder: 'custom-orders' }),
        );
        const uploadResults = await Promise.all(uploadPromises);
        attachmentUrls = uploadResults.map((result) => result.url);
      }

      // Build comprehensive specifications
      const specifications = Object.entries(data.specifications)
        .filter(([, value]) => value.trim())
        .reduce((acc, [key, value]) => {
          acc[key] = value.trim();
          return acc;
        }, {} as Record<string, string>);

      const submitData: CreateCustomOrderFormData = {
        artisanId,
        title: data.title.trim(),
        description: data.description.trim(),
        referenceProductId,
        specifications:
          Object.keys(specifications).length > 0 ? specifications : undefined,
        attachmentUrls: attachmentUrls.length > 0 ? attachmentUrls : undefined,
        estimatedPrice: data.estimatedPrice
          ? Number(data.estimatedPrice)
          : undefined,
        customerBudget: data.customerBudget
          ? Number(data.customerBudget)
          : undefined,
        timeline: data.timeline.trim() || undefined,
        expiresInDays: data.expiresInDays
          ? Number(data.expiresInDays)
          : undefined,
      };

      onSubmit(submitData);
      resetForm();
      setAttachmentFiles([]);
      setCurrentStep(1);
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra khi tải file');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setAttachmentFiles([]);
    setCurrentStep(1);
    onClose();
  };

  const handleSpecificationChange = (
    field: keyof FormData['specifications'],
    value: string,
  ) => {
    setFieldValue('specifications', {
      ...values.specifications,
      [field]: value,
    });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addSuggestion = (
    field: keyof FormData['specifications'],
    suggestion: string,
  ) => {
    const currentValue = values.specifications[field];
    const newValue = currentValue
      ? `${currentValue}, ${suggestion}`
      : suggestion;
    handleSpecificationChange(field, newValue);
  };

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

  const StepContent = () => {
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
              <Input
                name="title"
                label="Tiêu đề sản phẩm mong muốn"
                value={values.title}
                onChange={handleChange}
                error={errors.title}
                placeholder="VD: Bình gốm sứ phong cách Nhật Bản với họa tiết hoa anh đào"
                className="text-lg"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết ý tưởng <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={6}
                  value={values.description}
                  onChange={handleChange}
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
                  {values.description.length}/2000 ký tự (tối thiểu 50 ký tự)
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Materials */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chất liệu mong muốn
                </label>
                <textarea
                  rows={3}
                  value={values.specifications.materials}
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
                  value={values.specifications.colors}
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

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kích thước & tỷ lệ
                </label>
                <textarea
                  rows={3}
                  value={values.specifications.dimensions}
                  onChange={(e) =>
                    handleSpecificationChange('dimensions', e.target.value)
                  }
                  placeholder="VD: Cao 30cm, đường kính 15cm, phù hợp để bàn..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phong cách & cảm nhận
                </label>
                <textarea
                  rows={3}
                  value={values.specifications.style}
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

              {/* Technique */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kỹ thuật chế tác mong muốn
                </label>
                <Input
                  value={values.specifications.technique}
                  onChange={(e) =>
                    handleSpecificationChange('technique', e.target.value)
                  }
                  placeholder="VD: Khắc thủ công, inlay gỗ, men rạn..."
                />
              </div>

              {/* Usage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Công dụng & cách sử dụng
                </label>
                <Input
                  value={values.specifications.usage}
                  onChange={(e) =>
                    handleSpecificationChange('usage', e.target.value)
                  }
                  placeholder="VD: Trang trí phòng khách, cắm hoa, quà tặng..."
                />
              </div>
            </div>

            {/* Features & Occasion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tính năng đặc biệt
                </label>
                <textarea
                  rows={3}
                  value={values.specifications.features}
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
                <Input
                  value={values.specifications.occasion}
                  onChange={(e) =>
                    handleSpecificationChange('occasion', e.target.value)
                  }
                  placeholder="VD: Cưới hỏi, khai trương, hàng ngày..."
                />
              </div>
            </div>

            {/* Inspiration & Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nguồn cảm hứng & ghi chú thêm
              </label>
              <textarea
                rows={4}
                value={values.specifications.inspiration}
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
                <Input
                  name="estimatedPrice"
                  type="number"
                  value={values.estimatedPrice}
                  onChange={handleChange}
                  error={errors.estimatedPrice}
                  placeholder="500000"
                  className="text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Giá bạn dự kiến cho sản phẩm này
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngân sách tối đa (VNĐ)
                </label>
                <Input
                  name="customerBudget"
                  type="number"
                  value={values.customerBudget}
                  onChange={handleChange}
                  error={errors.customerBudget}
                  placeholder="1000000"
                  className="text-lg"
                />
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
                  value={values.timeline}
                  onChange={handleChange}
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
                  value={values.expiresInDays}
                  onChange={handleChange}
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
        {/* Artistic Header */}
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
            <StepContent />

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
                    loading={loading || uploadingFiles}
                    disabled={loading || uploadingFiles}
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
