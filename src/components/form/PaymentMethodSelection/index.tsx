import React from 'react';
import { PaymentMethod } from '../../../types/order.types';
import { Card } from '../../common/Card';
import {
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

interface PaymentMethodSelectionProps {
  selectedMethod?: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  selectedMethod,
  onSelectMethod,
}) => {
  const paymentMethods = [
    {
      id: PaymentMethod.CREDIT_CARD,
      name: 'Credit Card',
      description: 'Pay securely using your credit or debit card',
      icon: CreditCardIcon,
    },
    {
      id: PaymentMethod.BANK_TRANSFER,
      name: 'Bank Transfer',
      description: 'Pay via bank transfer to our account',
      icon: BuildingLibraryIcon,
    },
    {
      id: PaymentMethod.PAYPAL,
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      icon: BanknotesIcon,
    },
    {
      id: PaymentMethod.CASH_ON_DELIVERY,
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: TruckIcon,
    },
  ];

  return (
    <Card>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedMethod === method.id
                ? 'border-accent bg-accent-light/10'
                : 'border-gray-200 hover:border-accent'
            }`}
            onClick={() => onSelectMethod(method.id)}
          >
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                  selectedMethod === method.id
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <method.icon className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <h3 className="text-base font-medium text-gray-900">
                  {method.name}
                </h3>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
