import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useForm } from '../../hooks/useForm';
import { usePasswordReset } from '../../hooks/useAuth';
import { useAuthValidation } from '../../hooks/useAuthValidation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ResetPasswordFormProps {
  token: string;
}

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token,
}) => {
  const { handleResetPassword, isLoading } = usePasswordReset();
  const { validateResetPasswordForm } = useAuthValidation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useForm<ResetPasswordFormData>({
      initialValues: {
        newPassword: '',
        confirmPassword: '',
      },
      validate: validateResetPasswordForm,
      onSubmit: async (data) => {
        await handleResetPassword({
          token,
          newPassword: data.newPassword,
        });
      },
    });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Đặt lại mật khẩu</h2>
        <p className="mt-2 text-sm text-gray-600">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          loading={isLoading}
          className="justify-center"
        >
          Đặt lại mật khẩu
        </Button>
      </form>
    </div>
  );
};
