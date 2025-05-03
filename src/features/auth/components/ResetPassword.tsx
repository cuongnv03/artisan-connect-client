import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from '../../../hooks/useForm';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/ui/Alert';
import { Loader } from '../../../components/ui/Loader';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { getPasswordStrength } from '../../../utils/validators';
import { AuthService } from '../../../services/auth.service';

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

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

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Get token from URL
  const token = searchParams.get('token');

  // Check if token is valid
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      return;
    }

    // In a real app, we might validate the token with the server here
    // For now, just assume it's valid if it exists
    setIsTokenValid(true);
  }, [token]);

  // Initialize form
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = useForm<ResetPasswordFormValues>({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (
        !/[A-Za-z]/.test(values.password) ||
        !/\d/.test(values.password)
      ) {
        errors.password = 'Password must include letters and numbers';
      }

      if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      return errors;
    },
    onSubmit: async (values) => {
      if (!token) return;

      setFormError(null);

      try {
        await AuthService.resetPassword({
          token,
          newPassword: values.password,
        });

        setResetSuccess(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setFormError(
          error.response?.data?.message ||
            'Password reset failed. Please try again.',
        );
      }
    },
  });

  // Calculate password strength
  const passwordStrength = values.password
    ? getPasswordStrength(values.password)
    : 0;

  // Show loader while checking token
  if (isTokenValid === null) {
    return <Loader size="lg" text="Validating your reset link..." />;
  }

  // Show error if token is invalid
  if (isTokenValid === false) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
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
        <h3 className="text-lg font-medium text-gray-900">
          Invalid or expired link
        </h3>
        <p className="text-gray-600">
          This password reset link is invalid or has expired. Please request a
          new link to reset your password.
        </p>
        <div className="mt-6">
          <Link to="/forgot-password">
            <Button variant="primary" isFullWidth>
              Request new reset link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show success message after password reset
  if (resetSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          Password reset successful
        </h3>
        <p className="text-gray-600">
          Your password has been reset successfully. You will be redirected to
          the login page shortly.
        </p>
        <div className="mt-6">
          <Link to="/login">
            <Button variant="primary" isFullWidth>
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show the reset password form
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter a new password for your account
        </p>
      </div>

      {formError && (
        <Alert
          type="error"
          variant="subtle"
          dismissible
          onDismiss={() => setFormError(null)}
        >
          {formError}
        </Alert>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <Input
            label="New password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            id="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ''}
            leftAddon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
            rightAddon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-500"
              >
                {showPassword ? (
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

          {values.password && (
            <PasswordStrengthMeter strength={passwordStrength} />
          )}
        </div>

        <Input
          label="Confirm new password"
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

        <Button
          type="submit"
          isLoading={isSubmitting}
          isFullWidth
          variant="primary"
        >
          Reset password
        </Button>
      </form>

      <div className="text-sm text-center">
        <Link
          to="/login"
          className="font-medium text-accent hover:text-accent-dark"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
