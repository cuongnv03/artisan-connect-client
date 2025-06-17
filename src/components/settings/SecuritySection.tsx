import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { authService } from '../../services/auth.service';
import { useForm } from '../../hooks/useForm';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const SecuritySection: React.FC = () => {
  const { state: authState } = useAuth();
  const { success, error } = useToastContext();
  const [changingPassword, setChangingPassword] = useState(false);

  const { values, handleChange, handleSubmit, resetForm, errors } =
    useForm<PasswordFormData>({
      initialValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      validate: (values) => {
        const errors: Record<string, string> = {};

        if (!values.currentPassword) {
          errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        }

        if (!values.newPassword) {
          errors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (values.newPassword.length < 6) {
          errors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!values.confirmPassword) {
          errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (values.newPassword !== values.confirmPassword) {
          errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        return errors;
      },
      onSubmit: handleChangePassword,
    });

  async function handleChangePassword(data: PasswordFormData) {
    setChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      success('Đổi mật khẩu thành công!');
      resetForm();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Verification */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Xác minh email</h3>
            <p className="text-sm text-gray-500">
              Email: {authState.user?.email}
            </p>
          </div>
          <Badge
            variant={authState.user?.emailVerified ? 'success' : 'warning'}
          >
            {authState.user?.emailVerified ? 'Đã xác minh' : 'Chưa xác minh'}
          </Badge>
        </div>

        {!authState.user?.emailVerified && (
          <div className="mt-4">
            <Button size="sm" variant="outline">
              Gửi lại email xác minh
            </Button>
          </div>
        )}
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <h3 className="font-medium text-gray-900 mb-4">Đổi mật khẩu</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mật khẩu hiện tại"
            name="currentPassword"
            type="password"
            value={values.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
            required
          />

          <Input
            label="Mật khẩu mới"
            name="newPassword"
            type="password"
            value={values.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            helperText="Tối thiểu 8 ký tự"
            required
          />

          <Input
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />

          <Button
            type="submit"
            loading={changingPassword}
            className="w-full md:w-auto"
          >
            Đổi mật khẩu
          </Button>
        </form>
      </Card>

      {/* Active Sessions */}
      <Card className="p-6">
        <h3 className="font-medium text-gray-900 mb-4">Phiên đăng nhập</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center mr-3">
                💻
              </div>
              <div>
                <p className="text-sm font-medium">Thiết bị hiện tại</p>
                <p className="text-xs text-gray-500">
                  {navigator.userAgent.includes('Chrome')
                    ? 'Chrome'
                    : 'Browser'}{' '}
                  trên{' '}
                  {navigator.platform.includes('Mac') ? 'macOS' : 'Windows'}
                </p>
              </div>
            </div>
            <Badge variant="success" size="sm">
              Đang hoạt động
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
