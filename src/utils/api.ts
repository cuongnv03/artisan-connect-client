import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, API_PREFIX } from '../constants/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}${API_PREFIX}`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // console.log('API Response:', response); // Debug log

        // Server trả về format: { success: true, data: T, message: string }
        if (
          response.data &&
          response.data.success &&
          response.data.data !== undefined
        ) {
          return response.data.data;
        }

        // Fallback nếu server không trả về theo format chuẩn
        return response.data;
      },
      async (error: AxiosError) => {
        // console.log('API Error:', error); // Debug log
        // console.log('Error Response:', error.response); // Debug log

        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              this.handleAuthError();
              return Promise.reject(error);
            }

            const response = await axios.post(
              `${API_BASE_URL}${API_PREFIX}/auth/refresh-token`,
              { refreshToken },
              {
                withCredentials: true,
              },
            );

            const newTokenData = response.data.success
              ? response.data.data
              : response.data;

            const { accessToken, user } = newTokenData;
            localStorage.setItem('accessToken', accessToken);

            if (user) {
              localStorage.setItem('user', JSON.stringify(user));
            }

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        // Extract error message from server response
        let errorMessage = 'Có lỗi xảy ra';
        if (error.response?.data) {
          const errorData = error.response.data as any;
          // Handle validation errors specifically
          if (error.response.status === 422 && errorData.message) {
            errorMessage = errorData.message;
          } else {
            errorMessage = errorData.message || errorData.error || errorMessage;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        const customError = new Error(errorMessage);
        (customError as any).status = error.response?.status;
        (customError as any).response = error.response;
        throw customError;
      },
    );
  }

  private handleAuthError() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/auth/login';
  }

  async get<T>(url: string, params?: any): Promise<T> {
    return await this.client.get(url, { params });
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return await this.client.post(url, data);
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return await this.client.put(url, data);
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    return await this.client.patch(url, data);
  }

  async delete<T>(url: string): Promise<T> {
    return await this.client.delete(url);
  }

  async upload<T>(url: string, formData: FormData): Promise<T> {
    return await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const apiClient = new ApiClient();
