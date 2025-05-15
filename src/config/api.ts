import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  API_URL,
  API_TIMEOUT,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '../constants';

/**
 * API client configuration
 */
export const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Request interceptor to add auth token
   */
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  /**
   * Response interceptor to handle token refresh
   */
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 errors with token refresh
      if (
        error.response &&
        error.response.status === 401 &&
        error.response.data.error === 'TOKEN_EXPIRED' &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
          if (!refreshToken) {
            // No refresh token available, redirect to login
            handleAuthError();
            return Promise.reject(error);
          }

          // Attempt to refresh token
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

          // Update the Authorization header with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return client(originalRequest);
        } catch (refreshError) {
          // Token refresh failed
          handleAuthError();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
};

/**
 * Handle authentication errors
 */
const handleAuthError = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.location.href = '/login?session_expired=true';
};
