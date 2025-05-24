import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  BellIcon,
  EyeIcon,
  TrashIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { authService } from '../../services/auth.service';
import { userService } from '../../services/user.service';
import { useForm } from '../../hooks/useForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { ConfirmModal } from '../../components/ui/Modal';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const SettingsPage: React.FC = () => {
  const { state: authState, logout } = useAuth();
  const { success, error } = useToastContext();
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const {
    values,
    handleChange,
    handleSubmit,
    resetForm,
    errors,
    setFieldError,
  } = useForm<PasswordFormData>({
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

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await userService.deleteAccount();
      success('Tài khoản đã được xóa thành công');
      await logout();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi xóa tài khoản');
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  const tabItems = [
    {
      key: 'security',
      label: 'Bảo mật',
      icon: <ShieldCheckIcon className="w-4 h-4" />,
      content: (
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
                {authState.user?.emailVerified
                  ? 'Đã xác minh'
                  : 'Chưa xác minh'}
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
                helperText="Tối thiểu 6 ký tự"
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
                  <ComputerDesktopIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Thiết bị hiện tại</p>
                    <p className="text-xs text-gray-500">Chrome trên Windows</p>
                  </div>
                </div>
                <Badge variant="success" size="sm">
                  Đang hoạt động
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'notifications',
      label: 'Thông báo',
      icon: <BellIcon className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">
              Cài đặt thông báo
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Thông báo email
                  </h4>
                  <p className="text-sm text-gray-500">
                    Nhận thông báo qua email về hoạt động tài khoản
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Thông báo đẩy
                  </h4>
                  <p className="text-sm text-gray-500">
                    Nhận thông báo đẩy từ trình duyệt
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Thông báo về đơn hàng
                  </h4>
                  <p className="text-sm text-gray-500">
                    Cập nhật về trạng thái đơn hàng của bạn
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Thông báo marketing
                  </h4>
                  <p className="text-sm text-gray-500">
                    Khuyến mãi và sản phẩm mới
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'privacy',
      label: 'Quyền riêng tư',
      icon: <EyeIcon className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">
              Cài đặt quyền riêng tư
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Hồ sơ công khai
                  </h4>
                  <p className="text-sm text-gray-500">
                    Cho phép người khác xem hồ sơ của bạn
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Hiển thị trạng thái online
                  </h4>
                  <p className="text-sm text-gray-500">
                    Cho phép người khác biết khi bạn đang online
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Cho phép tin nhắn từ người lạ
                  </h4>
                  <p className="text-sm text-gray-500">
                    Nhận tin nhắn từ những người bạn chưa theo dõi
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'danger',
      label: 'Vùng nguy hiểm',
      icon: <ExclamationTriangleIcon className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <Card className="p-6 border-red-200">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-4 mt-1" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900 mb-2">Xóa tài khoản</h3>
                <p className="text-sm text-red-700 mb-4">
                  Một khi bạn xóa tài khoản, không có cách nào để khôi phục lại.
                  Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                </p>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                  leftIcon={<TrashIcon className="w-4 h-4" />}
                >
                  Xóa tài khoản
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Cài đặt tài khoản
      </h1>

      <Tabs items={tabItems} variant="line" />

      {/* Delete Account Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Xác nhận xóa tài khoản"
        message="Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác."
        confirmText="Xóa tài khoản"
        cancelText="Hủy"
        type="danger"
        loading={deletingAccount}
      />
    </div>
  );
};
