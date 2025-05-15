import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/form/Button';
import { Card } from '../../../components/common/Card';
import { Alert } from '../../../components/feedback/Alert';
import { Modal } from '../../../components/feedback/Modal';
import { Loader } from '../../../components/feedback/Loader';
import { PlusIcon } from '@heroicons/react/24/outline';
import { AddressService } from '@/services/address.service';
import AddressForm from './AddressForm';
import AddressCard from './AddressCard';
import { Address } from '../../../types/api.types';

const AddressList: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAddress, setEditAddress] = useState<Address | null>(null);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await AddressService.getAddresses();
      setAddresses(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (address: any) => {
    try {
      setError(null);
      await AddressService.createAddress(address);
      setShowAddModal(false);
      fetchAddresses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handleUpdateAddress = async (id: string, address: any) => {
    try {
      setError(null);
      await AddressService.updateAddress(id, address);
      setEditAddress(null);
      fetchAddresses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      setError(null);
      await AddressService.deleteAddress(id);
      fetchAddresses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setError(null);
      await AddressService.setDefaultAddress(id);
      fetchAddresses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set default address');
    }
  };

  if (isLoading) {
    return <Loader size="md" text="Loading addresses..." />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert
          type="error"
          variant="subtle"
          dismissible
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Your Addresses</h3>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<PlusIcon className="h-4 w-4" />}
          onClick={() => setShowAddModal(true)}
        >
          Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <div className="text-center py-6">
            <h3 className="text-lg font-medium text-gray-900">
              No addresses yet
            </h3>
            <p className="text-gray-500 mt-1">
              Add your shipping and billing addresses for faster checkout
            </p>
            <Button
              variant="outline"
              className="mt-4"
              leftIcon={<PlusIcon className="h-4 w-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add Address
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => setEditAddress(address)}
              onDelete={() => handleDeleteAddress(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
            />
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Address"
      >
        <AddressForm
          onSubmit={handleAddAddress}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Address Modal */}
      <Modal
        isOpen={!!editAddress}
        onClose={() => setEditAddress(null)}
        title="Edit Address"
      >
        {editAddress && (
          <AddressForm
            initialAddress={editAddress}
            onSubmit={(data) => handleUpdateAddress(editAddress.id, data)}
            onCancel={() => setEditAddress(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default AddressList;
