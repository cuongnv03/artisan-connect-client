import React, { useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useAddressManagement } from '../../hooks/profile/useAddressManagement';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { AddressForm } from './AddressForm';
import { EmptyState } from '../common/EmptyState';
import { Address } from '../../types/user';

export const AddressManagementSection: React.FC = () => {
  const {
    addresses,
    loading,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddressManagement();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleCreateAddress = async (data: any) => {
    await createAddress(data);
    setIsModalOpen(false);
  };

  const handleUpdateAddress = async (data: any) => {
    if (editingAddress) {
      await updateAddress(editingAddress.id, data);
      setIsModalOpen(false);
      setEditingAddress(null);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      await deleteAddress(id);
    }
  };

  const openCreateModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Quản lý địa chỉ
          </h2>
          <p className="text-sm text-gray-500">
            Thêm và quản lý địa chỉ giao hàng của bạn
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          leftIcon={<PlusIcon className="w-4 h-4" />}
        >
          Thêm địa chỉ
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          title="Chưa có địa chỉ nào"
          description="Thêm địa chỉ để thuận tiện cho việc đặt hàng"
          action={{
            label: 'Thêm địa chỉ đầu tiên',
            onClick: openCreateModal,
          }}
        />
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card key={address.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {address.fullName}
                    </h4>
                    {address.isDefault && (
                      <Badge variant="primary" size="sm">
                        Mặc định
                      </Badge>
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
                      onClick={() => setDefaultAddress(address.id)}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        title={editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
        size="lg"
      >
        <AddressForm
          address={editingAddress}
          onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingAddress(null);
          }}
        />
      </Modal>
    </div>
  );
};
