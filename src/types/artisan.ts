import { BaseEntity, PaginationParams } from './common';
import { User } from './auth';

export interface ArtisanProfile extends BaseEntity {
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
  totalSales: number;
  user?: User;
}

export enum UpgradeRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ArtisanUpgradeRequest extends BaseEntity {
  userId: string;
  shopName: string;
  shopDescription?: string;
  specialties: string[];
  experience?: number;
  website?: string;
  socialMedia?: Record<string, string>;
  reason?: string;
  status: UpgradeRequestStatus;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  user?: User;
}

// DTOs
export interface CreateArtisanProfileRequest {
  shopName: string;
  shopDescription?: string;
  specialties: string[];
  experience?: number;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialMedia?: Record<string, string>;
}

export interface UpdateArtisanProfileRequest
  extends Partial<CreateArtisanProfileRequest> {
  shopLogoUrl?: string;
  shopBannerUrl?: string;
}

export interface UpgradeRequestData {
  shopName: string;
  shopDescription?: string;
  specialties: string[];
  experience?: number;
  website?: string;
  socialMedia?: Record<string, string>;
  reason?: string;
}

export interface SearchArtisansQuery extends PaginationParams {
  q?: string;
  specialty?: string;
  verified?: boolean;
}

// Response wrapper cho upgrade request status
export interface UpgradeRequestStatusResponse {
  hasRequest: boolean;
  status?: UpgradeRequestStatus;
  createdAt?: Date;
  updatedAt?: Date;
  adminNotes?: string;
  reviewedAt?: Date;
}
