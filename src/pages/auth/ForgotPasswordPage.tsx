import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useToastContext } from '../../contexts/ToastContext';
import { useForm } from '../../hooks/useForm';
import { authService } from '../../services/auth.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ForgotPasswordRequest } from '../../types/auth';

export const ForgotPasswordPage: React.FC = () => {
  const { success, error } = useToastContext();

  const validateForm = (values: ForgotPasswordRequest) => {
    const errors: Record<string, string> = {};

    if (!values.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email không hợp lệ';
    }

    return errors;
  };

  const handleSubmit = async (values: ForgotPasswordRequest) => {
    try {
      await authService.forgotPassword(values);
      success(
        'Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư của bạn.',
      );
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi gửi email khôi phục');
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
  } = useForm<ForgotPasswordRequest>({
    initialValues: {
      email: '',
    },
    validate: validateForm,
    onSubmit: handleSubmit,
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h2>
        <p className="mt-2 text-sm text-gray-600">
          Nhập email của bạn để nhận liên kết khôi phục mật khẩu
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email ? errors.email : ''}
          placeholder="Nhập địa chỉ email"
          leftIcon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
        />

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          className="justify-center"
        >
          Gửi email khôi phục
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="flex items-center justify-center text-sm text-accent hover:text-accent-dark"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};
