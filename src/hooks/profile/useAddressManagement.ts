import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { userService } from '../../services/user.service';
import { Address, CreateAddressRequest } from '../../types/user';

export const useAddressManagement = () => {
  const { state: authState } = useAuth();
  const { success, error } = useToastContext();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authState.isAuthenticated) {
      loadAddresses();
    }
  }, [authState.isAuthenticated]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const addressList = await userService.getAddresses();
      setAddresses(addressList);
    } catch (err: any) {
      error('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const createAddress = async (data: CreateAddressRequest) => {
    try {
      await userService.createAddress(data);
      success('Thêm địa chỉ thành công!');
      await loadAddresses();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi thêm địa chỉ');
      throw err;
    }
  };

  const updateAddress = async (
    id: string,
    data: Partial<CreateAddressRequest>,
  ) => {
    try {
      await userService.updateAddress(id, data);
      success('Cập nhật địa chỉ thành công!');
      await loadAddresses();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi cập nhật địa chỉ');
      throw err;
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await userService.deleteAddress(id);
      success('Xóa địa chỉ thành công!');
      await loadAddresses();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi xóa địa chỉ');
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      await userService.setDefaultAddress(id);
      success('Đặt làm địa chỉ mặc định thành công!');
      await loadAddresses();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    }
  };

  return {
    addresses,
    loading,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refreshAddresses: loadAddresses,
  };
};
