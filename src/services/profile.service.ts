import api from './api';
import { Profile, UpdateProfileRequest } from '../types/api.types';

export const ProfileService = {
  getProfile: async (): Promise<Profile> => {
    const response = await api.get('/profiles/me');
    return response.data.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<Profile> => {
    const response = await api.patch('/profiles/me', data);
    return response.data.data;
  },

  getUserProfile: async (userId: string): Promise<Profile> => {
    const response = await api.get(`/profiles/users/${userId}`);
    return response.data.data;
  },
};
