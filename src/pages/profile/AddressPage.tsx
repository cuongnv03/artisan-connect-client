import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useToastContext } from '../../contexts/ToastContext';
import { userService } from '../../services/user.service';
import { Address } from '../../types/user';
import { useForm } from '../../hooks/useForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

interface AddressFormData {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export const AddressPage: React.FC = () => {
  const { success, error } = useToastContext();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { values, handleChange, handleSubmit, resetForm, setFieldValue } =
    useForm<AddressFormData>({
      initialValues: {
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Việt Nam',
        isDefault: false,
      },
      onSubmit: handleSaveAddress,
    });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const addressList = await userService.getAddresses();
      setAddresses(addressList);
    } catch (err) {
      console.error('Error loading addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingAddress(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFieldValue('fullName', address.fullName);
    setFieldValue('phone', address.phone || '');
    setFieldValue('street', address.street);
    setFieldValue('city', address.city);
    setFieldValue('state', address.state);
    setFieldValue('zipCode', address.zipCode);
    setFieldValue('country', address.country);
    setFieldValue('isDefault', address.isDefault);
    setIsModalOpen(true);
  };

  async function handleSaveAddress(data: AddressFormData) {
    setSubmitting(true);
    try {
      if (editingAddress) {
        await userService.updateAddress(editingAddress.id, data);
        success('Cập nhật địa chỉ thành công!');
      } else {
        await userService.createAddress(data);
        success('Thêm địa chỉ thành công!');
      }

      setIsModalOpen(false);
      loadAddresses();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;

    try {
      await userService.deleteAddress(id);
      success('Xóa địa chỉ thành công!');
      loadAddresses();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi xóa địa chỉ');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await userService.setDefaultAddress(id);
      success('Đặt làm địa chỉ mặc định thành công!');
      loadAddresses();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý địa chỉ</h1>
        <Button
          onClick={openAddModal}
          leftIcon={<PlusIcon className="w-4 h-4" />}
        >
          Thêm địa chỉ
        </Button>
      </div>

      {/* Address List */}
      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPinIcon className="w-16 h-16" />}
          title="Chưa có địa chỉ nào"
          description="Thêm địa chỉ để thuận tiện cho việc đặt hàng"
          action={{
            label: 'Thêm địa chỉ đầu tiên',
            onClick: openAddModal,
          }}
        />
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card key={address.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {address.fullName}
                    </h3>
                    {address.isDefault && (
                      <span className="px-2 py-1 text-xs bg-primary text-white rounded-full">
                        Mặc định
                      </span>
                    )}
                  </div>

                  {address.phone && (
                    <p className="text-sm text-gray-600 mb-1">
                      📞 {address.phone}
                    </p>
                  )}

                  <p className="text-gray-700">
                    {address.street}, {address.city}, {address.state}{' '}
                    {address.zipCode}, {address.country}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      leftIcon={<CheckIcon className="w-4 h-4" />}
                    >
                      Đặt mặc định
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(address)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Họ và tên"
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            required
          />

          <Input
            label="Số điện thoại"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
          />

          <Input
            label="Địa chỉ cụ thể"
            name="street"
            value={values.street}
            onChange={handleChange}
            required
            placeholder="Số nhà, tên đường, phường/xã"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Thành phố"
              name="city"
              value={values.city}
              onChange={handleChange}
              required
            />

            <Input
              label="Tỉnh/Thành phố"
              name="state"
              value={values.state}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mã bưu điện"
              name="zipCode"
              value={values.zipCode}
              onChange={handleChange}
              required
            />

            <Input
              label="Quốc gia"
              name="country"
              value={values.country}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={values.isDefault}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
              Đặt làm địa chỉ mặc định
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" loading={submitting}>
              {editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
