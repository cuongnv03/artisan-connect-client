import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useForm } from '../../hooks/useForm';
import { useAuthForm } from '../../hooks/useAuth';
import { useAuthValidation } from '../../hooks/useAuthValidation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ROUTE_PATHS } from '../../constants/routes';
import { LoginRequest } from '../../types/auth';

interface LoginFormData extends LoginRequest {
  rememberMe: boolean;
}

export const LoginForm: React.FC = () => {
  const { handleLogin } = useAuthForm();
  const { validateLoginForm } = useAuthValidation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm<LoginFormData>({
    initialValues: {
      emailOrUsername: '',
      password: '',
      rememberMe: false,
    },
    validate: validateLoginForm,
    onSubmit: handleLogin,
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
        <p className="mt-2 text-sm text-gray-600">
          Chào mừng bạn quay trở lại với Artisan Connect
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email hoặc tên đăng nhập"
          name="emailOrUsername"
          type="text"
          autoComplete="username"
          required
          value={values.emailOrUsername}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.emailOrUsername ? errors.emailOrUsername : ''}
          placeholder="Nhập email hoặc tên đăng nhập"
        />

        <Input
          label="Mật khẩu"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          required
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password ? errors.password : ''}
          placeholder="Nhập mật khẩu"
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

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={values.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-gray-900"
            >
              Ghi nhớ đăng nhập
            </label>
          </div>

          <Link
            to={ROUTE_PATHS.AUTH.FORGOT_PASSWORD}
            className="text-sm text-primary hover:text-primary-dark"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          className="justify-center"
        >
          Đăng nhập
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Hoặc</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link
              to={ROUTE_PATHS.AUTH.REGISTER}
              className="font-medium text-primary hover:text-primary-dark"
            >
              Đăng ký ngay
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};
