import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, API_PREFIX } from '../constants/api';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

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

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
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
        if (
          response.data &&
          response.data.success &&
          response.data.data !== undefined
        ) {
          return response.data.data;
        }
        return response.data;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If we're already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              this.processQueue(error, null);
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

            this.processQueue(null, accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.handleAuthError();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Extract error message from server response
        let errorMessage = 'Có lỗi xảy ra';
        if (error.response?.data) {
          const errorData = error.response.data as any;
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

    // Only redirect if not already on login page
    if (!window.location.pathname.includes('/auth/login')) {
      window.location.href = '/auth/login';
    }
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
