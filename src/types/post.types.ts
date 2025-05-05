export enum PostType {
  STORY = 'STORY',
  TUTORIAL = 'TUTORIAL',
  PRODUCT_SHOWCASE = 'PRODUCT_SHOWCASE',
  BEHIND_THE_SCENES = 'BEHIND_THE_SCENES',
  EVENT = 'EVENT',
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
  type: BlockType;
  data: any;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  slug?: string | null;
  summary?: string | null;
  content: ContentBlock[];
  contentText?: string | null;
  type: PostType;
  status: PostStatus;
  thumbnailUrl?: string | null;
  coverImage?: string | null;
  mediaUrls: string[];
  templateId?: string | null;
  templateData?: any;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface ProductMention {
  productId: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  thumbnailUrl?: string | null;
}

export interface PostWithUser extends Post {
  user: {
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
  productMentions?: ProductMention[];
  liked?: boolean;
  saved?: boolean;
}

export interface PostQueryOptions {
  userId?: string;
  type?: PostType | PostType[];
  status?: PostStatus | PostStatus[];
  tag?: string;
  search?: string;
  sortBy?:
    | 'createdAt'
    | 'publishedAt'
    | 'viewCount'
    | 'likeCount'
    | 'commentCount';
  sortOrder?: 'asc' | 'desc';
  includeLikeStatus?: boolean;
  includeSaveStatus?: boolean;
  followedOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface PostPaginationResult {
  data: PostWithUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
