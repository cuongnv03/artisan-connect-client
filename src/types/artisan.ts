import { BaseEntity, PaginationParams } from './common';
import { User } from './auth';

export interface ArtisanProfile extends BaseEntity {
  userId: string;
  shopName: string;
  shopDescription?: string | null;
  specialties: string[];
  experience?: number | null;
  website?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  socialMedia?: Record<string, string> | null;
  businessAddress?: string | null;
  businessHours?: Record<string, any> | null;
  shippingInfo?: Record<string, any> | null;
  returnPolicy?: string | null;
  shopLogoUrl?: string | null;
  shopBannerUrl?: string | null;
  isVerified: boolean;
  rating?: number | null;
  reviewCount: number;
  totalSales: number;
  followerCount?: number | null;
  user?: User;
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
  reviewedAt?: string;
  user?: User & { phone?: string }; // Add phone field
}

export enum UpgradeRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
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
  createdAt?: string;
  updatedAt?: string;
  adminNotes?: string;
  reviewedAt?: string;
}
