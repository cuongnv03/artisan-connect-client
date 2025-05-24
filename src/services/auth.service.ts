import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '../types/auth';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data,
    );
  },

  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  async verifyEmail(token: string): Promise<void> {
    await apiClient.get(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}/${token}`);
  },

  async sendVerificationEmail(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.SEND_VERIFICATION_EMAIL);
  },

  async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      {
        refreshToken,
      },
    );
  },
};
