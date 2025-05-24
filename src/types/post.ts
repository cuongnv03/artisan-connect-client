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
  PARAGRAPH = 'PARAGRAPH',
  HEADING = 'HEADING',
  IMAGE = 'IMAGE',
  GALLERY = 'GALLERY',
  QUOTE = 'QUOTE',
  LIST = 'LIST',
  DIVIDER = 'DIVIDER',
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  content?: string;
  metadata?: Record<string, any>;
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
  thumbnailUrl?: string;
  coverImage?: string;
  mediaUrls?: string[];
  tags?: string[];
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {}

export interface GetPostsQuery extends PaginationParams {
  userId?: string;
  type?: PostType;
  status?: string;
  tags?: string[];
}
