import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { useForm } from '../../hooks/useForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { success, error } = useToastContext();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (values: RegisterFormData) => {
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

    if (!values.username.trim()) {
      errors.username = 'Tên đăng nhập là bắt buộc';
    } else if (values.username.length < 3) {
      errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(values.username)) {
      errors.username =
        'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
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

  const handleSubmit = async (values: RegisterFormData) => {
    try {
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        username: values.username,
        password: values.password,
      });
      success('Đăng ký thành công! Chào mừng bạn đến với Artisan Connect.');
      navigate('/home');
    } catch (err: any) {
      error(err.response?.data?.message || 'Đăng ký thất bại');
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
    validate: validateForm,
    onSubmit: handleSubmit,
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Đăng ký</h2>
        <p className="mt-2 text-sm text-gray-600">
          Tạo tài khoản để tham gia cộng đồng Artisan Connect
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
          required
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.username ? errors.username : ''}
          placeholder="Nhập tên đăng nhập"
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

      <div className="mt-6 text-center">
        <span className="text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link
            to="/auth/login"
            className="font-medium text-primary hover:text-primary-dark"
          >
            Đăng nhập ngay
          </Link>
        </span>
      </div>
    </div>
  );
};
