import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth as useAuthContext } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { ROUTE_PATHS } from '../../constants/routes';
import {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../../types/auth';

export const useAuthForm = () => {
  const { login, register, clearError } = useAuthContext();
  const { success, error } = useToastContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (data: LoginRequest) => {
    try {
      await login(data.emailOrUsername, data.password, data.rememberMe);
      const from = location.state?.from?.pathname || ROUTE_PATHS.APP.ROOT;
      success('Đăng nhập thành công!');
      navigate(from, { replace: true });
    } catch (err: any) {
      error(err.message || 'Đăng nhập thất bại');
      throw err;
    }
  };

  const handleRegister = async (data: RegisterRequest) => {
    try {
      await register(data);
      success('Đăng ký thành công! Chào mừng bạn đến với Artisan Connect.');
      navigate(ROUTE_PATHS.APP.HOME);
    } catch (err: any) {
      error(err.message || 'Đăng ký thất bại');
      throw err;
    }
  };

  return {
    handleLogin,
    handleRegister,
    clearError,
  };
};

export const usePasswordReset = () => {
  const { success, error } = useToastContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (data: ForgotPasswordRequest) => {
    setIsLoading(true);
    try {
      const { authService } = await import('../../services/auth.service');
      await authService.forgotPassword(data);
      success(
        'Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư của bạn.',
      );
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi gửi email khôi phục');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordRequest) => {
    setIsLoading(true);
    try {
      const { authService } = await import('../../services/auth.service');
      await authService.resetPassword(data);
      success(
        'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.',
      );
      navigate(ROUTE_PATHS.AUTH.LOGIN);
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleForgotPassword,
    handleResetPassword,
    isLoading,
  };
};

export const useEmailVerification = () => {
  const { success, error } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);

  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    try {
      const { authService } = await import('../../services/auth.service');
      await authService.verifyEmail(token);
      success('Email đã được xác thực thành công!');
      return true;
    } catch (err: any) {
      error(err.message || 'Xác thực email thất bại');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    verifyEmail,
    isLoading,
  };
};
