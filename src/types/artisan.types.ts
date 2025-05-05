import { User } from './api.types';

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
  templateId?: string;
  templateStyle?: string;
  customData?: Record<string, any>;
  isVerified: boolean;
  rating?: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface ArtisanProfileWithUser extends ArtisanProfile {
  user: User;
}

export interface CreateArtisanProfileDto {
  shopName: string;
  shopDescription?: string;
  specialties?: string[];
  experience?: number;
  website?: string;
  socialMedia?: Record<string, string>;
}

export interface UpdateArtisanProfileDto {
  shopName?: string;
  shopDescription?: string;
  shopLogoUrl?: string;
  shopBannerUrl?: string;
  specialties?: string[];
  experience?: number;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialMedia?: Record<string, string>;
  templateId?: string;
  templateStyle?: string;
  customData?: Record<string, any>;
}

export interface GenerateTemplateDto {
  style: string;
  preferences: {
    colorScheme?: string;
    layout?: string;
    emphasis?: string;
  };
  description: string;
}

export interface TemplateResult {
  templateId: string;
  templateStyle: string;
  customData: Record<string, any>;
  preview: string;
}

export interface ArtisanUpgradeRequestDto {
  shopName: string;
  shopDescription?: string;
  specialties?: string[];
  experience?: number;
  website?: string;
  socialMedia?: Record<string, string>;
  reason?: string;
}

export interface UpgradeRequest {
  id: string;
  userId: string;
  shopName: string;
  shopDescription?: string;
  specialties: string[];
  experience?: number;
  website?: string;
  socialMedia?: Record<string, string>;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpgradeRequestWithUser extends UpgradeRequest {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
}
