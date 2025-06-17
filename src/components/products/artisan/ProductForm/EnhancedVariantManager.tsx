import React, { useState } from 'react';
import { CreateProductVariantRequest } from '../../../../types/product';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Modal } from '../../../ui/Modal';
import { Toggle } from '../../../ui/Toggle';
import { KeyValueEditor } from './KeyValueEditor';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface EnhancedVariantManagerProps {
  variants: CreateProductVariantRequest[];
  onChange: (variants: CreateProductVariantRequest[]) => void;
  errors?: any;
}

export const EnhancedVariantManager: React.FC<EnhancedVariantManagerProps> = ({
  variants,
  onChange,
  errors,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [variantForm, setVariantForm] = useState<CreateProductVariantRequest>({
    name: '',
    price: 0,
    quantity: 0,
    attributes: {},
    isActive: true,
    isDefault: false,
    sortOrder: 0,
  });

  const openModal = (index?: number) => {
    if (index !== undefined) {
      setEditingIndex(index);
      setVariantForm(variants[index]);
    } else {
      setEditingIndex(null);
      setVariantForm({
        name: '',
        price: 0,
        quantity: 0,
        attributes: {},
        isActive: true,
        isDefault: variants.length === 0,
        sortOrder: variants.length,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingIndex(null);
  };

  const saveVariant = () => {
    const newVariants = [...variants];

    if (editingIndex !== null) {
      newVariants[editingIndex] = variantForm;
    } else {
      newVariants.push(variantForm);
    }

    // If this variant is set as default, remove default from others
    if (variantForm.isDefault) {
      newVariants.forEach((v, i) => {
        if (i !== editingIndex) {
          v.isDefault = false;
        }
      });
    }

    onChange(newVariants);
    closeModal();
  };

  const deleteVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    onChange(newVariants);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const generateVariants = () => {
    // Auto-generate variants based on common attributes
    const colorOptions = ['Đỏ', 'Xanh', 'Vàng', 'Trắng', 'Đen'];
    const sizeOptions = ['S', 'M', 'L', 'XL'];

    const autoVariants: CreateProductVariantRequest[] = [];

    colorOptions.forEach((color, colorIndex) => {
      sizeOptions.forEach((size, sizeIndex) => {
        autoVariants.push({
          name: `${color} - ${size}`,
          price: 0,
          quantity: 0,
          attributes: { color, size },
          isActive: true,
          isDefault: colorIndex === 0 && sizeIndex === 0,
          sortOrder: autoVariants.length,
        });
      });
    });

    onChange([...variants, ...autoVariants]);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Biến thể sản phẩm
        </h3>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={generateVariants}
            leftIcon={<Cog6ToothIcon className="w-4 h-4" />}
          >
            Tự động tạo
          </Button>
          <Button
            type="button"
            onClick={() => openModal()}
            leftIcon={<PlusIcon className="w-4 h-4" />}
          >
            Thêm biến thể
          </Button>
        </div>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Cog6ToothIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Chưa có biến thể nào</p>
          <p className="text-sm mb-4">
            Thêm biến thể để khách hàng có thêm lựa chọn về màu sắc, kích
            thước...
          </p>
          <Button onClick={() => openModal()}>Tạo biến thể đầu tiên</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">
                      {variant.name || `Biến thể ${index + 1}`}
                    </h4>
                    {variant.isDefault && (
                      <Badge variant="primary" size="sm">
                        Mặc định
                      </Badge>
                    )}
                    {!variant.isActive && (
                      <Badge variant="secondary" size="sm">
                        Không hoạt động
                      </Badge>
                    )}
                    {variant.quantity === 0 && (
                      <Badge variant="warning" size="sm">
                        Hết hàng
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Giá:</span>
                      <p className="font-medium">
                        {variant.price
                          ? formatPrice(variant.price)
                          : 'Chưa đặt'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Số lượng:</span>
                      <p className="font-medium">{variant.quantity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Thứ tự:</span>
                      <p className="font-medium">{variant.sortOrder}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Trạng thái:</span>
                      <p className="font-medium">
                        {variant.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </p>
                    </div>
                  </div>

                  {/* Attributes */}
                  {Object.keys(variant.attributes || {}).length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Thuộc tính:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(variant.attributes || {}).map(
                          ([key, value]) => (
                            <Badge key={key} variant="secondary" size="sm">
                              {key}: {String(value)}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal(index)}
                    title="Chỉnh sửa"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteVariant(index)}
                    title="Xóa"
                  >
                    <TrashIcon className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Variant Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={
          editingIndex !== null ? 'Chỉnh sửa biến thể' : 'Thêm biến thể mới'
        }
        size="lg"
      >
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên biến thể"
              value={variantForm.name || ''}
              onChange={(e) =>
                setVariantForm({ ...variantForm, name: e.target.value })
              }
              placeholder="VD: Màu đỏ - Size M"
            />

            <Input
              label="Giá (VNĐ)"
              type="number"
              value={variantForm.price || 0}
              onChange={(e) =>
                setVariantForm({
                  ...variantForm,
                  price: Number(e.target.value),
                })
              }
              min={0}
            />

            <Input
              label="Số lượng"
              type="number"
              value={variantForm.quantity || 0}
              onChange={(e) =>
                setVariantForm({
                  ...variantForm,
                  quantity: Number(e.target.value),
                })
              }
              min={0}
            />

            <Input
              label="Thứ tự"
              type="number"
              value={variantForm.sortOrder || 0}
              onChange={(e) =>
                setVariantForm({
                  ...variantForm,
                  sortOrder: Number(e.target.value),
                })
              }
              min={0}
            />
          </div>

          {/* Attributes */}
          <KeyValueEditor
            title="Thuộc tính biến thể"
            description="Các thuộc tính phân biệt biến thể này với biến thể khác"
            data={variantForm.attributes || {}}
            onChange={(attributes) =>
              setVariantForm({ ...variantForm, attributes })
            }
            placeholder={{ key: 'Thuộc tính', value: 'Giá trị' }}
          />

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Biến thể mặc định
                </label>
                <p className="text-sm text-gray-500">
                  Biến thể này sẽ được chọn mặc định
                </p>
              </div>
              <Toggle
                checked={variantForm.isDefault}
                onChange={(checked) =>
                  setVariantForm({ ...variantForm, isDefault: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Kích hoạt
                </label>
                <p className="text-sm text-gray-500">
                  Khách hàng có thể chọn biến thể này
                </p>
              </div>
              <Toggle
                checked={variantForm.isActive}
                onChange={(checked) =>
                  setVariantForm({ ...variantForm, isActive: checked })
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={closeModal}>
              Hủy
            </Button>
            <Button onClick={saveVariant}>
              {editingIndex !== null ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};
