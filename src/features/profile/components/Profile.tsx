import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../store/AuthContext';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Avatar } from '../../../components/common/Avatar';
import { Tabs } from '../../../components/ui/Tabs';
import { Loader } from '../../../components/ui/Loader';
import { Alert } from '../../../components/ui/Alert';
import { PencilIcon, UserIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../../../utils/formatters';
import { ProfileService } from '@/services/profile.service';
import ProfileForm from './ProfileForm';
import AddressList from './AddressList';

const Profile: React.FC = () => {
  const { state } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await ProfileService.getProfile();
        setProfile(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return <Loader size="lg" text="Loading profile..." />;
  }

  if (error) {
    return (
      <Alert type="error" title="Error" variant="subtle">
        {error}
      </Alert>
    );
  }

  const tabs = [
    {
      id: 'details',
      label: 'Profile Details',
      content: isEditing ? (
        <ProfileForm
          profile={profile}
          onSave={(updatedProfile) => {
            setProfile(updatedProfile);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ProfileDetails profile={profile} onEdit={() => setIsEditing(true)} />
      ),
    },
    {
      id: 'addresses',
      label: 'Addresses',
      content: <AddressList />,
    },
    {
      id: 'security',
      label: 'Security',
      content: <SecuritySettings />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Profile</h1>
      <Tabs tabs={tabs} />
    </div>
  );
};

// Corrected ProfileDetails component
const ProfileDetails: React.FC<{ profile: any; onEdit: () => void }> = ({
  profile,
  onEdit,
}) => {
  const { state } = useAuth();
  const { user } = state;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <Avatar
            src={user?.avatarUrl}
            size="xl"
            firstName={user?.firstName}
            lastName={user?.lastName}
          />
          <div className="ml-5">
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-500">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Member since {formatDate(user?.createdAt || new Date())}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<PencilIcon className="h-4 w-4" />}
          onClick={onEdit}
        >
          Edit Profile
        </Button>
      </div>

      <Card>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">First Name</p>
                <p className="mt-1">{user?.firstName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Name</p>
                <p className="mt-1">{user?.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Username</p>
                <p className="mt-1">{user?.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="mt-1">{user?.phone || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Account Status
                </p>
                <div className="mt-1 flex items-center">
                  <span
                    className={`inline-block h-2 w-2 rounded-full mr-2 ${
                      user?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                  ></span>
                  {user?.status}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900">
              Profile Information
            </h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="mt-1">{profile?.location || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Website</p>
                <p className="mt-1">
                  {profile?.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-accent-dark"
                    >
                      {profile.website}
                    </a>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Date of Birth
                </p>
                <p className="mt-1">
                  {profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Gender</p>
                <p className="mt-1">
                  {profile?.gender
                    ? profile.gender.charAt(0).toUpperCase() +
                      profile.gender.slice(1)
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {profile?.bio && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">Bio</h3>
              <p className="mt-2 text-gray-700">{profile.bio}</p>
            </div>
          )}

          {profile?.socialLinks &&
            Object.keys(profile.socialLinks).length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Social Links
                </h3>
                <div className="mt-3 space-y-2">
                  {Object.entries(profile.socialLinks).map(
                    ([platform, url]) => (
                      <div key={platform} className="flex items-center">
                        <p className="text-sm font-medium text-gray-500 w-24 capitalize">
                          {platform}:
                        </p>
                        <a
                          href={url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:text-accent-dark ml-2"
                        >
                          {url as string}
                        </a>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
        </div>
      </Card>
    </div>
  );
};

// Security Settings Component
const SecuritySettings: React.FC = () => {
  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Password</h3>
          <p className="mt-1 text-sm text-gray-500">
            Change your password to keep your account secure
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              leftIcon={<UserIcon className="h-4 w-4" />}
              as="a"
              href="/change-password"
            >
              Change Password
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900">
            Email Verification
          </h3>
          <div className="mt-2 flex items-center">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            <span className="text-green-700">Email verified</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900">
            Account Settings
          </h3>
          <div className="mt-4 space-y-3">
            <Button
              variant="outline"
              size="sm"
              as="a"
              href="/settings/notifications"
            >
              Notification Settings
            </Button>
            <Button variant="danger" size="sm">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Profile;
