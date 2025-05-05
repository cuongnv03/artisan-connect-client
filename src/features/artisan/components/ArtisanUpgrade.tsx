import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../../hooks/useForm';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/ui/Alert';
import { Loader } from '../../../components/ui/Loader';
import { ArtisanService } from '../../../services/artisan.service';
import { isValidUrl } from '../../../utils/validators';

const ArtisanUpgrade: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<any>(null);
  const [specialtiesInput, setSpecialtiesInput] = useState('');

  useEffect(() => {
    // Check if user already has a pending request
    const checkRequestStatus = async () => {
      try {
        setIsLoading(true);
        const status = await ArtisanService.getUpgradeRequestStatus();
        setRequestStatus(status);
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Failed to check upgrade status',
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkRequestStatus();
  }, []);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    isSubmitting,
  } = useForm({
    initialValues: {
      shopName: '',
      shopDescription: '',
      specialties: [] as string[],
      experience: '',
      website: '',
      facebook: '',
      instagram: '',
      twitter: '',
      reason: '',
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

      if (values.facebook && !isValidUrl(values.facebook)) {
        errors.facebook = 'Please enter a valid URL';
      }

      if (values.instagram && !isValidUrl(values.instagram)) {
        errors.instagram = 'Please enter a valid URL';
      }

      if (values.twitter && !isValidUrl(values.twitter)) {
        errors.twitter = 'Please enter a valid URL';
      }

      if (!values.reason) {
        errors.reason = 'Please share your reason for becoming an artisan';
      }

      if (values.specialties.length === 0) {
        errors.specialties = 'Please add at least one specialty';
      }

      return errors;
    },
    onSubmit: async (formValues) => {
      try {
        // Format social media links
        const socialMedia: Record<string, string> = {};
        if (formValues.facebook) socialMedia.facebook = formValues.facebook;
        if (formValues.instagram) socialMedia.instagram = formValues.instagram;
        if (formValues.twitter) socialMedia.twitter = formValues.twitter;

        // Prepare request data
        const requestData = {
          shopName: formValues.shopName,
          shopDescription: formValues.shopDescription,
          specialties: formValues.specialties,
          experience: formValues.experience
            ? parseInt(formValues.experience)
            : undefined,
          website: formValues.website,
          socialMedia:
            Object.keys(socialMedia).length > 0 ? socialMedia : undefined,
          reason: formValues.reason,
        };

        // Submit upgrade request
        await ArtisanService.requestUpgrade(requestData);

        // Refresh request status
        const status = await ArtisanService.getUpgradeRequestStatus();
        setRequestStatus(status);

        // Show success message
        window.scrollTo(0, 0);
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Failed to submit upgrade request',
        );
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

  if (isLoading) {
    return <Loader size="lg" text="Checking your artisan status..." />;
  }

  // If the user already has a pending request
  if (requestStatus?.hasRequest && requestStatus?.status === 'PENDING') {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Become an Artisan
        </h1>

        <Card>
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100">
              <svg
                className="h-8 w-8 text-amber-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              Your Artisan Request is Pending
            </h2>
            <p className="mt-2 text-gray-500">
              Thank you for your interest in becoming an artisan! Your request
              is currently under review. We'll notify you once it's approved.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Request date:{' '}
              {new Date(requestStatus.createdAt).toLocaleDateString()}
            </p>

            <div className="mt-8 flex justify-center">
              <Button variant="outline" as="a" href="/">
                Return to Home
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // If the user's request was rejected
  if (requestStatus?.hasRequest && requestStatus?.status === 'REJECTED') {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Become an Artisan
        </h1>

        <Card>
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              Your Artisan Request was Declined
            </h2>
            <p className="mt-2 text-gray-500">
              Unfortunately, your request to become an artisan was not approved
              at this time.
            </p>

            {requestStatus.adminNotes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg mx-auto max-w-md">
                <p className="text-sm font-medium text-gray-700">
                  Feedback from our team:
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {requestStatus.adminNotes}
                </p>
              </div>
            )}

            <div className="mt-8 flex justify-center space-x-4">
              <Button variant="outline" as="a" href="/">
                Return to Home
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  setRequestStatus({ ...requestStatus, status: null })
                }
              >
                Submit New Request
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Display the upgrade request form
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-0">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Become an Artisan
      </h1>
      <p className="text-gray-600 mb-6">
        Join our community of skilled artisans and share your craft with the
        world
      </p>

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

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Shop Information
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Tell us about your artisan shop and craft
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
              helperText="This will be the name displayed to customers"
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
                placeholder="Tell us about your shop and what makes your crafts unique..."
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
              helperText="How many years have you been practicing your craft?"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900">Web Presence</h2>
            <p className="text-sm text-gray-500 mt-1">
              Help customers find you online (optional)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Website"
              name="website"
              value={values.website}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.website ? errors.website : ''}
              placeholder="https://yourwebsite.com"
            />

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
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900">Application</h2>
            <p className="text-sm text-gray-500 mt-1">
              Tell us why you want to join as an artisan
            </p>
          </div>

          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Why do you want to become an artisan?
              {touched.reason && errors.reason && (
                <span className="text-red-600 ml-2 text-xs">
                  {errors.reason}
                </span>
              )}
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
              placeholder="Share your story and why you want to join our community..."
              value={values.reason}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={Object.keys(errors).length > 0}
            >
              Submit Application
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ArtisanUpgrade;
