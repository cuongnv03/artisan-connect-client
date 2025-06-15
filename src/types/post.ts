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
  type: BlockType; // Sử dụng enum thay vì string
  data: any; // Server lưu dưới dạng any object
  order: number;
}

export interface PostProductMention {
  id: string;
  postId: string;
  productId: string;
  contextText?: string | null;
  position?: number | null;
  product: {
    id: string;
    name: string;
    slug?: string | null;
    images: string[];
    price: number;
    discountPrice?: number | null;
    status: string;
    avgRating?: number | null;
    reviewCount: number;
    seller: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
      artisanProfile?: {
        shopName: string;
        isVerified: boolean;
      } | null;
    };
  };
}

export interface Post extends SoftDeleteEntity {
  userId: string;
  title: string;
  slug?: string | null;
  summary?: string | null;
  content: ContentBlock[]; // JSON array of content blocks
  contentText?: string | null; // Extracted text for search
  type: PostType;
  status: PostStatus;
  thumbnailUrl?: string | null;
  coverImage?: string | null;
  mediaUrls: string[]; // Extracted from content blocks
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  publishedAt?: Date | null;

  // Relations (optional, populated by server)
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    artisanProfile?: {
      shopName: string;
      isVerified: boolean;
    } | null;
  };
  productMentions?: PostProductMention[];
  isLiked?: boolean; // For authenticated users
  isSaved?: boolean; // For authenticated users
  canEdit?: boolean; // For authenticated users
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
  tags?: string[];
  publishNow?: boolean;
  productMentions?: Array<{
    productId: string;
    contextText?: string;
    position?: number;
  }>;
}

export interface UpdatePostRequest {
  title?: string;
  summary?: string;
  content?: ContentBlock[];
  type?: PostType;
  status?: PostStatus;
  thumbnailUrl?: string;
  coverImage?: string;
  tags?: string[];
  productMentions?: Array<{
    productId: string;
    contextText?: string;
    position?: number;
  }>;
}

export interface GetPostsQuery extends PaginationParams {
  userId?: string;
  type?: PostType | PostType[];
  status?: PostStatus | PostStatus[];
  tags?: string | string[]; // Support both single and array
  search?: string;
  followedOnly?: boolean;
  sortBy?:
    | 'createdAt'
    | 'publishedAt'
    | 'viewCount'
    | 'likeCount'
    | 'commentCount';
  sortOrder?: 'asc' | 'desc';
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
