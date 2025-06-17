import { BaseEntity } from './common';
import { User } from './auth';

export interface Profile extends BaseEntity {
  userId: string;
  coverUrl?: string | null;
  location?: string | null;
  website?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  socialLinks?: Record<string, string> | null;
  preferences?: Record<string, any> | null;
}

export interface Address extends BaseEntity {
  profileId: string;
  fullName: string;
  phone?: string | null;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserProfileDto {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  bio?: string | null;
  avatarUrl?: string | null;
  isVerified: boolean;
  emailVerified: boolean;
  phone?: string | null;
  followerCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    id: string;
    coverUrl?: string | null;
    location?: string | null;
    website?: string | null;
    dateOfBirth?: Date | null;
    gender?: string | null;
    socialLinks?: Record<string, string> | null;
    preferences?: Record<string, any> | null;
  } | null;
  artisanProfile?: {
    id: string;
    shopName: string;
    shopDescription?: string | null;
    isVerified: boolean;
    rating?: number | null;
    reviewCount: number;
  } | null;
}

// DTOs for API
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateUserProfileRequest {
  coverUrl?: string | null;
  location?: string | null;
  website?: string | null;
  dateOfBirth?: Date | string | null;
  gender?: string | null;
  socialLinks?: Record<string, string> | null;
  preferences?: Record<string, any> | null;
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

// Alias for consistency
export type UpdateUserDto = UpdateProfileRequest;
export type UpdateProfileDto = UpdateUserProfileRequest;
