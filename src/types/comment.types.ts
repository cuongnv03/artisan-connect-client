export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentId?: string | null;
  content: string;
  mediaUrl?: string | null;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  liked?: boolean;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
}

export interface CreateCommentDto {
  content: string;
  parentId?: string;
  mediaUrl?: string;
}

export interface UpdateCommentDto {
  content: string;
  mediaUrl?: string;
}
