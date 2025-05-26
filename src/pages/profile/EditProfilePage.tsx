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
  const [previewAvatar, setPreviewAvatar] = useState<string>('');
  const [previewCover, setPreviewCover] = useState<string>('');

  const { values, handleChange, handleSubmit, setFieldValue, errors } =
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
      validate: (values) => {
        const errors: Record<string, string> = {};
        if (!values.firstName.trim()) errors.firstName = 'Tên là bắt buộc';
        if (!values.lastName.trim()) errors.lastName = 'Họ là bắt buộc';

        if (values.website && values.website.trim()) {
          if (
            !values.website.startsWith('http://') &&
            !values.website.startsWith('https://')
          ) {
            errors.website = 'Website phải bắt đầu với http:// hoặc https://';
          }
        }

        if (values.phone && values.phone.trim()) {
          const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/;
          if (!phoneRegex.test(values.phone.replace(/\s/g, ''))) {
            errors.phone = 'Số điện thoại không hợp lệ';
          }
        }

        return errors;
      },
      onSubmit: handleSave,
    });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    // Create preview for avatar
    if (avatarFiles.length > 0) {
      const file = avatarFiles[0];
      const validation = uploadService.validateImageFile(file);

      if (!validation.valid) {
        error(validation.error || 'File ảnh không hợp lệ');
        setAvatarFiles([]);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => setPreviewAvatar(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewAvatar('');
    }
  }, [avatarFiles]);

  useEffect(() => {
    // Create preview for cover
    if (coverFiles.length > 0) {
      const file = coverFiles[0];
      const validation = uploadService.validateImageFile(file);

      if (!validation.valid) {
        error(validation.error || 'File ảnh không hợp lệ');
        setCoverFiles([]);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => setPreviewCover(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewCover('');
    }
  }, [coverFiles]);

  const loadProfile = async () => {
    try {
      const userProfile = await userService.getProfile();
      setProfile(userProfile);

      // Update form values with existing profile data
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
      // Profile might not exist yet, which is fine
    }
  };

  async function handleSave(data: ProfileFormData) {
    setLoading(true);
    try {
      // Update basic profile information
      await userService.updateProfile({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        bio: data.bio.trim() || undefined,
        phone: data.phone.trim() || undefined,
      });

      // Update extended profile information
      await userService.updateUserProfile({
        location: data.location.trim() || undefined,
        website: data.website.trim() || undefined,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender || undefined,
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

    const file = avatarFiles[0];
    const validation = uploadService.validateImageFile(file);

    if (!validation.valid) {
      error(validation.error || 'File ảnh không hợp lệ');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Upload image to cloud storage
      const uploadResult = await uploadService.uploadImage(file, {
        folder: 'avatars',
        width: 400,
        height: 400,
        quality: 90,
        format: 'auto',
      });

      // Update user profile with new avatar URL
      await userService.updateProfile({
        firstName: authState.user?.firstName || '',
        lastName: authState.user?.lastName || '',
        bio: authState.user?.bio || undefined,
        phone: authState.user?.phone || undefined,
        avatarUrl: uploadResult.url,
      } as any);

      success('Cập nhật ảnh đại diện thành công!');
      setAvatarFiles([]);
      setPreviewAvatar('');

      // Reload the page to reflect changes in auth state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi tải ảnh lên');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async () => {
    if (coverFiles.length === 0) return;

    const file = coverFiles[0];
    const validation = uploadService.validateImageFile(file);

    if (!validation.valid) {
      error(validation.error || 'File ảnh không hợp lệ');
      return;
    }

    setUploadingCover(true);
    try {
      // Upload image to cloud storage
      const uploadResult = await uploadService.uploadImage(file, {
        folder: 'covers',
        width: 1200,
        height: 400,
        quality: 85,
        format: 'auto',
      });

      // Update user profile with new cover URL
      const updatedProfile = await userService.updateUserProfile({
        coverUrl: uploadResult.url,
      });

      setProfile(updatedProfile);
      success('Cập nhật ảnh bìa thành công!');
      setCoverFiles([]);
      setPreviewCover('');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi tải ảnh lên');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleAvatarFileChange = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const validation = uploadService.validateImageFile(file);

      if (!validation.valid) {
        error(validation.error || 'File ảnh không hợp lệ');
        return;
      }
    }
    setAvatarFiles(files);
  };

  const handleCoverFileChange = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const validation = uploadService.validateImageFile(file);

      if (!validation.valid) {
        error(validation.error || 'File ảnh không hợp lệ');
        return;
      }
    }
    setCoverFiles(files);
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
            <div className="relative">
              <Avatar
                src={previewAvatar || authState.user?.avatarUrl}
                alt={`${authState.user?.firstName} ${authState.user?.lastName}`}
                size="xl"
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <LoadingSpinner size="sm" className="text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <FileUpload
                files={avatarFiles}
                onFilesChange={handleAvatarFileChange}
                accept="image"
                multiple={false}
                maxFiles={1}
                maxSize={5}
                className="mb-4"
              />

              <p className="text-sm text-gray-500 mb-4">
                Kích thước khuyến nghị: 400x400px. Định dạng: JPG, PNG, WebP.
                Tối đa 5MB.
              </p>

              {avatarFiles.length > 0 && (
                <Button
                  onClick={handleAvatarUpload}
                  loading={uploadingAvatar}
                  disabled={uploadingAvatar}
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
            <div className="h-32 bg-gray-100 rounded-lg overflow-hidden relative">
              {previewCover || profile?.coverUrl ? (
                <img
                  src={previewCover || profile?.coverUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <PhotoIcon className="w-8 h-8 text-white opacity-50" />
                </div>
              )}
              {uploadingCover && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <LoadingSpinner size="md" className="text-white" />
                </div>
              )}
            </div>

            <FileUpload
              files={coverFiles}
              onFilesChange={handleCoverFileChange}
              accept="image"
              multiple={false}
              maxFiles={1}
              maxSize={5}
            />

            <p className="text-sm text-gray-500">
              Kích thước khuyến nghị: 1200x400px. Định dạng: JPG, PNG, WebP. Tối
              đa 5MB.
            </p>

            {coverFiles.length > 0 && (
              <Button
                onClick={handleCoverUpload}
                loading={uploadingCover}
                disabled={uploadingCover}
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
                error={errors.lastName}
                required
                placeholder="Nhập họ của bạn"
              />
              <Input
                label="Tên"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
                placeholder="Nhập tên của bạn"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới thiệu bản thân
              </label>
              <textarea
                name="bio"
                rows={3}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                placeholder="Viết vài dòng về bản thân, sở thích, công việc..."
                value={values.bio}
                onChange={handleChange}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {values.bio.length}/500 ký tự
              </p>
            </div>

            <Input
              label="Số điện thoại"
              name="phone"
              type="tel"
              value={values.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="Ví dụ: 0987654321"
              helperText="Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx"
            />

            <Input
              label="Địa chỉ"
              name="location"
              value={values.location}
              onChange={handleChange}
              placeholder="Ví dụ: Hà Nội, Việt Nam"
              helperText="Thành phố, quốc gia nơi bạn sinh sống"
            />

            <Input
              label="Website"
              name="website"
              type="url"
              value={values.website}
              onChange={handleChange}
              error={errors.website}
              placeholder="https://example.com"
              helperText="Website cá nhân hoặc portfolio của bạn"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ngày sinh"
                name="dateOfBirth"
                type="date"
                value={values.dateOfBirth}
                onChange={handleChange}
                helperText="Thông tin này sẽ không được hiển thị công khai"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giới tính
                </label>
                <select
                  name="gender"
                  value={values.gender}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                  <option value="prefer_not_to_say">Không muốn tiết lộ</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Thông tin này sẽ không được hiển thị công khai
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/profile')}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading || uploadingAvatar || uploadingCover}
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
