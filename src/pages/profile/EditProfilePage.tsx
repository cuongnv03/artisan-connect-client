import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  PhotoIcon,
  ArrowLeftIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { userService } from '../../services/user.service';
import { uploadService } from '../../services/upload.service';
import { useForm } from '../../hooks/useForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { FileUpload } from '../../components/common/FileUpload';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
  phone: string;
  location: string;
  website: string;
  dateOfBirth: string;
  gender: string;
}

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { success, error } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const { values, handleChange, handleSubmit, setFieldValue } =
    useForm<ProfileFormData>({
      initialValues: {
        firstName: authState.user?.firstName || '',
        lastName: authState.user?.lastName || '',
        bio: authState.user?.bio || '',
        phone: authState.user?.phone || '',
        location: '',
        website: '',
        dateOfBirth: '',
        gender: '',
      },
      onSubmit: handleSave,
    });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await userService.getProfile();
      setProfile(userProfile);

      // Update form values
      setFieldValue('location', userProfile.location || '');
      setFieldValue('website', userProfile.website || '');
      setFieldValue(
        'dateOfBirth',
        userProfile.dateOfBirth
          ? new Date(userProfile.dateOfBirth).toISOString().split('T')[0]
          : '',
      );
      setFieldValue('gender', userProfile.gender || '');
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  async function handleSave(data: ProfileFormData) {
    setLoading(true);
    try {
      // Update basic profile
      await userService.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        phone: data.phone,
      });

      // Update extended profile
      await userService.updateUserProfile({
        location: data.location,
        website: data.website,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
      });

      success('Cập nhật hồ sơ thành công!');
      navigate('/profile');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  }

  const handleAvatarUpload = async () => {
    if (avatarFiles.length === 0) return;

    setUploadingAvatar(true);
    try {
      const uploadResult = await uploadService.uploadImage(avatarFiles[0], {
        folder: 'avatars',
        width: 200,
        height: 200,
      });

      await userService.updateProfile({
        // Assuming the API accepts avatarUrl in updateProfile
        // You may need to adjust this based on your actual API
      } as any);

      success('Cập nhật ảnh đại diện thành công!');
      setAvatarFiles([]);
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi tải ảnh lên');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async () => {
    if (coverFiles.length === 0) return;

    setUploadingCover(true);
    try {
      const uploadResult = await uploadService.uploadImage(coverFiles[0], {
        folder: 'covers',
        width: 1200,
        height: 300,
      });

      await userService.updateUserProfile({
        coverUrl: uploadResult.url,
      });

      success('Cập nhật ảnh bìa thành công!');
      setCoverFiles([]);
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi tải ảnh lên');
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/profile')}
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
            className="mr-4"
          >
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa hồ sơ</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Avatar Upload */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ảnh đại diện
          </h2>

          <div className="flex items-center space-x-6">
            <Avatar
              src={authState.user?.avatarUrl}
              alt={`${authState.user?.firstName} ${authState.user?.lastName}`}
              size="xl"
            />

            <div className="flex-1">
              <FileUpload
                files={avatarFiles}
                onFilesChange={setAvatarFiles}
                accept="image"
                multiple={false}
                maxFiles={1}
                className="mb-4"
              />

              {avatarFiles.length > 0 && (
                <Button
                  onClick={handleAvatarUpload}
                  loading={uploadingAvatar}
                  leftIcon={<CheckIcon className="w-4 h-4" />}
                >
                  Cập nhật ảnh đại diện
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Cover Image Upload */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ảnh bìa</h2>

          <div className="space-y-4">
            {profile?.coverUrl && (
              <img
                src={profile.coverUrl}
                alt="Cover"
                className="w-full h-32 object-cover rounded-lg"
              />
            )}

            <FileUpload
              files={coverFiles}
              onFilesChange={setCoverFiles}
              accept="image"
              multiple={false}
              maxFiles={1}
            />

            {coverFiles.length > 0 && (
              <Button
                onClick={handleCoverUpload}
                loading={uploadingCover}
                leftIcon={<CheckIcon className="w-4 h-4" />}
              >
                Cập nhật ảnh bìa
              </Button>
            )}
          </div>
        </Card>

        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin cơ bản
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Họ"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                required
              />
              <Input
                label="Tên"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới thiệu bản thân
              </label>
              <textarea
                name="bio"
                rows={3}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                placeholder="Viết vài dòng về bản thân..."
                value={values.bio}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Số điện thoại"
              name="phone"
              type="tel"
              value={values.phone}
              onChange={handleChange}
            />

            <Input
              label="Địa chỉ"
              name="location"
              value={values.location}
              onChange={handleChange}
              placeholder="Thành phố, Quốc gia"
            />

            <Input
              label="Website"
              name="website"
              type="url"
              value={values.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ngày sinh"
                name="dateOfBirth"
                type="date"
                value={values.dateOfBirth}
                onChange={handleChange}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giới tính
                </label>
                <select
                  name="gender"
                  value={values.gender}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/profile')}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                loading={loading}
                leftIcon={<CheckIcon className="w-4 h-4" />}
              >
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
