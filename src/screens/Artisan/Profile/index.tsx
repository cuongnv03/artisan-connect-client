import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/form/Button';
import { Alert } from '../../../components/feedback/Alert';
import { Loader } from '../../../components/feedback/Loader';
import { Tabs } from '../../../components/navigation/Tabs';
import { Modal } from '../../../components/feedback/Modal';
import {
  PencilIcon,
  PhotoIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { ArtisanService } from '../../../services/artisan.service';
import {
  ArtisanProfileWithUser,
  UpdateArtisanProfileDto,
} from '../../../types/artisan.types';
import ArtisanProfileForm from './components/ProfileForm';
import ArtisanTemplateGenerator from './components/TemplateGenerator';

const ArtisanProfile: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artisanProfile, setArtisanProfile] =
    useState<ArtisanProfileWithUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState<
    'logo' | 'banner' | null
  >(null);

  useEffect(() => {
    const fetchArtisanProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await ArtisanService.getMyProfile();
        setArtisanProfile(data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Failed to load artisan profile',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtisanProfile();
  }, []);

  const handleUpdateProfile = async (
    updatedProfile: UpdateArtisanProfileDto,
  ) => {
    try {
      setError(null);
      const data = await ArtisanService.updateProfile(updatedProfile);
      setArtisanProfile(data);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  // Mock function for image upload (would be replaced with actual implementation)
  const handleImageUpload = async (type: 'logo' | 'banner', file: File) => {
    try {
      // This would be an actual API call to upload image
      console.log(`Uploading ${type}: ${file.name}`);

      // Mock the updated profile
      if (artisanProfile) {
        const updatedProfile = { ...artisanProfile };
        if (type === 'logo') {
          updatedProfile.shopLogoUrl = URL.createObjectURL(file);
        } else {
          updatedProfile.shopBannerUrl = URL.createObjectURL(file);
        }
        setArtisanProfile(updatedProfile);
      }

      setShowUploadModal(null);
    } catch (err: any) {
      setError('Failed to upload image');
    }
  };

  if (isLoading) {
    return <Loader size="lg" text="Loading artisan profile..." />;
  }

  if (!artisanProfile) {
    return (
      <Alert type="error" title="Error" variant="subtle">
        {error || 'Failed to load artisan profile. Please try again later.'}
      </Alert>
    );
  }

  // Profile tabs
  const tabs = [
    {
      id: 'profile',
      label: 'Shop Profile',
      content: isEditing ? (
        <ArtisanProfileForm
          profile={artisanProfile}
          onSave={handleUpdateProfile}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ShopProfileDetails
          profile={artisanProfile}
          onEdit={() => setIsEditing(true)}
          onChangeImage={(type) => setShowUploadModal(type)}
          onCustomizeTemplate={() => setShowTemplateModal(true)}
        />
      ),
    },
    {
      id: 'products',
      label: 'Products',
      content: <ProductsTab />,
    },
    {
      id: 'reviews',
      label: 'Reviews',
      content: <ReviewsTab />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Artisan Shop Profile
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your artisan profile and showcase your craft
        </p>
      </div>

      {error && (
        <Alert
          type="error"
          variant="subtle"
          dismissible
          onDismiss={() => setError(null)}
          className="mb-6"
        >
          {error}
        </Alert>
      )}

      <Tabs tabs={tabs} />

      {/* Image Upload Modal */}
      <Modal
        isOpen={showUploadModal !== null}
        onClose={() => setShowUploadModal(null)}
        title={`Upload Shop ${showUploadModal === 'logo' ? 'Logo' : 'Banner'}`}
        size="md"
      >
        <ImageUploadForm
          type={showUploadModal as 'logo' | 'banner'}
          onUpload={handleImageUpload}
          onCancel={() => setShowUploadModal(null)}
        />
      </Modal>

      {/* Template Generator Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Customize Shop Template"
        size="lg"
      >
        <ArtisanTemplateGenerator
          onComplete={() => setShowTemplateModal(false)}
          onCancel={() => setShowTemplateModal(false)}
        />
      </Modal>
    </div>
  );
};

// Shop Profile Details Component
const ShopProfileDetails: React.FC<{
  profile: ArtisanProfileWithUser;
  onEdit: () => void;
  onChangeImage: (type: 'logo' | 'banner') => void;
  onCustomizeTemplate: () => void;
}> = ({ profile, onEdit, onChangeImage, onCustomizeTemplate }) => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative h-60 rounded-xl overflow-hidden bg-gray-100">
        {profile.shopBannerUrl ? (
          <img
            src={profile.shopBannerUrl}
            alt={`${profile.shopName} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <span className="text-gray-400">No banner image</span>
          </div>
        )}

        <button
          className="absolute bottom-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all"
          onClick={() => onChangeImage('banner')}
        >
          <PhotoIcon className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* Shop Info */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Logo */}
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 shadow-md border border-gray-200">
            {profile.shopLogoUrl ? (
              <img
                src={profile.shopLogoUrl}
                alt={`${profile.shopName} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <span className="text-gray-400">No logo</span>
              </div>
            )}
          </div>

          <button
            className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-50"
            onClick={() => onChangeImage('logo')}
          >
            <PhotoIcon className="h-4 w-4 text-gray-700" />
          </button>
        </div>

        {/* Shop Details */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.shopName}
              </h2>
              <p className="text-sm text-gray-500">
                {profile.isVerified ? (
                  <span className="inline-flex items-center text-green-700">
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified Artisan
                  </span>
                ) : (
                  <span className="text-amber-600">Verification Pending</span>
                )}
              </p>
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

          <p className="mt-3 text-gray-700">
            {profile.shopDescription || 'No shop description provided.'}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {profile.specialties.map((specialty: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Contact Information
          </h3>

          <ul className="space-y-3">
            <li className="flex items-start">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-900">
                  {profile.contactEmail || profile.user.email}
                </p>
              </div>
            </li>

            {profile.contactPhone && (
              <li className="flex items-start">
                <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-sm text-gray-900">
                    {profile.contactPhone}
                  </p>
                </div>
              </li>
            )}

            {profile.website && (
              <li className="flex items-start">
                <GlobeAltIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Website</p>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:text-accent-dark"
                  >
                    {profile.website}
                  </a>
                </div>
              </li>
            )}
          </ul>

          {!profile.contactEmail &&
            !profile.contactPhone &&
            !profile.website && (
              <p className="text-sm text-gray-500">
                No contact information provided.
              </p>
            )}
        </Card>

        {/* Social Media */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Social Media
          </h3>

          {profile.socialMedia &&
          Object.keys(profile.socialMedia).length > 0 ? (
            <ul className="space-y-3">
              {Object.entries(profile.socialMedia).map(([platform, url]) => (
                <li key={platform} className="flex items-start">
                  <div className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0">
                    {/* Platform icon (simplified) */}
                    {platform === 'facebook' && (
                      <span className="text-blue-600 font-bold">f</span>
                    )}
                    {platform === 'instagram' && (
                      <span className="text-pink-500 font-bold">IG</span>
                    )}
                    {platform === 'twitter' && (
                      <span className="text-blue-400 font-bold">X</span>
                    )}
                    {platform === 'linkedin' && (
                      <span className="text-blue-700 font-bold">in</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 capitalize">
                      {platform}
                    </p>
                    <a
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:text-accent-dark truncate block max-w-xs"
                    >
                      {url as string}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              No social media links provided.
            </p>
          )}
        </Card>

        {/* Shop Template */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Shop Template
          </h3>

          {profile.templateId ? (
            <div>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Current Style:</span>{' '}
                {profile.templateStyle || 'Custom'}
              </p>
              <p className="text-sm text-gray-700 mb-4">
                Customize your shop's appearance to attract more customers.
              </p>
              <Button
                leftIcon={<PaintBrushIcon className="h-4 w-4" />}
                onClick={onCustomizeTemplate}
                variant="outline"
                size="sm"
              >
                Customize Template
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-700 mb-4">
                You haven't set up a shop template yet. Customize your shop's
                appearance to attract more customers.
              </p>
              <Button
                leftIcon={<PaintBrushIcon className="h-4 w-4" />}
                onClick={onCustomizeTemplate}
                variant="primary"
                size="sm"
              >
                Generate Template
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// Image Upload Form
const ImageUploadForm: React.FC<{
  type: 'logo' | 'banner';
  onUpload: (type: 'logo' | 'banner', file: File) => void;
  onCancel: () => void;
}> = ({ type, onUpload, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onUpload(type, selectedFile);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {previewUrl ? (
            <div className="space-y-4">
              <img
                src={previewUrl}
                alt="Preview"
                className={`mx-auto ${
                  type === 'logo'
                    ? 'max-h-40 max-w-xs'
                    : 'max-h-60 w-full object-cover'
                }`}
              />
              <button
                type="button"
                className="text-sm text-red-600 hover:text-red-800"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
              >
                Remove image
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-accent hover:text-accent-dark focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500">
          {type === 'logo' ? (
            <p>
              Your shop logo should be square and represent your brand. It will
              be displayed on your shop profile and products.
            </p>
          ) : (
            <p>
              Your shop banner should have a landscape orientation (recommended
              size: 1200x400 pixels). It will be displayed at the top of your
              shop profile.
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedFile}>
            Upload
          </Button>
        </div>
      </div>
    </form>
  );
};

// Placeholder for Products Tab
const ProductsTab: React.FC = () => {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Products Yet
      </h3>
      <p className="text-gray-500 mb-6">
        Start adding your handcrafted products to showcase your work
      </p>
      <Button variant="primary" as="a" href="/products/create">
        Add Your First Product
      </Button>
    </div>
  );
};

// Placeholder for Reviews Tab
const ReviewsTab: React.FC = () => {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
      <p className="text-gray-500">
        Reviews will appear here once customers start purchasing and reviewing
        your products
      </p>
    </div>
  );
};

export default ArtisanProfile;
