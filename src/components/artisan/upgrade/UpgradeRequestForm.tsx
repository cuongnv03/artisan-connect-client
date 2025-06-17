import React, { useState } from 'react';
import {
  BriefcaseIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  StarIcon,
  PhotoIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useForm } from '../../../hooks/common/useForm';
import { useToastContext } from '../../../contexts/ToastContext';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card } from '../../ui/Card';
import { FileUpload } from '../../common/FileUpload';
import { uploadService } from '../../../services/upload.service';

// ✅ Mapping từ tiếng Việt sang backend enum
const SPECIALTY_MAPPING: Record<string, string> = {
  'Gốm sứ': 'pottery',
  'Thêu tay': 'embroidery',
  'Đồ gỗ': 'woodworking',
  'Tranh vẽ': 'painting',
  'Đồ da': 'leatherwork',
  'Trang sức': 'jewelry',
  'Đan lát': 'knitting',
  'Điêu khắc': 'sculpture',
  'Khắc gỗ': 'woodworking',
  'Dệt thổ cẩm': 'textiles',
  'Làm bánh': 'other',
  'Nến thơm': 'other',
  'Soap handmade': 'other',
  'Đồ decor': 'other',
  'Đồ kim loại': 'metalwork',
  'Đồ thủy tinh': 'glasswork',
  'Chữ thư pháp': 'calligraphy',
  'Chụp ảnh': 'photography',
  Gốm: 'ceramics',
  Khác: 'other',
};

// ✅ Display names cho UI (giữ nguyên tiếng Việt)
const ARTISAN_SPECIALTIES = [
  'Gốm sứ',
  'Thêu tay',
  'Đồ gỗ',
  'Tranh vẽ',
  'Đồ da',
  'Trang sức',
  'Đan lát',
  'Điêu khắc',
  'Khắc gỗ',
  'Dệt thổ cẩm',
  'Đồ kim loại',
  'Đồ thủy tinh',
  'Chữ thư pháp',
  'Chụp ảnh',
  'Gốm',
  'Khác',
];

// ✅ Transform function để convert sang backend format
const transformSpecialties = (vietnameseSpecialties: string[]): string[] => {
  return vietnameseSpecialties.map((specialty) => {
    const enumValue = SPECIALTY_MAPPING[specialty];
    if (!enumValue) {
      console.warn(`Unknown specialty: ${specialty}, defaulting to 'other'`);
      return 'other';
    }
    return enumValue;
  });
};

interface UpgradeFormData {
  shopName: string;
  shopDescription: string;
  specialties: string[];
  experience: number;
  website: string;
  reason: string;
  facebook: string;
  instagram: string;
  youtube: string;
  images: string[];
  certificates: string[];
  identityProof: string;
}

interface UpgradeRequestFormProps {
  onSubmit: (data: UpgradeFormData) => Promise<void>;
  loading: boolean;
}

