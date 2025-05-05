import api from './api';

export const MediaService = {
  uploadMedia: async (
    file: File,
    folder: string = 'uploads',
  ): Promise<string> => {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    // Set content type to multipart/form-data
    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data.url;
  },

  deleteMedia: async (url: string): Promise<void> => {
    await api.post('/media/delete', { url });
  },
};
