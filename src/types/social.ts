import { BaseEntity, SoftDeleteEntity } from './common';
import { User } from './auth';
import { Post } from './post';

export interface Comment extends SoftDeleteEntity {
  postId: string;
  userId: string;
  parentId?: string;
  content: string;
  mediaUrl?: string;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  post?: Post;
  user: User;
  parent?: Comment;
  replies?: Comment[];
  isLiked?: boolean;
}

export interface Like extends BaseEntity {
  userId: string;
  postId?: string;
  commentId?: string;
  reaction: string;
  user?: User;
  post?: Post;
  comment?: Comment;
}

export interface SavedPost extends BaseEntity {
  userId: string;
  postId: string;
  user?: User;
  post: Post;
}

// DTOs
export interface CreateCommentRequest {
  postId: string;
  parentId?: string;
  content: string;
  mediaUrl?: string;
}

export interface UpdateCommentRequest {
  content: string;
  mediaUrl?: string;
}

export interface LikeToggleRequest {
  postId?: string;
  commentId?: string;
  reaction?: string;
}
