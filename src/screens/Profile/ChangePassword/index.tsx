import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../../hooks/useForm';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/form/Input';
import { Button } from '../../../components/form/Button';
import { Alert } from '../../../components/feedback/Alert';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { AuthService } from '../../../services/auth.service';
import { getPasswordStrength } from '../../../utils/validators';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      if (!values.currentPassword) {
        errors.currentPassword = 'Current password is required';
      }

      if (!values.newPassword) {
        errors.newPassword = 'New password is required';
      } else if (values.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters';
      } else if (
        !/[A-Za-z]/.test(values.newPassword) ||
        !/\d/.test(values.newPassword)
      ) {
        errors.newPassword = 'Password must include both letters and numbers';
      }

      if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (values.newPassword !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        setFormError(null);
        await AuthService.changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        setSuccessMessage(
          'Password changed successfully. Redirecting to profile...',
        );
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } catch (error: any) {
        setFormError(
          error.response?.data?.message ||
            'Failed to change password. Please try again.',
        );
      }
    },
  });

  // Calculate password strength
  const passwordStrength = values.newPassword
    ? getPasswordStrength(values.newPassword)
    : 0;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Change Password
      </h1>

      <Card>
        {formError && (
          <Alert
            type="error"
            variant="subtle"
            dismissible
            onDismiss={() => setFormError(null)}
            className="mb-6"
          >
            {formError}
          </Alert>
        )}

        {successMessage && (
          <Alert type="success" variant="subtle" className="mb-6">
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Current Password"
            type={showCurrentPassword ? 'text' : 'password'}
            name="currentPassword"
            id="currentPassword"
            value={values.currentPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.currentPassword ? errors.currentPassword : ''}
            leftAddon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
            rightAddon={
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="text-gray-400 hover:text-gray-500"
              >
                {showCurrentPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            }
            autoComplete="current-password"
            required
          />

          <Input
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            name="newPassword"
            id="newPassword"
            value={values.newPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.newPassword ? errors.newPassword : ''}
            leftAddon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
            rightAddon={
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="text-gray-400 hover:text-gray-500"
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            }
            autoComplete="new-password"
            required
            helperText="Must be at least 8 characters with letters and numbers"
          />

          {values.newPassword && (
            <PasswordStrengthMeter strength={passwordStrength} />
          )}

          <Input
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            id="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.confirmPassword ? errors.confirmPassword : ''}
            leftAddon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
            rightAddon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-500"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            }
            autoComplete="new-password"
            required
          />

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/profile')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={Object.keys(errors).length > 0 || isSubmitting}
            >
              Change Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Password Strength Meter component
const PasswordStrengthMeter: React.FC<{ strength: number }> = ({
  strength,
}) => {
  const getColorClass = (index: number) => {
    if (index <= strength) {
      switch (strength) {
        case 0:
          return 'bg-red-500';
        case 1:
          return 'bg-orange-500';
        case 2:
          return 'bg-yellow-500';
        case 3:
          return 'bg-green-500';
        case 4:
          return 'bg-green-600';
        default:
          return 'bg-gray-200';
      }
    }
    return 'bg-gray-200';
  };

  const getLabel = () => {
    switch (strength) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Medium';
      case 3:
        return 'Strong';
      case 4:
        return 'Very Strong';
      default:
        return '';
    }
  };

  return (
    <div className="mt-1">
      <div className="flex space-x-1 mb-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`h-2 w-full rounded-sm ${getColorClass(index)}`}
          />
        ))}
      </div>
      <p
        className={`text-xs ${
          strength <= 1
            ? 'text-red-600'
            : strength === 2
            ? 'text-yellow-600'
            : 'text-green-600'
        }`}
      >
        {getLabel()}
      </p>
    </div>
  );
};

export default ChangePassword;
