import api from './api';
import {
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
} from '../types/comment.types';

export const CommentService = {
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data.data;
  },

  createComment: async (
    postId: string,
    data: CreateCommentDto,
  ): Promise<Comment> => {
    const response = await api.post(`/posts/${postId}/comments`, data);
    return response.data.data;
  },

  updateComment: async (
    commentId: string,
    data: UpdateCommentDto,
  ): Promise<Comment> => {
    const response = await api.patch(`/comments/${commentId}`, data);
    return response.data.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },

  likeComment: async (commentId: string): Promise<void> => {
    await api.post(`/social/like`, { commentId });
  },

  unlikeComment: async (commentId: string): Promise<void> => {
    await api.delete(`/social/like`, { data: { commentId } });
  },
};
