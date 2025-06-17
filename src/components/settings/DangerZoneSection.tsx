import React, { useState } from 'react';
import {
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { userService } from '../../services/user.service';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ConfirmModal } from '../ui/Modal';

export const DangerZoneSection: React.FC = () => {
  const { logout } = useAuth();
  const { success, error } = useToastContext();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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

  return (
    <div className="space-y-6">
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-4 mt-1" />
          <div className="flex-1">
            <h3 className="font-medium text-red-900 mb-2">Xóa tài khoản</h3>
            <p className="text-sm text-red-700 mb-4">
              Một khi bạn xóa tài khoản, không có cách nào để khôi phục lại. Tất
              cả dữ liệu của bạn sẽ bị xóa vĩnh viễn bao gồm:
            </p>
            <ul className="text-sm text-red-700 mb-4 list-disc list-inside space-y-1">
              <li>Thông tin cá nhân và hồ sơ</li>
              <li>Bài viết và sản phẩm đã đăng</li>
              <li>Lịch sử đơn hàng và giao dịch</li>
              <li>Tin nhắn và thông báo</li>
              <li>Danh sách theo dõi và người theo dõi</li>
            </ul>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              leftIcon={<TrashIcon className="w-4 h-4" />}
            >
              Xóa tài khoản vĩnh viễn
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Xác nhận xóa tài khoản"
        message="Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác và tất cả dữ liệu của bạn sẽ bị mất vĩnh viễn."
        confirmText="Xóa tài khoản"
        cancelText="Hủy"
        type="danger"
        loading={deletingAccount}
      />
    </div>
  );
};
