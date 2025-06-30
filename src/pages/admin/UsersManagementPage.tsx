import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  TrashIcon,
  UserIcon,
  ShieldCheckIcon,
  XCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { UserRole, UserStatus } from '../../types/auth';
import {
  AdminUserSummaryDto,
  AdminUserSearchDto,
  UserStatsDto,
} from '../../types/admin-user';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { SearchBox } from '../../components/common/SearchBox';
import { Select } from '../../components/ui/Dropdown';
import { Pagination } from '../../components/ui/Pagination';
import { Avatar } from '../../components/ui/Avatar';
import { ConfirmModal } from '../../components/ui/Modal';
import { UserDetailModal } from '../../components/admin/UserDetailModal';
import { useToastContext } from '../../contexts/ToastContext';
import { adminUserService } from '../../services/admin-user.service';
import { formatDate, formatPrice } from '../../utils/format';
import { useDebounce } from '../../hooks/common/useDebounce';

export const UsersManagementPage: React.FC = () => {
  const { success, error } = useToastContext();

  // State for users list
  const [users, setUsers] = useState<AdminUserSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // State for filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '' as UserRole | '',
    status: '' as UserStatus | '',
    verified: '' as boolean | '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  // State for modals
  const [selectedUser, setSelectedUser] = useState<AdminUserSummaryDto | null>(
    null,
  );
  const [userDetailModal, setUserDetailModal] = useState({
    isOpen: false,
    user: null as any,
    loading: false,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    user: null as AdminUserSummaryDto | null,
    loading: false,
  });

  // State for stats
  const [stats, setStats] = useState<UserStatsDto | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const searchDto: AdminUserSearchDto = {
        query: debouncedSearchQuery,
        page: currentPage,
        limit: 20,
        role: filters.role || undefined,
        status: filters.status || undefined,
        verified:
          filters.verified !== '' ? Boolean(filters.verified) : undefined,
      };

      const result = await adminUserService.getUsers(searchDto);

      setUsers(result.users);
      setTotalPages(result.totalPages);
      setTotalItems(result.total);
    } catch (err: any) {
      console.error('Error loading users:', err);
      error(err.message || 'Có lỗi xảy ra khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const statsData = await adminUserService.getUserStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Load data on dependencies change
  useEffect(() => {
    loadUsers();
  }, [currentPage, debouncedSearchQuery, filters]);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Reset page when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filters]);

  // Handle view user details
  const handleViewUser = async (user: AdminUserSummaryDto) => {
    setUserDetailModal({
      isOpen: true,
      user: null,
      loading: true,
    });

    try {
      const userDetails = await adminUserService.getUserDetails(user.id);
      setUserDetailModal({
        isOpen: true,
        user: userDetails,
        loading: false,
      });
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi tải thông tin người dùng');
      setUserDetailModal({
        isOpen: false,
        user: null,
        loading: false,
      });
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!deleteModal.user) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));

    try {
      await adminUserService.deleteUser(deleteModal.user.id);
      success(
        `Đã xóa tài khoản ${deleteModal.user.firstName} ${deleteModal.user.lastName}`,
      );

      setDeleteModal({
        isOpen: false,
        user: null,
        loading: false,
      });

      // Reload users and stats
      loadUsers();
      loadStats();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi xóa tài khoản');
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      role: '',
      status: '',
      verified: '',
    });
    setSearchQuery('');
  };

  // Helper functions
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

  // Filter options
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
    { label: 'Đã xóa', value: UserStatus.DELETED },
  ];

  const verifiedOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Đã xác minh', value: 'true' },
    { label: 'Chưa xác minh', value: 'false' },
  ];

  const hasActiveFilters =
    filters.role || filters.status || filters.verified !== '' || searchQuery;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-gray-600">
          Quản lý tài khoản và quyền hạn người dùng trong hệ thống
        </p>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Tổng người dùng
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Nghệ nhân</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.byRole[UserRole.ARTISAN] || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Khách hàng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.byRole[UserRole.CUSTOMER] || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ShieldCheckIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Đã xác minh</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.verified}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <SearchBox
            value={searchQuery}
            onChange={handleSearch}
            onSubmit={() => {}} // Auto search with debounce
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
                onChange={(value) => handleFilterChange('role', value)}
                options={roleOptions}
                className="md:w-40"
              />

              <Select
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                options={statusOptions}
                className="md:w-40"
              />

              <Select
                value={filters.verified.toString()}
                onChange={(value) => handleFilterChange('verified', value)}
                options={verifiedOptions}
                className="md:w-40"
              />
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            )}
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
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Không tìm thấy người dùng
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
            </p>
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
                            src={user.avatarUrl || undefined}
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
                        {user.role === UserRole.ARTISAN &&
                          user.artisanProfile && (
                            <div className="mt-1 text-xs text-gray-500">
                              {user.artisanProfile.shopName}
                            </div>
                          )}
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
                          {user.role === UserRole.ARTISAN &&
                            user.artisanProfile?.isVerified && (
                              <span className="text-xs text-blue-600">
                                Nghệ nhân
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>

                          {user.status !== UserStatus.DELETED && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setDeleteModal({
                                  isOpen: true,
                                  user,
                                  loading: false,
                                })
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          )}
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

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={userDetailModal.isOpen}
        onClose={() =>
          setUserDetailModal({
            isOpen: false,
            user: null,
            loading: false,
          })
        }
        user={userDetailModal.user}
        loading={userDetailModal.loading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({
            isOpen: false,
            user: null,
            loading: false,
          })
        }
        onConfirm={handleDeleteUser}
        title="Xác nhận xóa tài khoản"
        message={
          deleteModal.user
            ? `Bạn có chắc chắn muốn xóa tài khoản của ${deleteModal.user.firstName} ${deleteModal.user.lastName}? Hành động này không thể hoàn tác.`
            : ''
        }
        confirmText="Xóa tài khoản"
        cancelText="Hủy"
        type="danger"
        loading={deleteModal.loading}
      />
    </div>
  );
};
