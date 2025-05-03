// Auth types
export interface LoginRequest {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  username?: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  bio?: string;
  avatarUrl?: string;
  isVerified: boolean;
  emailVerified: boolean;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  ARTISAN = 'ARTISAN',
  CUSTOMER = 'CUSTOMER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

// Profile types
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

// API Response structure
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
