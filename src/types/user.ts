import { BaseEntity } from './common';
import { User } from './auth';

export interface Profile extends BaseEntity {
  userId: string;
  coverUrl?: string;
  location?: string;
  website?: string;
  dateOfBirth?: Date;
  gender?: string;
  socialLinks?: Record<string, string>;
  preferences?: Record<string, any>;
}

export interface Address extends BaseEntity {
  profileId: string;
  fullName: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Follow extends BaseEntity {
  followerId: string;
  followingId: string;
  status: string;
  notifyNewPosts: boolean;
  follower?: User;
  following?: User;
}

export interface UserActivity extends BaseEntity {
  userId: string;
  activityType: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  user?: User;
}

// DTOs
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
}

export interface UpdateUserProfileRequest {
  coverUrl?: string;
  location?: string;
  website?: string;
  dateOfBirth?: Date;
  gender?: string;
  socialLinks?: Record<string, string>;
}

export interface CreateAddressRequest {
  fullName: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}
