import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { CartSummary } from './CartSummary';
import { AddressSelection } from './AddressSelection';
import { PaymentMethodSelection } from './PaymentMethodSelection';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/form/Button';
import { Input } from '../../components/form/Input';
import { useToast } from '../../hooks/useToast';
import { PaymentMethod } from '../../types/order.types';
import { Address } from '../../types/profile.types';
import { AddressService } from '../../services/address.service';
import { Link } from 'react-router-dom';

interface CheckoutProps {
  // In a real app, you'd likely fetch this from a cart context or prop it down
  items: any[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  quoteRequestId?: string; // For quote-based checkout
}

const Checkout: React.FC<CheckoutProps> = ({
  items,
  subtotal,
  tax,
  shipping,
  discount,
  total,
  quoteRequestId,
}) => {
  const navigate = useNavigate();
  const toast = useToast();

  // State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>(
    undefined,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(
    undefined,
  );
  const [notes, setNotes] = useState('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Order hooks
  const { useCreateOrderFromCart, useCreateOrderFromQuote } = useOrders();
  const createOrderFromCartMutation = useCreateOrderFromCart();
  const createOrderFromQuoteMutation = useCreateOrderFromQuote();

  // Determine if we're creating an order from cart or quote
  const isCreatingFromQuote = !!quoteRequestId;

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addressList = await AddressService.getAddresses();
        setAddresses(addressList);

        // Set default address if available
        const defaultAddress = addressList.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else if (addressList.length > 0) {
          setSelectedAddress(addressList[0]);
        }
      } catch (error) {
        toast.error('Failed to load addresses');
        console.error('Error fetching addresses:', error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [toast]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      let orderId: string;

      if (isCreatingFromQuote) {
        // Create order from quote
        const response = await createOrderFromQuoteMutation.mutateAsync({
          quoteRequestId: quoteRequestId!,
          addressId: selectedAddress.id,
          paymentMethod,
          notes: notes || undefined,
        });
        orderId = response.id;
      } else {
        // Create order from cart
        const response = await createOrderFromCartMutation.mutateAsync({
          addressId: selectedAddress.id,
          paymentMethod,
          notes: notes || undefined,
        });
        orderId = response.id;
      }

      // Navigate to order confirmation
      navigate(`/orders/${orderId}?new=true`);
    } catch (error) {
      toast.error('Failed to create order');
      console.error('Order creation error:', error);
    }
  };

  // Check if ready to submit
  const isReadyToSubmit = selectedAddress && paymentMethod;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Link
              to={isCreatingFromQuote ? '/quotes' : '/cart'}
              className="text-accent hover:text-accent-dark"
            >
              &larr; Back to {isCreatingFromQuote ? 'Quotes' : 'Cart'}
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Address Selection */}
            <AddressSelection
              addresses={addresses}
              selectedAddress={selectedAddress}
              onSelectAddress={setSelectedAddress}
              isLoading={isLoadingAddresses}
            />

            {/* Payment Method */}
            <PaymentMethodSelection
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
            />

            {/* Order Notes */}
            <Card>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Notes (Optional)
              </h2>
              <Input
                as="textarea"
                rows={3}
                placeholder="Add any special instructions or notes about your order"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Card>
          </div>

          <div className="space-y-6">
            {/* Order Summary */}
            <CartSummary
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              discount={discount}
              total={total}
              isCheckout={true}
            />

            {/* Place Order Button */}
            <Card>
              <Button
                variant="primary"
                size="lg"
                isFullWidth
                type="submit"
                isLoading={
                  createOrderFromCartMutation.isLoading ||
                  createOrderFromQuoteMutation.isLoading
                }
                disabled={!isReadyToSubmit}
              >
                Place Order
              </Button>

              {!isReadyToSubmit && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Please select an address and payment method
                </p>
              )}
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
