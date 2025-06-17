import { BaseEntity, PaginationParams } from './common';
import { User } from './auth';

export interface ArtisanUpgradeRequest extends BaseEntity {
  userId: string;
  shopName: string;
  shopDescription?: string;
  specialties: string[];
  experience?: number;
  website?: string;
  socialMedia?: Record<string, string>;
  reason?: string;
  images: string[];
  certificates: string[];
  identityProof?: string;
  status: UpgradeRequestStatus;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  user?: User & { phone?: string }; // Add phone field
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
  images: string[];
  certificates: string[];
  identityProof?: string;
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
  businessAddress?: string;
  businessHours?: Record<string, any>;
  shippingInfo?: Record<string, any>;
  returnPolicy?: string;
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
  images?: string[];
  certificates?: string[];
  identityProof?: string;
}

export interface SearchArtisansQuery extends PaginationParams {
  q?: string;
  specialty?: string;
  verified?: boolean;
}

export interface SuggestedArtisansQuery extends PaginationParams {
  excludeFollowed?: boolean; // Loại trừ những artisan đã follow
  baseOnInterests?: boolean; // Dựa trên sở thích của user
  baseOnActivity?: boolean; // Dựa trên hoạt động gần đây
  specialties?: string[]; // Lọc theo specialty
  verified?: boolean; // Chỉ lấy artisan đã verified
}

export interface UpgradeRequestStatusResponse {
  hasRequest: boolean;
  status?: UpgradeRequestStatus;
  createdAt?: Date;
  updatedAt?: Date;
  adminNotes?: string;
  reviewedAt?: Date;
}
