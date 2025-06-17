import { useState } from 'react';
import { cartService } from '../../services/cart.service';
import { CartValidation } from '../../types/cart';
import { useToastContext } from '../../contexts/ToastContext';

export const useCartValidation = () => {
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<CartValidation | null>(null);
  const { error } = useToastContext();

  const validateCart = async (type: 'basic' | 'checkout' = 'basic') => {
    setValidating(true);
    try {
      const result = await cartService.validateCart(type);
      setValidation(result);
      return result;
    } catch (err: any) {
      error(err.message || 'Không thể kiểm tra giỏ hàng');
      return null;
    } finally {
      setValidating(false);
    }
  };

  const validateForCheckout = async () => {
    setValidating(true);
    try {
      const result = await cartService.validateForCheckout();
      return result;
    } catch (err: any) {
      error(err.message || 'Không thể kiểm tra giỏ hàng cho thanh toán');
      throw err;
    } finally {
      setValidating(false);
    }
  };

  const hasValidationErrors = validation && !validation.isValid;
  const hasValidationWarnings = validation && validation.warnings.length > 0;
  const hasNegotiationIssues =
    validation &&
    validation.negotiationIssues &&
    validation.negotiationIssues.length > 0;

  return {
    // State
    validating,
    validation,
    hasValidationErrors,
    hasValidationWarnings,
    hasNegotiationIssues,

    // Actions
    validateCart,
    validateForCheckout,
    clearValidation: () => setValidation(null),
  };
};
