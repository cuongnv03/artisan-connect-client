import { CustomOrderWithDetails, QuoteStatus } from '../types/custom-order';

export const getCustomOrderContext = (
  order: CustomOrderWithDetails,
  currentUserId: string,
) => {
  const isCustomer = currentUserId === order.customer.id;
  const isArtisan = currentUserId === order.artisan.id;

  return {
    isCustomer,
    isArtisan,
    role: isCustomer ? 'customer' : isArtisan ? 'artisan' : 'observer',
    partner: isCustomer ? order.artisan : order.customer,
  };
};

/**
 * Get action permissions based on customerId/artisanId and current status
 * Logic: customerId creates → artisanId responds → back and forth until accept
 */
export const getCustomOrderActions = (
  order: CustomOrderWithDetails,
  currentUserId: string,
) => {
  const isCustomer = currentUserId === order.customer.id; // Has customerId
  const isArtisan = currentUserId === order.artisan.id; // Has artisanId
  const isExpired = order.expiresAt
    ? new Date(order.expiresAt) < new Date()
    : false;

  // No actions if expired or not involved
  if (isExpired) {
    return {
      message: 'Custom order đã hết hạn',
      expired: true,
    };
  }

  if (!isCustomer && !isArtisan) {
    return { message: 'Không có quyền truy cập' };
  }

  // Get last actor from negotiation history
  const lastActor = getLastNegotiationActor(order);

  switch (order.status) {
    case QuoteStatus.PENDING:
      // Initial state: customer created → artisan should respond
      return {
        canRespond: isArtisan,
        canUpdate: isCustomer,
        canCancel: isCustomer || isArtisan,
        message: isArtisan
          ? 'Bạn có thể phản hồi yêu cầu này'
          : 'Đang chờ nghệ nhân phản hồi',
        actionFor: 'artisan',
        nextActor: 'artisan',
      };

    case QuoteStatus.COUNTER_OFFERED:
      // Counter offer state: whoever didn't make last counter should respond
      const shouldCustomerRespond = lastActor === 'artisan';
      const shouldArtisanRespond = lastActor === 'customer';

      return {
        canAccept:
          (isCustomer && shouldCustomerRespond) ||
          (isArtisan && shouldArtisanRespond),
        canReject:
          (isCustomer && shouldCustomerRespond) ||
          (isArtisan && shouldArtisanRespond),
        canCounterOffer:
          (isCustomer && shouldCustomerRespond) ||
          (isArtisan && shouldArtisanRespond),
        canCancel: isCustomer || isArtisan,
        message: shouldCustomerRespond
          ? isCustomer
            ? 'Nghệ nhân đã gửi đề xuất ngược'
            : 'Đang chờ khách hàng phản hồi'
          : isArtisan
          ? 'Khách hàng đã gửi đề xuất ngược'
          : 'Đang chờ nghệ nhân phản hồi',
        actionFor: shouldCustomerRespond ? 'customer' : 'artisan',
        nextActor: shouldCustomerRespond ? 'customer' : 'artisan',
      };

    case QuoteStatus.ACCEPTED:
      // Accepted: only customer (customerId) can proceed to payment
      return {
        canProceedToPayment: isCustomer,
        message: 'Custom order đã được chấp nhận',
        completed: true,
      };

    case QuoteStatus.REJECTED:
      return {
        message: 'Custom order đã bị từ chối',
        rejected: true,
      };

    default:
      return {
        message: 'Custom order đã kết thúc',
      };
  }
};

export const getLastNegotiationActor = (
  order: CustomOrderWithDetails,
): 'customer' | 'artisan' | null => {
  if (!order.negotiationHistory || order.negotiationHistory.length === 0) {
    return 'customer'; // Customer created initially
  }

  const lastEntry =
    order.negotiationHistory[order.negotiationHistory.length - 1];
  return lastEntry.actor;
};

export const getNextActionActor = (
  order: CustomOrderWithDetails,
): 'customer' | 'artisan' | null => {
  const lastActor = getLastNegotiationActor(order);

  switch (order.status) {
    case QuoteStatus.PENDING:
      return 'artisan'; // Artisan needs to respond
    case QuoteStatus.COUNTER_OFFERED:
      // Opposite of last actor should respond
      return lastActor === 'customer' ? 'artisan' : 'customer';
    default:
      return null;
  }
};