export const UpgradeRequestForm: React.FC<UpgradeRequestFormProps> = ({
  onSubmit,
  loading,
}) => {
  const { error: showError } = useToastContext();

  // File states
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [identityFiles, setIdentityFiles] = useState<File[]>([]);

  // Upload URL states
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [certificateUrls, setCertificateUrls] = useState<string[]>([]);
  const [identityUrls, setIdentityUrls] = useState<string[]>([]);

  // Upload loading states
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingCertificates, setUploadingCertificates] = useState(false);
  const [uploadingIdentity, setUploadingIdentity] = useState(false);

  const {
    values,
    handleChange,
    handleSubmit,
    errors,
    setFieldValue,
    setFieldError,
  } = useForm<UpgradeFormData>({
    initialValues: {
      shopName: '',
      shopDescription: '',
      specialties: [],
      experience: 0,
      website: '',
      reason: '',
      facebook: '',
      instagram: '',
      youtube: '',
      images: [],
      certificates: [],
      identityProof: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      // Basic info validation
      if (!values.shopName.trim()) {
        errors.shopName = 'Tên cửa hàng là bắt buộc';
      } else if (values.shopName.length < 3) {
        errors.shopName = 'Tên cửa hàng phải có ít nhất 3 ký tự';
      } else if (values.shopName.length > 100) {
        errors.shopName = 'Tên cửa hàng không được quá 100 ký tự';
      }

      if (!values.shopDescription.trim()) {
        errors.shopDescription = 'Mô tả cửa hàng là bắt buộc';
      } else if (values.shopDescription.length < 50) {
        errors.shopDescription = 'Mô tả phải có ít nhất 50 ký tự';
      } else if (values.shopDescription.length > 1000) {
        errors.shopDescription = 'Mô tả không được quá 1000 ký tự';
      }

      if (values.specialties.length === 0) {
        errors.specialties = 'Vui lòng chọn ít nhất 1 chuyên môn';
      } else if (values.specialties.length > 5) {
        errors.specialties = 'Tối đa 5 chuyên môn';
      }

      if (!values.experience || values.experience < 0) {
        errors.experience = 'Kinh nghiệm phải là số và không được âm';
      } else if (values.experience > 100) {
        errors.experience = 'Kinh nghiệm không được quá 100 năm';
      }

      if (!values.reason.trim()) {
        errors.reason = 'Lý do là bắt buộc';
      } else if (values.reason.length < 100) {
        errors.reason = 'Lý do phải có ít nhất 100 ký tự';
      } else if (values.reason.length > 1000) {
        errors.reason = 'Lý do không được quá 1000 ký tự';
      }

      // File validation
      if (values.images.length === 0) {
        errors.images = 'Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm';
      }

      if (values.certificates.length === 0) {
        errors.certificates = 'Vui lòng tải lên ít nhất 1 chứng chỉ';
      }

      if (!values.identityProof) {
        errors.identityProof = 'Vui lòng tải lên giấy tờ tuy thân';
      }

      return errors;
    },
    onSubmit: async (formData) => {
      // ✅ Transform specialties before sending
      const payload = {
        ...formData,
        specialties: transformSpecialties(formData.specialties),
      };
      await onSubmit(payload);
    },
  });

  const addSpecialty = (specialty: string) => {
    if (
      !values.specialties.includes(specialty) &&
      values.specialties.length < 5
    ) {
      setFieldValue('specialties', [...values.specialties, specialty]);
    }
  };

  const removeSpecialty = (index: number) => {
    const newSpecialties = values.specialties.filter((_, i) => i !== index);
    setFieldValue('specialties', newSpecialties);
  };

  const addCustomSpecialty = (customSpecialty: string) => {
    const trimmed = customSpecialty.trim();
    if (!trimmed) return;

    // Check if it's already a known specialty
    if (ARTISAN_SPECIALTIES.includes(trimmed)) {
      addSpecialty(trimmed);
      return;
    }

    // For custom specialties, map to 'other' or find closest match
    const mappedValue = SPECIALTY_MAPPING[trimmed] || 'other';

    // Add with the original Vietnamese name for UI
    if (
      !values.specialties.includes(trimmed) &&
      values.specialties.length < 5
    ) {
      // If it's not in mapping, add to mapping as 'other'
      if (!SPECIALTY_MAPPING[trimmed]) {
        SPECIALTY_MAPPING[trimmed] = 'other';
      }
      addSpecialty(trimmed);
    }
  };

  // Upload handlers
  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = files.map((file) =>
        uploadService.uploadImage(file, { folder: 'artisan-upgrade/images' }),
      );

      const results = await Promise.all(uploadPromises);
      const urls = results.map((result) => result.url);

      setImageUrls((prev) => [...prev, ...urls]);
      setFieldValue('images', [...values.images, ...urls]);
      setImageFiles((prev) => [...prev, ...files]);
    } catch (error) {
      console.error('Image upload failed:', error);
      showError('Có lỗi khi tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleCertificateUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setUploadingCertificates(true);
    try {
      const uploadPromises = files.map((file) =>
        uploadService.uploadImage(file, {
          folder: 'artisan-upgrade/certificates',
        }),
      );

      const results = await Promise.all(uploadPromises);
      const urls = results.map((result) => result.url);

      setCertificateUrls((prev) => [...prev, ...urls]);
      setFieldValue('certificates', [...values.certificates, ...urls]);
      setCertificateFiles((prev) => [...prev, ...files]);
    } catch (error) {
      console.error('Certificate upload failed:', error);
      showError('Có lỗi khi tải chứng chỉ lên. Vui lòng thử lại.');
    } finally {
      setUploadingCertificates(false);
    }
  };

  const handleIdentityUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setUploadingIdentity(true);
    try {
      const file = files[0]; // Only take first file for identity
      const result = await uploadService.uploadImage(file, {
        folder: 'artisan-upgrade/identity',
      });

      setIdentityUrls([result.url]);
      setFieldValue('identityProof', result.url);
      setIdentityFiles([file]);
    } catch (error) {
      console.error('Identity upload failed:', error);
      showError('Có lỗi khi tải giấy tờ lên. Vui lòng thử lại.');
    } finally {
      setUploadingIdentity(false);
    }
  };

  // Remove handlers
  const removeImage = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    setImageFiles(newFiles);
    setFieldValue('images', newUrls);
  };

  const removeCertificate = (index: number) => {
    const newUrls = certificateUrls.filter((_, i) => i !== index);
    const newFiles = certificateFiles.filter((_, i) => i !== index);
    setCertificateUrls(newUrls);
    setCertificateFiles(newFiles);
    setFieldValue('certificates', newUrls);
  };

  const removeIdentity = () => {
    setIdentityUrls([]);
    setIdentityFiles([]);
    setFieldValue('identityProof', '');
  };

  const isUploading =
    uploadingImages || uploadingCertificates || uploadingIdentity;

  return (
    <Card className="p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Thông tin đăng ký nghệ nhân
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BriefcaseIcon className="w-5 h-5 mr-2" />
            Thông tin cơ bản
          </h3>

          <Input
            label="Tên cửa hàng"
            name="shopName"
            value={values.shopName}
            onChange={handleChange}
            error={errors.shopName}
            placeholder="VD: Gốm sứ Bát Tràng"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả cửa hàng <span className="text-red-500">*</span>
            </label>
            <textarea
              name="shopDescription"
              rows={4}
              className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                errors.shopDescription
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : ''
              }`}
              placeholder="Giới thiệu về cửa hàng, sản phẩm chính, phong cách... (tối thiểu 50 ký tự)"
              value={values.shopDescription}
              onChange={handleChange}
            />
            {errors.shopDescription && (
              <p className="mt-1 text-sm text-red-600">
                {errors.shopDescription}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {values.shopDescription.length}/50 ký tự tối thiểu
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chuyên môn/Lĩnh vực <span className="text-red-500">*</span>
          </label>
          {/* Selected specialties */}
          {values.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {values.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                >
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(index)}
                    className="ml-2 text-primary/60 hover:text-primary"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Specialty suggestions */}
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Chọn từ danh sách hoặc nhập tự do:
            </p>
            <div className="flex flex-wrap gap-2">
              {ARTISAN_SPECIALTIES.map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => addSpecialty(specialty)}
                  disabled={
                    values.specialties.includes(specialty) ||
                    values.specialties.length >= 5
                  }
                  className={`text-sm px-3 py-1 rounded border transition-colors ${
                    values.specialties.includes(specialty)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          {/* Custom specialty input */}
          <div className="mt-3">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Nhập chuyên môn khác..."
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (
                      value &&
                      !values.specialties.includes(value) &&
                      values.specialties.length < 5
                    ) {
                      addSpecialty(value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.querySelector(
                    'input[placeholder="Nhập chuyên môn khác..."]',
                  ) as HTMLInputElement;
                  const value = input?.value.trim();
                  if (
                    value &&
                    !values.specialties.includes(value) &&
                    values.specialties.length < 5
                  ) {
                    addSpecialty(value);
                    input.value = '';
                  }
                }}
                disabled={values.specialties.length >= 5}
              >
                Thêm
              </Button>
            </div>
          </div>

          {errors.specialties && (
            <p className="mt-1 text-sm text-red-600">{errors.specialties}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Đã chọn {values.specialties.length}/5 chuyên môn
          </p>
        </div>

        {/* ✅ Updated Experience Input */}
        <Input
          label="Số năm kinh nghiệm"
          name="experience"
          type="number"
          value={values.experience.toString()}
          onChange={(e) =>
            setFieldValue('experience', parseInt(e.target.value) || 0)
          }
          error={errors.experience}
          placeholder="VD: 5"
          min="0"
          max="100"
          required
        />

        {/* Online Presence */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <GlobeAltIcon className="w-5 h-5 mr-2" />
            Hiện diện trực tuyến
          </h3>

          <Input
            label="Website"
            name="website"
            type="url"
            value={values.website}
            onChange={handleChange}
            placeholder="https://example.com"
            helperText="Website hoặc blog cá nhân (nếu có)"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Facebook"
              name="facebook"
              type="url"
              value={values.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/..."
            />

            <Input
              label="Instagram"
              name="instagram"
              type="url"
              value={values.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/..."
            />

            <Input
              label="YouTube"
              name="youtube"
              type="url"
              value={values.youtube}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>

        {/* File Uploads */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <PhotoIcon className="w-5 h-5 mr-2" />
            Tài liệu minh chứng
          </h3>

          {/* Product Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Hình ảnh sản phẩm/xưởng làm việc{' '}
              <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Tải lên hình ảnh giới thiệu sản phẩm hoặc không gian làm việc của
              bạn (tối đa 10 ảnh)
            </p>

            {/* Custom upload area for images */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById('image-upload')?.click()
                    }
                    disabled={uploadingImages || imageUrls.length >= 10}
                    loading={uploadingImages}
                  >
                    {uploadingImages ? 'Đang tải...' : 'Chọn ảnh'}
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleImageUpload(files);
                    }}
                  />
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF (tối đa 5MB mỗi file)
                  </p>
                </div>
              </div>
            </div>

            {errors.images && (
              <p className="mt-1 text-sm text-red-600">{errors.images}</p>
            )}

            {/* Image Preview */}
            {imageUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Sản phẩm ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certificates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chứng chỉ, bằng cấp <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Tải lên các chứng chỉ nghề, bằng cấp liên quan (tối đa 10 file)
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById('certificate-upload')?.click()
                    }
                    disabled={
                      uploadingCertificates || certificateUrls.length >= 10
                    }
                    loading={uploadingCertificates}
                  >
                    {uploadingCertificates ? 'Đang tải...' : 'Chọn chứng chỉ'}
                  </Button>
                  <input
                    id="certificate-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleCertificateUpload(files);
                    }}
                  />
                  <p className="text-sm text-gray-500">
                    Ảnh hoặc PDF (tối đa 5MB mỗi file)
                  </p>
                </div>
              </div>
            </div>

            {errors.certificates && (
              <p className="mt-1 text-sm text-red-600">{errors.certificates}</p>
            )}

            {/* Certificate Preview */}
            {certificateUrls.length > 0 && (
              <div className="mt-4 space-y-2">
                {certificateUrls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <ShieldCheckIcon className="w-6 h-6 text-green-500" />
                      <span className="text-sm font-medium">
                        Chứng chỉ {index + 1}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(url, '_blank')}
                      >
                        Xem
                      </Button>
                      <button
                        type="button"
                        onClick={() => removeCertificate(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Identity Proof */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Giấy tờ tuy thân <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-3">
              CMND, CCCD hoặc hộ chiếu để xác thực danh tính
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById('identity-upload')?.click()
                    }
                    disabled={uploadingIdentity || identityUrls.length >= 1}
                    loading={uploadingIdentity}
                  >
                    {uploadingIdentity ? 'Đang tải...' : 'Chọn giấy tờ'}
                  </Button>
                  <input
                    id="identity-upload"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleIdentityUpload(files);
                    }}
                  />
                  <p className="text-sm text-gray-500">
                    Ảnh hoặc PDF (tối đa 5MB)
                  </p>
                </div>
              </div>
            </div>

            {errors.identityProof && (
              <p className="mt-1 text-sm text-red-600">
                {errors.identityProof}
              </p>
            )}

            {/* Identity Preview */}
            {identityUrls.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-6 h-6 text-blue-500" />
                    <span className="text-sm font-medium">
                      Giấy tờ tuy thân
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(identityUrls[0], '_blank')}
                    >
                      Xem
                    </Button>
                    <button
                      type="button"
                      onClick={removeIdentity}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Motivation */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Động lực và mục tiêu
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lý do muốn trở thành nghệ nhân{' '}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              rows={5}
              className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                errors.reason
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : ''
              }`}
              placeholder="Chia sẻ về passion, mục tiêu và kế hoạch phát triển của bạn... (tối thiểu 100 ký tự)"
              value={values.reason}
              onChange={handleChange}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {values.reason.length}/100 ký tự tối thiểu
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => (window.location.href = '/profile')}
            disabled={loading || isUploading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            loading={loading || isUploading}
            leftIcon={<StarIcon className="w-4 h-4" />}
            disabled={isUploading}
          >
            {isUploading ? 'Đang tải files...' : 'Gửi yêu cầu'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
