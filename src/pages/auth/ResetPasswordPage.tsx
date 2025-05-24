import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useToastContext } from '../../contexts/ToastContext';
import { useForm } from '../../hooks/useForm';
import { authService } from '../../services/auth.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (values: ResetPasswordFormData) => {
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

  const handleSubmit = async (values: ResetPasswordFormData) => {
    if (!token) {
      error('Token không hợp lệ');
      return;
    }

    try {
      await authService.resetPassword({
        token,
        newPassword: values.newPassword,
      });
      success(
        'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.',
      );
      navigate('/auth/login');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
    }
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit: onSubmit,
  } = useForm<ResetPasswordFormData>({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validate: validateForm,
    onSubmit: handleSubmit,
  });

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Token không hợp lệ
        </h2>
        <p className="text-gray-600">
          Liên kết khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Đặt lại mật khẩu</h2>
        <p className="mt-2 text-sm text-gray-600">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Input
          label="Mật khẩu mới"
          name="newPassword"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={values.newPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.newPassword ? errors.newPassword : ''}
          placeholder="Nhập mật khẩu mới"
          helperText="Ít nhất 6 ký tự"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          }
        />

        <Input
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.confirmPassword ? errors.confirmPassword : ''}
          placeholder="Nhập lại mật khẩu mới"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          }
        />

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          className="justify-center"
        >
          Đặt lại mật khẩu
        </Button>
      </form>
    </div>
  );
};
