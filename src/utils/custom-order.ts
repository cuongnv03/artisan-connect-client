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
 * FIXED: Get action permissions with proper artisan actions for PENDING status
 */
export const getCustomOrderActions = (
  order: CustomOrderWithDetails,
  currentUserId: string,
) => {
  const isCustomer = currentUserId === order.customer.id;
  const isArtisan = currentUserId === order.artisan.id;
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
      // FIXED: Initial state - artisan should be able to accept/reject/counter
      if (isArtisan) {
        return {
          canRespond: true,
          canAccept: true, // ADDED: Artisan can accept
          canReject: true, // ADDED: Artisan can reject
          canCounterOffer: true, // ADDED: Artisan can counter offer
          canUpdate: false,
          canCancel: true,
          message: 'Bạn có thể phản hồi yêu cầu này',
          actionFor: 'artisan',
          nextActor: 'artisan',
        };
      } else if (isCustomer) {
        return {
          canRespond: false,
          canUpdate: true, // Customer can still update their request
          canCancel: true, // Customer can cancel
          message: 'Đang chờ nghệ nhân phản hồi',
          actionFor: 'artisan',
          nextActor: 'artisan',
        };
      }
      break;

    case QuoteStatus.COUNTER_OFFERED:
      // Counter offer state: whoever didn't make last counter should respond
      const shouldCustomerRespond = lastActor === 'artisan';
      const shouldArtisanRespond = lastActor === 'customer';

      if (isCustomer && shouldCustomerRespond) {
        return {
          canAccept: true,
          canReject: true,
          canCounterOffer: true,
          canCancel: true,
          message: 'Nghệ nhân đã gửi đề xuất ngược',
          actionFor: 'customer',
          nextActor: 'customer',
        };
      } else if (isArtisan && shouldArtisanRespond) {
        return {
          canAccept: true,
          canReject: true,
          canCounterOffer: true,
          canCancel: true,
          message: 'Khách hàng đã gửi đề xuất ngược',
          actionFor: 'artisan',
          nextActor: 'artisan',
        };
      } else {
        // Waiting for other party to respond
        return {
          canCancel: true,
          message: shouldCustomerRespond
            ? 'Đang chờ khách hàng phản hồi'
            : 'Đang chờ nghệ nhân phản hồi',
          actionFor: shouldCustomerRespond ? 'customer' : 'artisan',
          nextActor: shouldCustomerRespond ? 'customer' : 'artisan',
        };
      }

    case QuoteStatus.ACCEPTED:
      // Accepted: only customer can proceed to payment
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

    case QuoteStatus.EXPIRED:
      return {
        message: 'Custom order đã hết hạn',
        expired: true,
      };

    case QuoteStatus.COMPLETED:
      return {
        message: 'Custom order đã hoàn thành và chuyển thành đơn hàng',
        completed: true,
        readonly: true,
      };

    default:
      return {
        message: 'Custom order đã kết thúc',
      };
  }

  // Fallback
  return {
    message: 'Không có hành động khả dụng',
  };
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

/**
 * ADDED: Helper function to get user-friendly status display
 */
export const getStatusDisplayInfo = (status: QuoteStatus) => {
  const statusMap = {
    [QuoteStatus.PENDING]: {
      text: 'Chờ phản hồi',
      color: 'warning',
      icon: '⏳',
      description: 'Đang chờ nghệ nhân xem xét và phản hồi',
    },
    [QuoteStatus.COUNTER_OFFERED]: {
      text: 'Đang thương lượng',
      color: 'info',
      icon: '💰',
      description: 'Đang trong quá trình thương lượng giá cả',
    },
    [QuoteStatus.ACCEPTED]: {
      text: 'Đã chấp nhận',
      color: 'success',
      icon: '✅',
      description: 'Yêu cầu đã được chấp nhận, có thể tiến hành thanh toán',
    },
    [QuoteStatus.REJECTED]: {
      text: 'Đã từ chối',
      color: 'danger',
      icon: '❌',
      description: 'Yêu cầu đã bị từ chối',
    },
    [QuoteStatus.EXPIRED]: {
      text: 'Đã hết hạn',
      color: 'default',
      icon: '⌛',
      description: 'Yêu cầu đã hết thời hạn phản hồi',
    },
    [QuoteStatus.COMPLETED]: {
      text: 'Đã hoàn thành',
      color: 'success',
      icon: '🎉',
      description: 'Đã được chuyển thành đơn hàng thành công',
    },
  };

  return statusMap[status] || statusMap[QuoteStatus.PENDING];
};

/**
 * ADDED: Helper to determine if user should see interactive actions
 */
export const shouldShowInteractiveActions = (
  order: CustomOrderWithDetails,
  currentUserId: string,
): boolean => {
  const permissions = getCustomOrderActions(order, currentUserId);

  return !!(
    permissions.canAccept ||
    permissions.canReject ||
    permissions.canCounterOffer ||
    permissions.canProceedToPayment
  );
};
