import { Notification, NotificationType } from '../types/notification';

interface NotificationDisplay {
  title: string;
  message: string;
  icon: string;
  color: string;
}

// Mapping cho Order Status
const ORDER_STATUS_MAPPING: Record<string, string> = {
  PENDING: 'Đang chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  PAID: 'Đã thanh toán',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đã gửi hàng',
  DELIVERED: 'Đã giao hàng',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
};

// Mapping cho Payment Status
const PAYMENT_STATUS_MAPPING: Record<string, string> = {
  PENDING: 'Đang chờ thanh toán',
  PROCESSING: 'Đang xử lý thanh toán',
  COMPLETED: 'Thanh toán thành công',
  FAILED: 'Thanh toán thất bại',
  CANCELLED: 'Đã hủy thanh toán',
  REFUNDED: 'Đã hoàn tiền',
};

// Mapping cho Delivery Status
const DELIVERY_STATUS_MAPPING: Record<string, string> = {
  PREPARING: 'Đang chuẩn bị',
  SHIPPED: 'Đã gửi hàng',
  IN_TRANSIT: 'Đang vận chuyển',
  OUT_FOR_DELIVERY: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  DELIVERY_FAILED: 'Giao hàng thất bại',
  RETURNED: 'Đã trả lại',
};

// Mapping cho Negotiation Status
const NEGOTIATION_STATUS_MAPPING: Record<string, string> = {
  PENDING: 'Đang chờ phản hồi',
  ACCEPTED: 'Đã chấp nhận',
  REJECTED: 'Đã từ chối',
  COUNTER_OFFERED: 'Đã đưa ra giá đối ứng',
  EXPIRED: 'Đã hết hạn',
  COMPLETED: 'Đã hoàn thành',
};

// Mapping cho Quote Status
const QUOTE_STATUS_MAPPING: Record<string, string> = {
  PENDING: 'Đang chờ phản hồi',
  ACCEPTED: 'Đã chấp nhận',
  REJECTED: 'Đã từ chối',
  COUNTER_OFFERED: 'Đã đưa ra giá đối ứng',
  EXPIRED: 'Đã hết hạn',
};

// Template messages cho từng loại thông báo
const NOTIFICATION_TEMPLATES: Record<
  NotificationType,
  {
    titleTemplate: string;
    messageTemplate: string;
    icon: string;
    color: string;
  }
