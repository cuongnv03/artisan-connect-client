import React, { useState } from 'react';
import { CreateProductVariantRequest } from '../../../../types/product';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Modal } from '../../../ui/Modal';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface VariantManagerProps {
  variants: CreateProductVariantRequest[];
  onChange: (variants: CreateProductVariantRequest[]) => void;
  errors?: any;
}

export const VariantManager: React.FC<VariantManagerProps> = ({
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

  const generateVariantsFromAttributes = () => {
    // Logic to generate variants from attribute combinations
    // This is complex - you might want to implement based on your needs
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
            onClick={generateVariantsFromAttributes}
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
          <p>Chưa có biến thể nào</p>
          <p className="text-sm">
            Thêm biến thể để khách hàng có thêm lựa chọn
          </p>
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
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Giá:</span>
                      <p className="font-medium">
                        {variant.price?.toLocaleString()} VNĐ
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Số lượng:</span>
                      <p className="font-medium">{variant.quantity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Thuộc tính:</span>
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
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal(index)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteVariant(index)}
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
        <div className="space-y-4">
          <Input
            label="Tên biến thể"
            value={variantForm.name || ''}
            onChange={(e) =>
              setVariantForm({
                ...variantForm,
                name: e.target.value,
              })
            }
          />

          <div className="grid grid-cols-2 gap-4">
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thuộc tính
            </label>
            <textarea
              rows={3}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              value={JSON.stringify(variantForm.attributes || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setVariantForm({
                    ...variantForm,
                    attributes: parsed,
                  });
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              placeholder='{"color": "red", "size": "M"}'
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={variantForm.isDefault}
                onChange={(e) =>
                  setVariantForm({
                    ...variantForm,
                    isDefault: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">
                Biến thể mặc định
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={variantForm.isActive}
                onChange={(e) =>
                  setVariantForm({
                    ...variantForm,
                    isActive: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Kích hoạt</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
