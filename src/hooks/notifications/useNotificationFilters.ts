import { NotificationType } from '../../types/notification';
import { getNotificationTypeDisplayName } from '../../utils/notificationFormatter';

export const useNotificationFilters = () => {
  const typeOptions = [
    { label: 'Tất cả loại', value: '' },
    {
      label: getNotificationTypeDisplayName(NotificationType.LIKE),
      value: NotificationType.LIKE,
    },
    {
      label: getNotificationTypeDisplayName(NotificationType.COMMENT),
      value: NotificationType.COMMENT,
    },
    {
      label: getNotificationTypeDisplayName(NotificationType.FOLLOW),
      value: NotificationType.FOLLOW,
    },
    {
      label: getNotificationTypeDisplayName(NotificationType.ORDER_UPDATE),
      value: NotificationType.ORDER_UPDATE,
    },
    {
      label: getNotificationTypeDisplayName(NotificationType.PAYMENT_SUCCESS),
      value: NotificationType.PAYMENT_SUCCESS,
    },
    {
      label: getNotificationTypeDisplayName(NotificationType.PAYMENT_FAILED),
      value: NotificationType.PAYMENT_FAILED,
    },
    {
      label: getNotificationTypeDisplayName(NotificationType.MESSAGE),
      value: NotificationType.MESSAGE,
    },
    {
      label: getNotificationTypeDisplayName(NotificationType.PRICE_NEGOTIATION),
      value: NotificationType.PRICE_NEGOTIATION,
    },
    {
      label: getNotificationTypeDisplayName(NotificationType.CUSTOM_ORDER),
      value: NotificationType.CUSTOM_ORDER,
    },
    {
      label: getNotificationTypeDisplayName(NotificationType.QUOTE_REQUEST),
      value: NotificationType.QUOTE_REQUEST,
    },
    {
      label: getNotificationTypeDisplayName(NotificationType.QUOTE_RESPONSE),
      value: NotificationType.QUOTE_RESPONSE,
    },
    {
      label: getNotificationTypeDisplayName(NotificationType.DISPUTE),
      value: NotificationType.DISPUTE,
    },
    {
      label: getNotificationTypeDisplayName(NotificationType.RETURN),
      value: NotificationType.RETURN,
    },
    {
      label: getNotificationTypeDisplayName(NotificationType.SYSTEM),
      value: NotificationType.SYSTEM,
    },
  ];

  const statusOptions = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Chưa đọc', value: 'false' },
    { label: 'Đã đọc', value: 'true' },
  ];

  return {
    typeOptions,
    statusOptions,
  };
};
