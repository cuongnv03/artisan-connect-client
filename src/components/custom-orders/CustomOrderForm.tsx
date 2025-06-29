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
  specifications: {
    materials: string;
    dimensions: string;
    colors: string;
    style: string;
    features: string;
    notes: string;
  };
}

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
      },
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      // Title validation
      if (!values.title.trim()) {
        errors.title = 'Tiêu đề là bắt buộc';
      } else if (values.title.length < 5) {
        errors.title = 'Tiêu đề phải có ít nhất 5 ký tự';
      } else if (values.title.length > 200) {
        errors.title = 'Tiêu đề không được vượt quá 200 ký tự';
      }

      // Description validation
      if (!values.description.trim()) {
        errors.description = 'Mô tả là bắt buộc';
      } else if (values.description.length < 10) {
        errors.description = 'Mô tả phải có ít nhất 10 ký tự';
      } else if (values.description.length > 2000) {
        errors.description = 'Mô tả không được vượt quá 2000 ký tự';
      }

      // Price validations
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

      // Timeline validation
      if (values.timeline && values.timeline.length > 500) {
        errors.timeline = 'Thời gian không được vượt quá 500 ký tự';
      }

      // Expires validation
      if (values.expiresInDays) {
        const days = Number(values.expiresInDays);
        if (isNaN(days) || days < 1 || days > 30) {
          errors.expiresInDays = 'Thời hạn phải từ 1 đến 30 ngày';
        }
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

      // Upload attachments if any
      if (attachmentFiles.length > 0) {
        setUploadingFiles(true);
        const uploadPromises = attachmentFiles.map((file) =>
          uploadService.uploadImage(file, { folder: 'custom-orders' }),
        );
        const uploadResults = await Promise.all(uploadPromises);
        attachmentUrls = uploadResults.map((result) => result.url);
      }

      // Build specifications object
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
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra khi tải file');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setAttachmentFiles([]);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      showCloseButton={false}
      closeOnOverlayClick={!loading && !uploadingFiles}
      closeOnEscape={!loading && !uploadingFiles}
    >
      <div className="relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
              <WrenchScrewdriverIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Tạo đề xuất Custom Order
              </h2>
              <p className="text-sm text-gray-500">
                Gửi yêu cầu đặt làm sản phẩm theo ý muốn của bạn
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading || uploadingFiles}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-500" />
              Thông tin cơ bản
            </h3>

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tiêu đề yêu cầu *
              </label>
              <Input
                name="title"
                value={values.title}
                onChange={handleChange}
                error={errors.title}
                placeholder="VD: Bình gốm sứ trang trí phong cách vintage"
                className="transition-all duration-200 focus:ring-2 focus:ring-orange-500/20"
                maxLength={200}
              />
              <p className="text-xs text-gray-500">
                {values.title.length}/200 ký tự
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Mô tả chi tiết *
              </label>
              <textarea
                name="description"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 placeholder-gray-400"
                placeholder="Mô tả chi tiết về sản phẩm bạn muốn đặt làm: công dụng, phong cách, kích thước tổng quan..."
                value={values.description}
                onChange={handleChange}
                maxLength={2000}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
              <p className="text-xs text-gray-500">
                {values.description.length}/2000 ký tự
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-500" />
              Thông tin giá cả
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Giá ước tính (VNĐ)
                </label>
                <Input
                  name="estimatedPrice"
                  type="number"
                  value={values.estimatedPrice}
                  onChange={handleChange}
                  error={errors.estimatedPrice}
                  placeholder="0"
                  className="transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                />
                <p className="text-xs text-gray-500">
                  Giá bạn dự kiến cho sản phẩm này
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ngân sách của bạn (VNĐ)
                </label>
                <Input
                  name="customerBudget"
                  type="number"
                  value={values.customerBudget}
                  onChange={handleChange}
                  error={errors.customerBudget}
                  placeholder="0"
                  className="transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                />
                <p className="text-xs text-gray-500">
                  Ngân sách tối đa bạn có thể chi trả
                </p>
              </div>
            </div>
          </div>

          {/* Timeline & Expiration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-blue-500" />
              Thời gian thực hiện
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Thời gian mong muốn
                </label>
                <Input
                  name="timeline"
                  value={values.timeline}
                  onChange={handleChange}
                  error={errors.timeline}
                  placeholder="VD: 2 tuần, 1 tháng, càng sớm càng tốt..."
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Hạn phản hồi (ngày)
                </label>
                <select
                  name="expiresInDays"
                  value={values.expiresInDays}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="1">1 ngày</option>
                  <option value="3">3 ngày</option>
                  <option value="7">1 tuần</option>
                  <option value="14">2 tuần</option>
                  <option value="30">1 tháng</option>
                </select>
                <p className="text-xs text-gray-500">
                  Nghệ nhân sẽ phản hồi trong thời gian này
                </p>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <WrenchScrewdriverIcon className="w-5 h-5 mr-2 text-purple-500" />
              Thông số kỹ thuật
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Chất liệu
                </label>
                <Input
                  name="materials"
                  value={values.specifications.materials}
                  onChange={(e) =>
                    handleSpecificationChange('materials', e.target.value)
                  }
                  placeholder="VD: Gỗ sồi, gốm sứ, vải cotton..."
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Kích thước
                </label>
                <Input
                  name="dimensions"
                  value={values.specifications.dimensions}
                  onChange={(e) =>
                    handleSpecificationChange('dimensions', e.target.value)
                  }
                  placeholder="VD: 30x20x15 cm, Size M, L..."
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Màu sắc
                </label>
                <Input
                  name="colors"
                  value={values.specifications.colors}
                  onChange={(e) =>
                    handleSpecificationChange('colors', e.target.value)
                  }
                  placeholder="VD: Xanh navy, nâu gỗ tự nhiên..."
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phong cách
                </label>
                <Input
                  name="style"
                  value={values.specifications.style}
                  onChange={(e) =>
                    handleSpecificationChange('style', e.target.value)
                  }
                  placeholder="VD: Vintage, hiện đại, tối giản..."
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tính năng đặc biệt
                </label>
                <Input
                  name="features"
                  value={values.specifications.features}
                  onChange={(e) =>
                    handleSpecificationChange('features', e.target.value)
                  }
                  placeholder="VD: Có thể gập lại, chống nước, có đèn LED..."
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ghi chú thêm
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  value={values.specifications.notes}
                  onChange={(e) =>
                    handleSpecificationChange('notes', e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 placeholder-gray-400"
                  placeholder="Những yêu cầu đặc biệt khác..."
                />
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <PhotoIcon className="w-5 h-5 mr-2 text-indigo-500" />
              Hình ảnh tham khảo
            </h3>

            <FileUpload
              files={attachmentFiles}
              onFilesChange={setAttachmentFiles}
              accept="image"
              multiple={true}
              maxFiles={10}
              maxSize={5}
              className="border-2 border-dashed border-indigo-300 hover:border-indigo-400 transition-colors"
            />
            <p className="text-xs text-gray-500">
              Tối đa 10 hình ảnh, mỗi file không quá 5MB
            </p>
          </div>

          {/* Reference Product Display */}
          {referenceProductId && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <LinkIcon className="w-5 h-5 mr-2 text-blue-500" />
                Sản phẩm tham khảo
              </h3>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Đã chọn sản phẩm tham khảo từ cửa hàng của nghệ nhân
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={loading || uploadingFiles}
              className="transition-all duration-200"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              loading={loading || uploadingFiles}
              disabled={loading || uploadingFiles}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
              {uploadingFiles ? 'Đang tải file...' : 'Gửi đề xuất'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
