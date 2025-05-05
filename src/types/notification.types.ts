export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  MENTION = 'MENTION',
  QUOTE_REQUEST = 'QUOTE_REQUEST',
  QUOTE_RESPONSE = 'QUOTE_RESPONSE',
  ORDER_STATUS = 'ORDER_STATUS',
  MESSAGE = 'MESSAGE',
  REVIEW = 'REVIEW',
  SYSTEM = 'SYSTEM',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  isRead: boolean;
  data?: any;
  relatedUserId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  readAt?: Date;
  createdAt: Date;
  relatedUser?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export interface NotificationQueryOptions {
  isRead?: boolean;
  types?: NotificationType[];
  page?: number;
  limit?: number;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  type: NotificationType;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
