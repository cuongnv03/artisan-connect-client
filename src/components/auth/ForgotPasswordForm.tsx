import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useForm } from '../../hooks/useForm';
import { usePasswordReset } from '../../hooks/useAuth';
import { useAuthValidation } from '../../hooks/useAuthValidation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ROUTE_PATHS } from '../../constants/routes';
import { ForgotPasswordRequest } from '../../types/auth';

export const ForgotPasswordForm: React.FC = () => {
  const { handleForgotPassword, isLoading } = usePasswordReset();
  const { validateForgotPasswordForm } = useAuthValidation();

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useForm<ForgotPasswordRequest>({
      initialValues: {
        email: '',
      },
      validate: validateForgotPasswordForm,
      onSubmit: handleForgotPassword,
    });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h2>
        <p className="mt-2 text-sm text-gray-600">
          Nhập email của bạn để nhận liên kết khôi phục mật khẩu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          loading={isLoading}
          className="justify-center"
        >
          Gửi email khôi phục
        </Button>
      </form>

      <div className="text-center">
        <Link
          to={ROUTE_PATHS.AUTH.LOGIN}
          className="flex items-center justify-center text-sm text-primary hover:text-primary-dark"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};
