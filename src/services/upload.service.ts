import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { UploadResponse } from '../types/common';

export interface UploadOptions {
  folder?: string;
  quality?: number;
  width?: number;
  height?: number;
  format?: 'auto' | 'jpg' | 'png' | 'webp';
}

export const uploadService = {
  async uploadImage(
    file: File,
    options: UploadOptions = {},
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    if (options.folder) formData.append('folder', options.folder);
    if (options.quality) formData.append('quality', options.quality.toString());
    if (options.width) formData.append('width', options.width.toString());
    if (options.height) formData.append('height', options.height.toString());
    if (options.format) formData.append('format', options.format);

    return await apiClient.upload<UploadResponse>(
      API_ENDPOINTS.UPLOAD.IMAGE,
      formData,
    );
  },

  async uploadVideo(
    file: File,
    options: UploadOptions = {},
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    if (options.folder) formData.append('folder', options.folder);

    return await apiClient.upload<UploadResponse>(
      API_ENDPOINTS.UPLOAD.VIDEO,
      formData,
    );
  },

  async uploadMultiple(
    files: File[],
    options: UploadOptions = {},
  ): Promise<UploadResponse[]> {
    const promises = files.map((file) => this.uploadImage(file, options));
    return await Promise.all(promises);
  },

  // Helper methods
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB (match server limit)
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)',
      };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File không được vượt quá 10MB' };
    }

    return { valid: true };
  },

  validateVideoFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB (match server limit)
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Chỉ chấp nhận file video (MP4, WebM, MOV)',
      };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File video không được vượt quá 10MB' };
    }

    return { valid: true };
  },

  generateThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = 300;
        canvas.height = 200;

        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          reject(new Error('Cannot get canvas context'));
        }
      };

      img.onerror = () => reject(new Error('Cannot load image'));
      img.src = URL.createObjectURL(file);
    });
  },
};
