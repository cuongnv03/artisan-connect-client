import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import { useToastContext } from '../../contexts/ToastContext';
import { userService } from '../../services/user.service';
import { UpdateUserDto } from '../../types/user';

export const useProfileManagement = () => {
  const { state: authState } = useAuth();
  const { updateProfile } = useProfile();
  const { success, error } = useToastContext();
  const [loading, setLoading] = useState(false);

  const updateBasicProfile = async (data: UpdateUserDto) => {
    setLoading(true);
    try {
      await userService.updateProfile(data);
      success('Cập nhật thông tin thành công!');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExtendedProfile = async (data: any) => {
    setLoading(true);
    try {
      await updateProfile(data);
      success('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateBasicProfile,
    updateExtendedProfile,
    loading,
  };
};
