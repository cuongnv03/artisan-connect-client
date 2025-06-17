import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useForm } from '../../hooks/common/useForm';
import { useAuthForm } from '../../hooks/auth/useAuth';
import { useAuthValidation } from '../../hooks/auth/useAuthValidation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ROUTE_PATHS } from '../../constants/routes';
import { RegisterRequest } from '../../types/auth';

interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
  agreeToTerms: boolean;
}

export const RegisterForm: React.FC = () => {
  const { handleRegister } = useAuthForm();
  const { validateRegisterForm } = useAuthValidation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm<RegisterFormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
    validate: validateRegisterForm,
    onSubmit: async (data) => {
      const { confirmPassword, agreeToTerms, ...registerData } = data;
      await handleRegister(registerData);
    },
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Đăng ký</h2>
        <p className="mt-2 text-sm text-gray-600">
          Tạo tài khoản để tham gia cộng đồng Artisan Connect
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Họ"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.firstName ? errors.firstName : ''}
            placeholder="Nhập họ"
          />

          <Input
            label="Tên"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.lastName ? errors.lastName : ''}
            placeholder="Nhập tên"
          />
        </div>

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
        />

        <Input
          label="Tên đăng nhập"
          name="username"
          type="text"
          autoComplete="username"
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.username ? errors.username : ''}
          placeholder="Nhập tên đăng nhập (tùy chọn)"
          helperText="Chỉ được chứa chữ cái, số và dấu gạch dưới"
        />

        <Input
          label="Mật khẩu"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password ? errors.password : ''}
          placeholder="Nhập mật khẩu"
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
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.confirmPassword ? errors.confirmPassword : ''}
          placeholder="Nhập lại mật khẩu"
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

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={values.agreeToTerms}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agreeToTerms" className="text-gray-700">
              Tôi đồng ý với{' '}
              <Link
                to="/terms"
                className="text-primary hover:text-primary-dark"
              >
                Điều khoản sử dụng
              </Link>{' '}
              và{' '}
              <Link
                to="/privacy"
                className="text-primary hover:text-primary-dark"
              >
                Chính sách bảo mật
              </Link>
            </label>
            {touched.agreeToTerms && errors.agreeToTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          className="justify-center"
        >
          Đăng ký
        </Button>
      </form>

      <div className="text-center">
        <span className="text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link
            to={ROUTE_PATHS.AUTH.LOGIN}
            className="font-medium text-primary hover:text-primary-dark"
          >
            Đăng nhập ngay
          </Link>
        </span>
      </div>
    </div>
  );
};
