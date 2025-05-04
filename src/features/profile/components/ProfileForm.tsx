import React, { useState } from 'react';
import { useForm } from '../../../hooks/useForm';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Alert } from '../../../components/ui/Alert';
import { Dropdown } from '../../../components/common/Dropdown';
import { ProfileService } from '@/services/profile.service';
import { isValidUrl } from '../../../utils/validators';

interface ProfileFormProps {
  profile: any;
  onSave: (updatedProfile: any) => void;
  onCancel: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  onSave,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialValues = {
    location: profile?.location || '',
    website: profile?.website || '',
    dateOfBirth: profile?.dateOfBirth
      ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
      : '',
    gender: profile?.gender || '',
    bio: profile?.bio || '',
    facebook: profile?.socialLinks?.facebook || '',
    twitter: profile?.socialLinks?.twitter || '',
    instagram: profile?.socialLinks?.instagram || '',
    linkedin: profile?.socialLinks?.linkedin || '',
  };

  const validate = (values: any) => {
    const errors: Record<string, string> = {};

    if (values.website && !isValidUrl(values.website)) {
      errors.website = 'Please enter a valid URL';
    }

    if (values.facebook && !isValidUrl(values.facebook)) {
      errors.facebook = 'Please enter a valid URL';
    }

    if (values.twitter && !isValidUrl(values.twitter)) {
      errors.twitter = 'Please enter a valid URL';
    }

    if (values.instagram && !isValidUrl(values.instagram)) {
      errors.instagram = 'Please enter a valid URL';
    }

    if (values.linkedin && !isValidUrl(values.linkedin)) {
      errors.linkedin = 'Please enter a valid URL';
    }

    return errors;
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useForm({
    initialValues,
    validate,
    onSubmit: async (formValues) => {
      try {
        setIsSubmitting(true);
        setError(null);

        // Format social links
        const socialLinks: Record<string, string> = {};
        ['facebook', 'twitter', 'instagram', 'linkedin'].forEach((platform) => {
          if (formValues[platform]) {
            socialLinks[platform] = formValues[platform];
          }
        });

        // Prepare data for API
        const updateData = {
          location: formValues.location || null,
          website: formValues.website || null,
          dateOfBirth: formValues.dateOfBirth || null,
          gender: formValues.gender || null,
          bio: formValues.bio || null,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        };

        const updatedProfile = await ProfileService.updateProfile(updateData);
        onSave(updatedProfile);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to update profile');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ];

  return (
    <Card>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Location"
            name="location"
            id="location"
            value={values.location}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.location ? errors.location : ''}
            placeholder="e.g., New York, NY"
          />

          <Input
            label="Website"
            name="website"
            id="website"
            value={values.website}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.website ? errors.website : ''}
            placeholder="e.g., https://yourwebsite.com"
          />

          <Input
            label="Date of Birth"
            type="date"
            name="dateOfBirth"
            id="dateOfBirth"
            value={values.dateOfBirth}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.dateOfBirth ? errors.dateOfBirth : ''}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <Dropdown
              options={genderOptions}
              value={values.gender}
              onChange={(value) => setFieldValue('gender', value)}
              placeholder="Select gender"
              error={touched.gender ? errors.gender : ''}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
            placeholder="Tell us about yourself..."
            value={values.bio}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.bio && errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Social Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Facebook"
              name="facebook"
              id="facebook"
              value={values.facebook}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.facebook ? errors.facebook : ''}
              placeholder="e.g., https://facebook.com/username"
            />

            <Input
              label="Twitter"
              name="twitter"
              id="twitter"
              value={values.twitter}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.twitter ? errors.twitter : ''}
              placeholder="e.g., https://twitter.com/username"
            />

            <Input
              label="Instagram"
              name="instagram"
              id="instagram"
              value={values.instagram}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.instagram ? errors.instagram : ''}
              placeholder="e.g., https://instagram.com/username"
            />

            <Input
              label="LinkedIn"
              name="linkedin"
              id="linkedin"
              value={values.linkedin}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.linkedin ? errors.linkedin : ''}
              placeholder="e.g., https://linkedin.com/in/username"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileForm;
