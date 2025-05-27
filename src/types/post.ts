import { BaseEntity, SoftDeleteEntity, PaginationParams } from './common';
import { User } from './auth';

export enum PostType {
  STORY = 'STORY',
  TUTORIAL = 'TUTORIAL',
  PRODUCT_SHOWCASE = 'PRODUCT_SHOWCASE',
  BEHIND_THE_SCENES = 'BEHIND_THE_SCENES',
  EVENT = 'EVENT',
  GENERAL = 'GENERAL',
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export enum BlockType {
  PARAGRAPH = 'paragraph',
  HEADING = 'heading',
  IMAGE = 'image',
  GALLERY = 'gallery',
  VIDEO = 'video',
  QUOTE = 'quote',
  LIST = 'list',
  PRODUCT = 'product',
  DIVIDER = 'divider',
  HTML = 'html',
  EMBED = 'embed',
}

export interface ContentBlock {
  id: string;
  type: string;
  data: {
    text?: string;
    url?: string;
    caption?: string;
    author?: string;
    items?: string[];
    html?: string;
    embed?: string;
    images?: Array<{ url: string; caption?: string }>;
  };
  order: number;
}

export interface ProductMention {
  id: string;
  postId: string;
  productId: string;
  contextText?: string;
  position?: number;
  product: {
    id: string;
    name: string;
    slug?: string;
    images: string[];
    price: number;
    discountPrice?: number;
    status: string;
    avgRating?: number;
    reviewCount: number;
    seller: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      artisanProfile?: {
        shopName: string;
        isVerified: boolean;
      };
    };
  };
}

export interface Post extends SoftDeleteEntity {
  userId: string;
  title: string;
  slug?: string;
  summary?: string;
  content: ContentBlock[];
  contentText?: string;
  type: PostType;
  status: PostStatus;
  thumbnailUrl?: string;
  coverImage?: string;
  mediaUrls: string[];
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  publishedAt?: Date;
  user?: User;
  isLiked?: boolean;
  isSaved?: boolean;
  canEdit?: boolean;
  productMentions?: ProductMention[];
}

export interface PostAnalytics extends BaseEntity {
  postId: string;
  viewCount: number;
  uniqueViewers: number;
  avgReadTime?: number;
  conversionCount: number;
}

// DTOs
export interface CreatePostRequest {
  title: string;
  summary?: string;
  content: ContentBlock[];
  type: PostType;
  status?: PostStatus;
  thumbnailUrl?: string;
  coverImage?: string;
  mediaUrls?: string[];
  tags?: string[];
  publishNow?: boolean;
  productMentions?: Array<{
    productId: string;
    contextText?: string;
    position: number;
  }>;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {}

export interface GetPostsQuery extends PaginationParams {
  userId?: string;
  type?: PostType | PostType[];
  status?: PostStatus | PostStatus[];
  tags?: string[];
  search?: string;
  followedOnly?: boolean;
}

export interface PostPaginationResult {
  data: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
