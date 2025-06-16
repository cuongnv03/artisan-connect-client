// API types
export * from './api';

// Common types
export * from './common';

// Auth types
export * from './auth';

// User types
export * from './user';

// Artisan types
export * from './artisan';

// Product types
export * from './product';

// Post types
export * from './post';

// Social types
export * from './social';

// Cart types
export * from './cart';

// Order types
export * from './order';

// Custom order types
export * from './custom-order';

// Price negotiation types
export * from './price-negotiation';

// Message types
export * from './message';

// Notification types
export * from './notification';

// Theme types
export * from './theme';

// Analytics types
export * from './analytics';

// Quote types (deprecated - for backward compatibility)
export * from './quote';

// ===== COMMONLY USED TYPE ALIASES =====
export type { ApiError, ApiSuccess, FileUpload } from './api';
export type { User, UserRole, UserStatus } from './auth';
export type { Post, PostType, PostStatus, ContentBlock } from './post';
export type { Product, ProductStatus, Category } from './product';
export type { Order, OrderStatus } from './order';
export type { ArtisanProfile, UpgradeRequestStatus } from './artisan';
export type { Message, MessageType, Conversation } from './message';
export type { Notification, NotificationType } from './notification';
export type { Comment, Like, WishlistItemType } from './social';
export type { CartItem, CartSummary, CartValidation } from './cart';
export type {
  OrderWithDetails,
  OrderSummary,
  OrderItemWithDetails,
  OrderDispute,
  OrderReturn,
  DisputeType,
  DisputeStatus,
  ReturnReason,
  ReturnStatus,
} from './order';
export type {
  CustomOrderRequest,
  CustomOrderWithDetails,
  QuoteStatus,
} from './custom-order';
export type {
  PriceNegotiation,
  PriceNegotiationWithDetails,
  NegotiationStatus,
} from './price-negotiation';
export type {
  UserAnalytics,
  ArtisanBusinessAnalytics,
  PlatformAnalytics,
} from './analytics';