> = {
  [NotificationType.LIKE]: {
    titleTemplate: 'Lượt thích mới',
    messageTemplate: '{senderName} đã thích bài viết của bạn',
    icon: '❤️',
    color: 'red',
  },
  [NotificationType.COMMENT]: {
    titleTemplate: 'Bình luận mới',
    messageTemplate: '{senderName} đã bình luận về bài viết của bạn',
    icon: '💬',
    color: 'blue',
  },
  [NotificationType.FOLLOW]: {
    titleTemplate: 'Người theo dõi mới',
    messageTemplate: '{senderName} đã bắt đầu theo dõi bạn',
    icon: '👥',
    color: 'green',
  },
  [NotificationType.MENTION]: {
    titleTemplate: 'Bạn được nhắc đến',
    messageTemplate: '{senderName} đã nhắc đến bạn trong một bài viết',
    icon: '📢',
    color: 'orange',
  },
  [NotificationType.ORDER_UPDATE]: {
    titleTemplate: 'Cập nhật đơn hàng',
    messageTemplate:
      'Đơn hàng #{orderNumber} đã được cập nhật trạng thái: {status}',
    icon: '📦',
    color: 'blue',
  },
  [NotificationType.PAYMENT_SUCCESS]: {
    titleTemplate: 'Thanh toán thành công',
    messageTemplate: 'Thanh toán cho đơn hàng #{orderNumber} đã thành công',
    icon: '💳',
    color: 'green',
  },
  [NotificationType.PAYMENT_FAILED]: {
    titleTemplate: 'Thanh toán thất bại',
    messageTemplate:
      'Thanh toán cho đơn hàng #{orderNumber} đã thất bại{reason}',
    icon: '❌',
    color: 'red',
  },
  [NotificationType.QUOTE_REQUEST]: {
    titleTemplate: 'Yêu cầu báo giá mới',
    messageTemplate: '{senderName} đã gửi yêu cầu báo giá cho bạn',
    icon: '📝',
    color: 'blue',
  },
  [NotificationType.QUOTE_RESPONSE]: {
    titleTemplate: 'Phản hồi báo giá',
    messageTemplate: 'Yêu cầu báo giá của bạn đã được {status}',
    icon: '📋',
    color: 'indigo',
  },
  [NotificationType.CUSTOM_ORDER]: {
    titleTemplate: 'Đơn hàng tùy chỉnh',
    messageTemplate: '{senderName} đã gửi yêu cầu đơn hàng tùy chỉnh',
    icon: '🎨',
    color: 'purple',
  },
  [NotificationType.CUSTOM_ORDER_UPDATE]: {
    titleTemplate: 'Cập nhật đơn tùy chỉnh',
    messageTemplate: 'Đơn hàng tùy chỉnh của bạn đã được cập nhật',
    icon: '🔄',
    color: 'blue',
  },
  [NotificationType.MESSAGE]: {
    titleTemplate: 'Tin nhắn mới',
    messageTemplate: '{senderName} đã gửi tin nhắn cho bạn',
    icon: '✉️',
    color: 'blue',
  },
  [NotificationType.DISPUTE]: {
    titleTemplate: 'Tranh chấp đơn hàng',
    messageTemplate: 'Có cập nhật về tranh chấp đơn hàng #{orderNumber}',
    icon: '⚖️',
    color: 'red',
  },
  [NotificationType.RETURN]: {
    titleTemplate: 'Yêu cầu trả hàng',
    messageTemplate: 'Có cập nhật về yêu cầu trả hàng đơn #{orderNumber}',
    icon: '↩️',
    color: 'orange',
  },
  [NotificationType.PRICE_NEGOTIATION]: {
    titleTemplate: 'Thương lượng giá',
    messageTemplate: '{senderName} đã {action} thương lượng giá{price}',
    icon: '💰',
    color: 'yellow',
  },
  [NotificationType.SYSTEM]: {
    titleTemplate: 'Thông báo hệ thống',
    messageTemplate: '{message}',
    icon: '⚙️',
    color: 'gray',
  },
};

// Helper functions để extract thông tin từ data
const extractSenderName = (notification: Notification): string => {
  if (notification.sender) {
    return `${notification.sender.firstName} ${notification.sender.lastName}`;
  }
  return 'Hệ thống';
};

const extractOrderNumber = (notification: Notification): string => {
  return notification.data?.orderNumber || notification.data?.orderId || 'N/A';
};

const extractPrice = (notification: Notification): string => {
  const price = notification.data?.price || notification.data?.finalPrice;
  return price ? ` với giá ${price.toLocaleString('vi-VN')}đ` : '';
};

const translateOrderStatus = (status: string): string => {
  return ORDER_STATUS_MAPPING[status] || status;
};

const translatePaymentStatus = (status: string): string => {
  return PAYMENT_STATUS_MAPPING[status] || status;
};

const translateNegotiationAction = (action: string): string => {
  const actionMapping: Record<string, string> = {
    REQUEST: 'gửi yêu cầu',
    ACCEPT: 'chấp nhận',
    REJECT: 'từ chối',
    COUNTER: 'đưa ra giá đối ứng cho',
    COUNTER_OFFER: 'đưa ra giá đối ứng cho',
  };
  return actionMapping[action] || action.toLowerCase();
};

const translateQuoteStatus = (status: string): string => {
  return QUOTE_STATUS_MAPPING[status] || status;
};

