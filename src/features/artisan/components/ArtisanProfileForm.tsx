import React, { useState } from 'react';
import { useForm } from '../../../hooks/useForm';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/ui/Alert';
import { isValidUrl } from '../../../utils/validators';
import {
  ArtisanProfileWithUser,
  UpdateArtisanProfileDto,
} from '../../../types/artisan.types';

interface ArtisanProfileFormProps {
  profile: ArtisanProfileWithUser;
  onSave: (data: UpdateArtisanProfileDto) => void;
  onCancel: () => void;
}

const ArtisanProfileForm: React.FC<ArtisanProfileFormProps> = ({
  profile,
  onSave,
  onCancel,
}) => {
  const [specialtiesInput, setSpecialtiesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useForm({
    initialValues: {
      shopName: profile.shopName || '',
      shopDescription: profile.shopDescription || '',
      specialties: profile.specialties || [],
      experience: profile.experience?.toString() || '',
      website: profile.website || '',
      contactEmail: profile.contactEmail || '',
      contactPhone: profile.contactPhone || '',
      facebook: profile.socialMedia?.facebook || '',
      instagram: profile.socialMedia?.instagram || '',
      twitter: profile.socialMedia?.twitter || '',
      linkedin: profile.socialMedia?.linkedin || '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      if (!values.shopName) {
        errors.shopName = 'Shop name is required';
      }

      if (values.shopName.length < 3) {
        errors.shopName = 'Shop name must be at least 3 characters';
      }

      if (values.website && !isValidUrl(values.website)) {
        errors.website = 'Please enter a valid URL';
      }

      if (values.contactEmail && !/\S+@\S+\.\S+/.test(values.contactEmail)) {
        errors.contactEmail = 'Please enter a valid email address';
      }

      if (values.facebook && !isValidUrl(values.facebook)) {
        errors.facebook = 'Please enter a valid URL';
      }

      if (values.instagram && !isValidUrl(values.instagram)) {
        errors.instagram = 'Please enter a valid URL';
      }

      if (values.twitter && !isValidUrl(values.twitter)) {
        errors.twitter = 'Please enter a valid URL';
      }

      if (values.linkedin && !isValidUrl(values.linkedin)) {
        errors.linkedin = 'Please enter a valid URL';
      }

      if (values.specialties.length === 0) {
        errors.specialties = 'Please add at least one specialty';
      }

      return errors;
    },
    onSubmit: async (formValues) => {
      try {
        setIsSubmitting(true);
        setError(null);

        // Format social media links
        const socialMedia: Record<string, string> = {};
        if (formValues.facebook) socialMedia.facebook = formValues.facebook;
        if (formValues.instagram) socialMedia.instagram = formValues.instagram;
        if (formValues.twitter) socialMedia.twitter = formValues.twitter;
        if (formValues.linkedin) socialMedia.linkedin = formValues.linkedin;

        // Prepare update data
        const updateData: UpdateArtisanProfileDto = {
          shopName: formValues.shopName,
          shopDescription: formValues.shopDescription || null,
          specialties: formValues.specialties,
          experience: formValues.experience
            ? parseInt(formValues.experience)
            : null,
          website: formValues.website || null,
          contactEmail: formValues.contactEmail || null,
          contactPhone: formValues.contactPhone || null,
          socialMedia: Object.keys(socialMedia).length > 0 ? socialMedia : null,
        };

        // Call parent's onSave
        await onSave(updateData);
      } catch (err: any) {
        setError(err.message || 'Failed to update profile');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Add a specialty
  const addSpecialty = () => {
    if (specialtiesInput.trim()) {
      const newSpecialties = [...values.specialties, specialtiesInput.trim()];
      setFieldValue('specialties', newSpecialties);
      setSpecialtiesInput('');
    }
  };

  // Remove a specialty
  const removeSpecialty = (index: number) => {
    const newSpecialties = values.specialties.filter((_, i) => i !== index);
    setFieldValue('specialties', newSpecialties);
  };

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
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Shop Information
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Update your shop details to showcase your craft
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Shop Name"
            name="shopName"
            value={values.shopName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.shopName ? errors.shopName : ''}
            required
          />

          <div>
            <label
              htmlFor="shopDescription"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Shop Description
            </label>
            <textarea
              id="shopDescription"
              name="shopDescription"
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
              placeholder="Tell customers about your shop and what makes your crafts unique..."
              value={values.shopDescription}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialties
              {touched.specialties && errors.specialties && (
                <span className="text-red-600 ml-2 text-xs">
                  {errors.specialties}
                </span>
              )}
            </label>
            <div className="flex space-x-2">
              <Input
                value={specialtiesInput}
                onChange={(e) => setSpecialtiesInput(e.target.value)}
                placeholder="Add a specialty (e.g., Ceramics, Wood carving)"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSpecialty}
                disabled={!specialtiesInput.trim()}
              >
                Add
              </Button>
            </div>

            {values.specialties.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {values.specialties.map((specialty, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center bg-gray-100 rounded-full py-1 pl-3 pr-1 text-sm"
                  >
                    {specialty}
                    <button
                      type="button"
                      className="ml-1 rounded-full p-1 hover:bg-gray-200"
                      onClick={() => removeSpecialty(index)}
                    >
                      <svg
                        className="h-4 w-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            label="Years of Experience"
            name="experience"
            type="number"
            min="0"
            value={values.experience}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.experience ? errors.experience : ''}
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900">
            Contact Information
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            How customers can reach you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Contact Email"
            name="contactEmail"
            type="email"
            value={values.contactEmail}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.contactEmail ? errors.contactEmail : ''}
            helperText={`Defaults to your account email: ${profile.user.email}`}
          />

          <Input
            label="Contact Phone"
            name="contactPhone"
            value={values.contactPhone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.contactPhone ? errors.contactPhone : ''}
          />

          <Input
            label="Website"
            name="website"
            value={values.website}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.website ? errors.website : ''}
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900">Social Media</h2>
          <p className="text-sm text-gray-500 mt-1">
            Connect your social media profiles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Facebook"
            name="facebook"
            value={values.facebook}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.facebook ? errors.facebook : ''}
            placeholder="https://facebook.com/yourpage"
          />

          <Input
            label="Instagram"
            name="instagram"
            value={values.instagram}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.instagram ? errors.instagram : ''}
            placeholder="https://instagram.com/yourusername"
          />

          <Input
            label="Twitter"
            name="twitter"
            value={values.twitter}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.twitter ? errors.twitter : ''}
            placeholder="https://twitter.com/yourusername"
          />

          <Input
            label="LinkedIn"
            name="linkedin"
            value={values.linkedin}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.linkedin ? errors.linkedin : ''}
            placeholder="https://linkedin.com/in/yourusername"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={Object.keys(errors).length > 0}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ArtisanProfileForm;
