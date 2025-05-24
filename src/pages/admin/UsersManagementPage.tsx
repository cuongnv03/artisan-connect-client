import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { User, UserRole, UserStatus } from '../../types/auth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { SearchBox } from '../../components/common/SearchBox';
import { Select } from '../../components/ui/Dropdown';
import { Pagination } from '../../components/ui/Pagination';
import { Avatar } from '../../components/ui/Avatar';
import { ConfirmModal } from '../../components/ui/Modal';
import { useToastContext } from '../../contexts/ToastContext';

export const UsersManagementPage: React.FC = () => {
  const { success, error } = useToastContext();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    verified: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    action: 'suspend' | 'activate' | 'delete' | null;
  }>({
    isOpen: false,
    action: null,
  });

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchQuery, filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Mock data - In real app, call admin API
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'nguyen.van.a@example.com',
          username: 'nguyen_van_a',
          firstName: 'Nguyễn Văn',
          lastName: 'A',
          role: UserRole.CUSTOMER,
          status: UserStatus.ACTIVE,
          bio: 'Yêu thích đồ thủ công',
          avatarUrl: 'https://via.placeholder.com/40',
          isVerified: true,
          emailVerified: true,
          phone: '0123456789',
          followerCount: 12,
          followingCount: 25,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
        },
        {
          id: '2',
          email: 'tran.thi.b@example.com',
          username: 'tran_thi_b',
          firstName: 'Trần Thị',
          lastName: 'B',
          role: UserRole.ARTISAN,
          status: UserStatus.ACTIVE,
          bio: 'Nghệ nhân gốm sứ',
          avatarUrl: 'https://via.placeholder.com/40',
          isVerified: true,
          emailVerified: true,
          phone: '0987654321',
          followerCount: 156,
          followingCount: 42,
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-22T10:00:00Z',
        },
        // Add more mock users...
      ];

      setTimeout(() => {
        setUsers(mockUsers);
        setTotalPages(5);
        setTotalItems(mockUsers.length * 5);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error loading users:', err);
      setLoading(false);
    }
  };

  const handleUserAction = async (
    action: 'suspend' | 'activate' | 'delete',
  ) => {
    if (!selectedUser) return;

    try {
      // Mock API call
      switch (action) {
        case 'suspend':
          // await adminService.suspendUser(selectedUser.id);
          success(
            `Đã đình chỉ tài khoản ${selectedUser.firstName} ${selectedUser.lastName}`,
          );
          break;
        case 'activate':
          // await adminService.activateUser(selectedUser.id);
          success(
            `Đã kích hoạt tài khoản ${selectedUser.firstName} ${selectedUser.lastName}`,
          );
          break;
        case 'delete':
          // await adminService.deleteUser(selectedUser.id);
          success(
            `Đã xóa tài khoản ${selectedUser.firstName} ${selectedUser.lastName}`,
          );
          break;
      }

      setActionModal({ isOpen: false, action: null });
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const configs = {
      [UserRole.ADMIN]: { variant: 'danger' as const, text: 'Quản trị viên' },
      [UserRole.ARTISAN]: { variant: 'primary' as const, text: 'Nghệ nhân' },
      [UserRole.CUSTOMER]: {
        variant: 'secondary' as const,
        text: 'Khách hàng',
      },
    };
    const config = configs[role];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getStatusBadge = (status: UserStatus) => {
    const configs = {
      [UserStatus.ACTIVE]: { variant: 'success' as const, text: 'Hoạt động' },
      [UserStatus.INACTIVE]: {
        variant: 'secondary' as const,
        text: 'Không hoạt động',
      },
      [UserStatus.SUSPENDED]: { variant: 'warning' as const, text: 'Đình chỉ' },
      [UserStatus.DELETED]: { variant: 'danger' as const, text: 'Đã xóa' },
    };
    const config = configs[status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const roleOptions = [
    { label: 'Tất cả vai trò', value: '' },
    { label: 'Khách hàng', value: UserRole.CUSTOMER },
    { label: 'Nghệ nhân', value: UserRole.ARTISAN },
    { label: 'Quản trị viên', value: UserRole.ADMIN },
  ];

  const statusOptions = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Hoạt động', value: UserStatus.ACTIVE },
    { label: 'Không hoạt động', value: UserStatus.INACTIVE },
    { label: 'Đình chỉ', value: UserStatus.SUSPENDED },
  ];

  const verifiedOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Đã xác minh', value: 'true' },
    { label: 'Chưa xác minh', value: 'false' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-gray-600">
          Quản lý tài khoản và quyền hạn người dùng
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm kiếm theo tên, email, username..."
          />

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center">
              <FunnelIcon className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Bộ lọc:</span>
            </div>

            <div className="flex flex-col md:flex-row gap-3 flex-1">
              <Select
                value={filters.role}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, role: value }))
                }
                options={roleOptions}
                className="md:w-40"
              />

              <Select
                value={filters.status}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
                options={statusOptions}
                className="md:w-40"
              />

              <Select
                value={filters.verified}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, verified: value }))
                }
                options={verifiedOptions}
                className="md:w-40"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">
                Đang tải danh sách người dùng...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Xác minh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
                            src={user.avatarUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                            size="md"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {user.isVerified && (
                            <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
                          )}
                          {user.emailVerified && (
                            <span className="text-xs text-green-600">
                              Email
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <EyeIcon className="w-4 h-4" />
                          </Button>

                          {user.status === UserStatus.ACTIVE ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setActionModal({
                                  isOpen: true,
                                  action: 'suspend',
                                });
                              }}
                              className="text-yellow-600 hover:text-yellow-700"
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setActionModal({
                                  isOpen: true,
                                  action: 'activate',
                                });
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              <ShieldCheckIcon className="w-4 h-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setActionModal({
                                isOpen: true,
                                action: 'delete',
                              });
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={20}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </Card>

      {/* Action Confirmation Modal */}
      <ConfirmModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, action: null })}
        onConfirm={() =>
          actionModal.action && handleUserAction(actionModal.action)
        }
        title={
          actionModal.action === 'suspend'
            ? 'Xác nhận đình chỉ tài khoản'
            : actionModal.action === 'activate'
            ? 'Xác nhận kích hoạt tài khoản'
            : 'Xác nhận xóa tài khoản'
        }
        message={
          selectedUser
            ? `Bạn có chắc chắn muốn ${
                actionModal.action === 'suspend'
                  ? 'đình chỉ'
                  : actionModal.action === 'activate'
                  ? 'kích hoạt'
                  : 'xóa'
              } tài khoản của ${selectedUser.firstName} ${
                selectedUser.lastName
              }?`
            : ''
        }
        confirmText={
          actionModal.action === 'suspend'
            ? 'Đình chỉ'
            : actionModal.action === 'activate'
            ? 'Kích hoạt'
            : 'Xóa tài khoản'
        }
        cancelText="Hủy"
        type={actionModal.action === 'delete' ? 'danger' : 'primary'}
      />
    </div>
  );
};
