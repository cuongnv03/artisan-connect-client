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

export const getCustomOrderActions = (
  order: CustomOrderWithDetails,
  currentUserId: string,
) => {
  const { isCustomer, isArtisan } = getCustomOrderContext(order, currentUserId);
  const isExpired = order.expiresAt
    ? new Date(order.expiresAt) < new Date()
    : false;

  if (isExpired) {
    return {
      message: 'Custom order đã hết hạn',
      expired: true,
    };
  }

  switch (order.status) {
    case QuoteStatus.PENDING:
      return {
        canRespond: isArtisan,
        canUpdate: isCustomer,
        canCancel: true,
        message: isArtisan
          ? 'Bạn có thể phản hồi yêu cầu này'
          : 'Đang chờ phản hồi từ nghệ nhân',
        actionFor: 'artisan',
      };

    case QuoteStatus.COUNTER_OFFERED:
      return {
        canAccept: isCustomer,
        canReject: isCustomer,
        canCounterOffer: isCustomer,
        canCancel: true,
        message: isCustomer
          ? 'Nghệ nhân đã gửi đề xuất ngược'
          : 'Đang chờ phản hồi từ khách hàng',
        actionFor: 'customer',
      };

    case QuoteStatus.ACCEPTED:
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
    return 'customer'; // Customer tạo đầu tiên
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
      return 'artisan'; // Artisan cần phản hồi
    case QuoteStatus.COUNTER_OFFERED:
      // Ai vừa counter thì đối phương sẽ phản hồi
      return lastActor === 'customer' ? 'artisan' : 'customer';
    default:
      return null;
  }
};