// Main formatter function
export const formatNotificationDisplay = (
  notification: Notification,
): NotificationDisplay => {
  const template = NOTIFICATION_TEMPLATES[notification.type];

  if (!template) {
    return {
      title: notification.title,
      message: notification.message,
      icon: '🔔',
      color: 'gray',
    };
  }

  let title = template.titleTemplate;
  let message = template.messageTemplate;

  // Replace placeholders based on notification type
  switch (notification.type) {
    case NotificationType.LIKE:
    case NotificationType.COMMENT:
    case NotificationType.FOLLOW:
    case NotificationType.MENTION:
    case NotificationType.QUOTE_REQUEST:
    case NotificationType.CUSTOM_ORDER:
    case NotificationType.MESSAGE:
      message = message.replace(
        '{senderName}',
        extractSenderName(notification),
      );
      break;

    case NotificationType.ORDER_UPDATE:
      message = message
        .replace('{orderNumber}', extractOrderNumber(notification))
        .replace(
          '{status}',
          translateOrderStatus(notification.data?.status || ''),
        );
      break;

    case NotificationType.PAYMENT_SUCCESS:
      message = message.replace(
        '{orderNumber}',
        extractOrderNumber(notification),
      );
      break;

    case NotificationType.PAYMENT_FAILED: {
      const reason = notification.data?.reason
        ? `: ${notification.data.reason}`
        : '';
      message = message
        .replace('{orderNumber}', extractOrderNumber(notification))
        .replace('{reason}', reason);
      break;
    }

    case NotificationType.QUOTE_RESPONSE:
      message = message.replace(
        '{status}',
        translateQuoteStatus(notification.data?.status || ''),
      );
      break;

    case NotificationType.DISPUTE:
    case NotificationType.RETURN:
      message = message.replace(
        '{orderNumber}',
        extractOrderNumber(notification),
      );
      break;

    case NotificationType.PRICE_NEGOTIATION:
      message = message
        .replace('{senderName}', extractSenderName(notification))
        .replace(
          '{action}',
          translateNegotiationAction(notification.data?.action || ''),
        )
        .replace('{price}', extractPrice(notification));
      break;

    case NotificationType.SYSTEM:
      // For system notifications, use original message or data message
      message = notification.data?.message || notification.message;
      break;

    default:
      // Use original title and message for unknown types
      title = notification.title;
      message = notification.message;
      break;
  }

  return {
    title,
    message,
    icon: template.icon,
    color: template.color,
  };
};

// Helper function để get notification type display name
export const getNotificationTypeDisplayName = (
  type: NotificationType,
): string => {
  const typeNames: Record<NotificationType, string> = {
    [NotificationType.LIKE]: 'Lượt thích',
    [NotificationType.COMMENT]: 'Bình luận',
    [NotificationType.FOLLOW]: 'Theo dõi',
    [NotificationType.MENTION]: 'Nhắc đến',
    [NotificationType.ORDER_UPDATE]: 'Cập nhật đơn hàng',
    [NotificationType.PAYMENT_SUCCESS]: 'Thanh toán thành công',
    [NotificationType.PAYMENT_FAILED]: 'Thanh toán thất bại',
    [NotificationType.QUOTE_REQUEST]: 'Yêu cầu báo giá',
    [NotificationType.QUOTE_RESPONSE]: 'Phản hồi báo giá',
    [NotificationType.CUSTOM_ORDER]: 'Đơn hàng tùy chỉnh',
    [NotificationType.CUSTOM_ORDER_UPDATE]: 'Cập nhật đơn tùy chỉnh',
    [NotificationType.MESSAGE]: 'Tin nhắn',
    [NotificationType.DISPUTE]: 'Tranh chấp',
    [NotificationType.RETURN]: 'Trả hàng',
    [NotificationType.PRICE_NEGOTIATION]: 'Thương lượng giá',
    [NotificationType.SYSTEM]: 'Hệ thống',
  };

  return typeNames[type] || type;
};

// Helper function để format time relative
export const formatRelativeTime = (date: string | Date): string => {
  const notifDate = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - notifDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) {
    return 'Vừa xong';
  } else if (diffMins < 60) {
    return `${diffMins} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} tuần trước`;
  } else if (diffMonths < 12) {
    return `${diffMonths} tháng trước`;
  } else {
    return notifDate.toLocaleDateString('vi-VN');
  }
};
