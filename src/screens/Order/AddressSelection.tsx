import React, { useState, useEffect } from 'react';
import { Address } from '@/types/profile.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/form/Button';
import { AddressForm } from './AddressForm';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

interface AddressSelectionProps {
  addresses: Address[];
  selectedAddress?: Address;
  onSelectAddress: (address: Address) => void;
  isLoading?: boolean;
}

export const AddressSelection: React.FC<AddressSelectionProps> = ({
  addresses,
  selectedAddress,
  onSelectAddress,
  isLoading = false,
}) => {
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Select default address if available and no address is selected
  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      const defaultAddress =
        addresses.find((addr) => addr.isDefault) || addresses[0];
      onSelectAddress(defaultAddress);
    }
  }, [addresses, selectedAddress, onSelectAddress]);

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/12 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Shipping Address
      </h2>

      {addresses.length === 0 && !showNewAddressForm ? (
        <div className="text-center py-4">
          <p className="text-gray-500 mb-4">
            You don't have any saved addresses
          </p>
          <Button variant="primary" onClick={() => setShowNewAddressForm(true)}>
            Add New Address
          </Button>
        </div>
      ) : (
        <>
          {/* Address selection */}
          {!showNewAddressForm && (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAddress?.id === address.id
                      ? 'border-accent bg-accent-light/10'
                      : 'border-gray-200 hover:border-accent'
                  }`}
                  onClick={() => onSelectAddress(address)}
                >
                  <div className="flex justify-between">
                    <div className="font-medium">{address.fullName}</div>
                    {address.isDefault && (
                      <span className="text-xs bg-accent text-white px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    <div>{address.street}</div>
                    <div>
                      {address.city}, {address.state} {address.zipCode}
                    </div>
                    <div>{address.country}</div>
                    {address.phone && (
                      <div className="mt-1">Phone: {address.phone}</div>
                    )}
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="mt-4 w-full flex items-center justify-center"
                onClick={() => setShowNewAddressForm(true)}
              >
                <PlusCircleIcon className="w-5 h-5 mr-1" />
                Add New Address
              </Button>
            </div>
          )}

          {/* New address form */}
          {showNewAddressForm && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium">Add New Address</h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowNewAddressForm(false)}
                >
                  Cancel
                </Button>
              </div>
              <AddressForm onCancel={() => setShowNewAddressForm(false)} />
            </div>
          )}
        </>
      )}
    </Card>
  );
};
