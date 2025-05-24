// Common types
export * from './common';
export * from './api';

// Feature specific types
export * from './auth';
export * from './user';
export * from './artisan';
export * from './post';
export * from './product';
export * from './order';
export * from './social';
export * from './message';
export * from './notification';

// Re-export commonly used types with aliases for convenience
export type { User, UserRole, UserStatus } from './auth';

export type { Post, PostType, PostStatus, ContentBlock } from './post';

export type { Product, ProductStatus, Category } from './product';

export type { Order, OrderStatus, OrderItem, CartItem } from './order';

export type { ArtisanProfile, UpgradeRequestStatus } from './artisan';
