import { User } from './user.types';

export interface Profile {
  id: string;
  userId: string;
  coverUrl?: string;
  location?: string;
  website?: string;
  dateOfBirth?: Date;
  gender?: string;
  socialLinks?: Record<string, string>;
  preferences?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface UpdateProfileRequest {
  coverUrl?: string;
  location?: string;
  website?: string;
  dateOfBirth?: Date | string;
  gender?: string;
  socialLinks?: Record<string, string>;
  preferences?: Record<string, any>;
}

// Address types
export interface Address {
  id: string;
  profileId: string;
  fullName: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
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

export interface UpdateAddressRequest {
  fullName?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
}
