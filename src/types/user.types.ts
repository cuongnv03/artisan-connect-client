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
  lastSeenAt?: Date;
  followerCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
  isFollowing?: boolean;
}

export interface ArtisanProfile {
  id: string;
  userId: string;
  shopName: string;
  shopDescription?: string;
  shopLogoUrl?: string;
  shopBannerUrl?: string;
  specialties: string[];
  experience?: number;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialMedia?: Record<string, string>;
  isVerified: boolean;
  rating?: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithArtisanProfile extends User {
  artisanProfile?: ArtisanProfile;
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
