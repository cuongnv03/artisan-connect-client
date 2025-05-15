import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/form/Button';
import {
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { Address } from '../../../types/api.types';
import { formatPhoneNumber } from '../../../helpers/formatters';

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  return (
    <Card
      className={`${
        address.isDefault ? 'border-accent border-2' : ''
      } transition-all`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900">{address.fullName}</h4>
            {address.isDefault && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-light text-accent">
                <StarIcon className="h-3 w-3 mr-1" />
                Default
              </span>
            )}
          </div>

          <div className="mt-2 text-sm text-gray-500 space-y-1">
            <p>{address.street}</p>
            <p>
              {address.city}, {address.state} {address.zipCode}
            </p>
            <p>{address.country}</p>
            {address.phone && <p>Phone: {formatPhoneNumber(address.phone)}</p>}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<PencilIcon className="h-4 w-4" />}
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<TrashIcon className="h-4 w-4" />}
            onClick={onDelete}
          >
            Delete
          </Button>
          {!address.isDefault && (
            <Button
              variant="ghost"
              size="xs"
              leftIcon={<CheckCircleIcon className="h-4 w-4" />}
              onClick={onSetDefault}
            >
              Set as Default
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AddressCard;
