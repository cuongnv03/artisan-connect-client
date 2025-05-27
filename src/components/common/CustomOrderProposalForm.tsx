import React, { useState } from 'react';
import { useForm } from '../../hooks/useForm';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { validationRules, createValidator } from '../../utils/validation';
import { VIETNAMESE_PROVINCES } from '../../utils/constants';

interface CustomOrderProposal {
  productName: string;
  description: string;
  estimatedPrice: number;
  estimatedDuration: string;
  specifications: Record<string, string>;
  materials: string[];
  dimensions?: string;
  colorPreferences: string[];
  deadline?: Date;
}

interface CustomOrderProposalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proposal: CustomOrderProposal) => Promise<void>;
  loading?: boolean;
}

export const CustomOrderProposalForm: React.FC<
  CustomOrderProposalFormProps
> = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [specifications, setSpecifications] = useState<Record<string, string>>(
    {},
  );
  const [materials, setMaterials] = useState<string[]>([]);
  const [colorPreferences, setColorPreferences] = useState<string[]>([]);
  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const [newMaterial, setNewMaterial] = useState('');
  const [newColor, setNewColor] = useState('');

  const { values, errors, handleChange, handleSubmit, resetForm } = useForm({
    initialValues: {
      productName: '',
      description: '',
      estimatedPrice: '',
      estimatedDuration: '',
      dimensions: '',
      deadline: '',
    },
    validate: (values) => {
      const validator = createValidator([
        validationRules.required('Tên sản phẩm là bắt buộc'),
      ]);

      const errors: Record<string, string> = {};

      if (!values.productName.trim()) {
        errors.productName = 'Tên sản phẩm là bắt buộc';
      } else if (values.productName.length > 200) {
        errors.productName = 'Tên sản phẩm không được quá 200 ký tự';
      }

      if (!values.description.trim()) {
        errors.description = 'Mô tả là bắt buộc';
      } else if (values.description.length > 2000) {
        errors.description = 'Mô tả không được quá 2000 ký tự';
      }

      if (!values.estimatedPrice) {
        errors.estimatedPrice = 'Giá ước tính là bắt buộc';
      } else {
        const price = parseFloat(values.estimatedPrice);
        if (isNaN(price) || price <= 0) {
          errors.estimatedPrice = 'Giá phải là số dương';
        } else if (price > 50000000) {
          errors.estimatedPrice = 'Giá không được vượt quá $50,000';
        }
      }

      if (!values.estimatedDuration.trim()) {
        errors.estimatedDuration = 'Thời gian ước tính là bắt buộc';
      }

      if (values.deadline) {
        const deadlineDate = new Date(values.deadline);
        if (deadlineDate < new Date()) {
          errors.deadline = 'Deadline không thể ở quá khứ';
        }
      }

      return errors;
    },
    onSubmit: async (data) => {
      const proposal: CustomOrderProposal = {
        productName: data.productName,
        description: data.description,
        estimatedPrice: parseFloat(data.estimatedPrice),
        estimatedDuration: data.estimatedDuration,
        specifications,
        materials,
        dimensions: data.dimensions,
        colorPreferences,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      };

      await onSubmit(proposal);
      handleReset();
    },
  });

  const handleReset = () => {
    resetForm();
    setSpecifications({});
    setMaterials([]);
    setColorPreferences([]);
    setNewSpec({ key: '', value: '' });
    setNewMaterial('');
    setNewColor('');
  };

  const addSpecification = () => {
    if (newSpec.key.trim() && newSpec.value.trim()) {
      setSpecifications((prev) => ({
        ...prev,
        [newSpec.key]: newSpec.value,
      }));
      setNewSpec({ key: '', value: '' });
    }
  };

  const removeSpecification = (key: string) => {
    setSpecifications((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const addMaterial = () => {
    if (newMaterial.trim() && !materials.includes(newMaterial.trim())) {
      setMaterials((prev) => [...prev, newMaterial.trim()]);
      setNewMaterial('');
    }
  };

  const removeMaterial = (material: string) => {
    setMaterials((prev) => prev.filter((m) => m !== material));
  };

  const addColor = () => {
    if (newColor.trim() && !colorPreferences.includes(newColor.trim())) {
      setColorPreferences((prev) => [...prev, newColor.trim()]);
      setNewColor('');
    }
  };

  const removeColor = (color: string) => {
    setColorPreferences((prev) => prev.filter((c) => c !== color));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Đề Xuất Custom Order"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên sản phẩm *
          </label>
          <input
            type="text"
            name="productName"
            value={values.productName}
            onChange={handleChange}
            className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
            placeholder="VD: Vòng tay bạc handmade"
          />
          {errors.productName && (
            <p className="mt-1 text-sm text-red-600">{errors.productName}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả chi tiết *
          </label>
          <textarea
            name="description"
            rows={4}
            value={values.description}
            onChange={handleChange}
            className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
            placeholder="Mô tả chi tiết về sản phẩm bạn muốn đặt làm..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Price and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá ước tính (đ) *
            </label>
            <input
              type="number"
              name="estimatedPrice"
              min="1000"
              max="50000000"
              step="1"
              value={values.estimatedPrice}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              placeholder="100000"
            />
            {errors.estimatedPrice && (
              <p className="mt-1 text-sm text-red-600">
                {errors.estimatedPrice}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian ước tính *
            </label>
            <input
              type="text"
              name="estimatedDuration"
              value={values.estimatedDuration}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              placeholder="VD: 2-3 tuần"
            />
            {errors.estimatedDuration && (
              <p className="mt-1 text-sm text-red-600">
                {errors.estimatedDuration}
              </p>
            )}
          </div>
        </div>

        {/* Dimensions and Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kích thước
            </label>
            <input
              type="text"
              name="dimensions"
              value={values.dimensions}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              placeholder="VD: 20cm x 15cm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline
            </label>
            <input
              type="date"
              name="deadline"
              value={values.deadline}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
            />
            {errors.deadline && (
              <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
            )}
          </div>
        </div>

        {/* Specifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thông số kỹ thuật
          </label>

          {Object.entries(specifications).length > 0 && (
            <div className="mb-3 space-y-2">
              {Object.entries(specifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <span className="text-sm">
                    <strong>{key}:</strong> {value}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSpecification(key)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Tên thông số"
              value={newSpec.key}
              onChange={(e) =>
                setNewSpec((prev) => ({ ...prev, key: e.target.value }))
              }
              className="flex-1 rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Giá trị"
              value={newSpec.value}
              onChange={(e) =>
                setNewSpec((prev) => ({ ...prev, value: e.target.value }))
              }
              className="flex-1 rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
            />
            <Button
              type="button"
              onClick={addSpecification}
              variant="outline"
              size="sm"
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Thêm
            </Button>
          </div>
        </div>

        {/* Materials */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chất liệu mong muốn
          </label>

          {materials.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {materials.map((material) => (
                <span
                  key={material}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {material}
                  <button
                    type="button"
                    onClick={() => removeMaterial(material)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="VD: Bạc 925, Đá quý tự nhiên"
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              className="flex-1 rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addMaterial();
                }
              }}
            />
            <Button
              type="button"
              onClick={addMaterial}
              variant="outline"
              size="sm"
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Thêm
            </Button>
          </div>
        </div>

        {/* Color Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Màu sắc ưa thích
          </label>

          {colorPreferences.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {colorPreferences.map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {color}
                  <button
                    type="button"
                    onClick={() => removeColor(color)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="VD: Xanh dương, Bạc"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="flex-1 rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addColor();
                }
              }}
            />
            <Button
              type="button"
              onClick={addColor}
              variant="outline"
              size="sm"
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Thêm
            </Button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              handleReset();
              onClose();
            }}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            Gửi Đề Xuất
          </Button>
        </div>
      </form>
    </Modal>
  );
};
