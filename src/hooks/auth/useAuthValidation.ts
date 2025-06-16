import { useMemo } from 'react';
import { validationRules, createValidator } from '../../utils/validation';
import {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../../types/auth';

export const useAuthValidation = () => {
  const validateLoginForm = useMemo(() => {
    return (values: LoginRequest) => {
      const errors: Record<string, string> = {};

      if (!values.emailOrUsername.trim()) {
        errors.emailOrUsername = 'Email hoặc tên đăng nhập là bắt buộc';
      }

      if (!values.password) {
        errors.password = 'Mật khẩu là bắt buộc';
      } else if (values.password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      return errors;
    };
  }, []);

  const validateRegisterForm = useMemo(() => {
    return (
      values: RegisterRequest & {
        confirmPassword: string;
        agreeToTerms: boolean;
      },
    ) => {
      const errors: Record<string, string> = {};

      if (!values.firstName.trim()) {
        errors.firstName = 'Họ là bắt buộc';
      }

      if (!values.lastName.trim()) {
        errors.lastName = 'Tên là bắt buộc';
      }

      if (!values.email.trim()) {
        errors.email = 'Email là bắt buộc';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email không hợp lệ';
      }

      if (values.username && values.username.trim()) {
        if (values.username.length < 3) {
          errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
        } else if (!/^[a-zA-Z0-9_]+$/.test(values.username)) {
          errors.username =
            'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
        }
      }

      if (!values.password) {
        errors.password = 'Mật khẩu là bắt buộc';
      } else if (values.password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      if (!values.confirmPassword) {
        errors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }

      if (!values.agreeToTerms) {
        errors.agreeToTerms = 'Bạn cần đồng ý với điều khoản sử dụng';
      }

      return errors;
    };
  }, []);

  const validateForgotPasswordForm = useMemo(() => {
    return (values: ForgotPasswordRequest) => {
      const errors: Record<string, string> = {};

      if (!values.email.trim()) {
        errors.email = 'Email là bắt buộc';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email không hợp lệ';
      }

      return errors;
    };
  }, []);

  const validateResetPasswordForm = useMemo(() => {
    return (values: { newPassword: string; confirmPassword: string }) => {
      const errors: Record<string, string> = {};

      if (!values.newPassword) {
        errors.newPassword = 'Mật khẩu mới là bắt buộc';
      } else if (values.newPassword.length < 6) {
        errors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      if (!values.confirmPassword) {
        errors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
      } else if (values.newPassword !== values.confirmPassword) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }

      return errors;
    };
  }, []);

  return {
    validateLoginForm,
    validateRegisterForm,
    validateForgotPasswordForm,
    validateResetPasswordForm,
  };
};
