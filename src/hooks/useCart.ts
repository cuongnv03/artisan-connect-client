import { useQuery, useMutation, useQueryClient } from 'react-query';
import { CartService } from '../services/cart.service';
import { useToast } from './useToast';

export const useCart = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Get cart
  const {
    data: cart,
    isLoading,
    isError,
    refetch,
  } = useQuery('cart', () => CartService.getCart(), {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add to cart
  const addToCartMutation = useMutation(
    ({ productId, quantity }: { productId: string; quantity: number }) =>
      CartService.addToCart(productId, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Item added to cart');
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || 'Failed to add item to cart',
        );
      },
    },
  );

  // Update cart item
  const updateCartItemMutation = useMutation(
    ({ productId, quantity }: { productId: string; quantity: number }) =>
      CartService.updateCartItem(productId, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Cart updated');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update cart');
      },
    },
  );

  // Remove from cart
  const removeFromCartMutation = useMutation(
    (productId: string) => CartService.removeFromCart(productId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Item removed from cart');
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || 'Failed to remove item from cart',
        );
      },
    },
  );

  // Clear cart
  const clearCartMutation = useMutation(() => CartService.clearCart(), {
    onSuccess: () => {
      queryClient.invalidateQueries('cart');
      toast.success('Cart cleared');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to clear cart');
    },
  });

  // Validate cart
  const validateCartMutation = useMutation(() => CartService.validateCart(), {
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to validate cart');
    },
  });

  // Calculate cart totals
  const calculateTotals = () => {
    if (!cart || cart.length === 0) {
      return {
        subtotal: 0,
        itemCount: 0,
      };
    }

    const subtotal = cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );

    const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

    return { subtotal, itemCount };
  };

  // Proceed to checkout
  const proceedToCheckout = async () => {
    try {
      const validation = await validateCartMutation.mutateAsync();

      if (!validation.valid) {
        toast.error(validation.message || 'Unable to proceed to checkout');
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  // Return values and functions
  return {
    cart,
    isLoading,
    isError,
    refetch,
    addToCart: addToCartMutation.mutate,
    updateCartItem: updateCartItemMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    calculateTotals,
    proceedToCheckout,
    isAddingToCart: addToCartMutation.isLoading,
    isUpdatingCart: updateCartItemMutation.isLoading,
    isRemovingFromCart: removeFromCartMutation.isLoading,
    isClearingCart: clearCartMutation.isLoading,
  };
};
