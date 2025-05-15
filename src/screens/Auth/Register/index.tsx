import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '../../../hooks/useForm';
import { useAuth } from '../../../context/AuthContext';
import { Input } from '../../../components/form/Input';
import { Button } from '../../../components/form/Button';
import { Alert } from '../../../components/feedback/Alert';
import {
  UserIcon,
  MapIcon,
  LockClosedIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { getPasswordStrength } from '../../../utils/validators';

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
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

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Initialize form
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = useForm<RegisterFormValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      if (!values.firstName) {
        errors.firstName = 'First name is required';
      }

      if (!values.lastName) {
        errors.lastName = 'Last name is required';
      }

      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Invalid email address';
      }

      // Username is optional
      if (values.username && values.username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      }

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
      setRegisterError(null);

      try {
        // Prepare registration data
        const { confirmPassword, ...registrationData } = values;

        await register(registrationData);
        navigate('/'); // Navigate to home or onboarding page
      } catch (error: any) {
        setRegisterError(
          error.response?.data?.message ||
            'Registration failed. Please try again.',
        );
      }
    },
  });

  // Calculate password strength
  const passwordStrength = values.password
    ? getPasswordStrength(values.password)
    : 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-accent hover:text-accent-dark"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Register error */}
      {registerError && (
        <Alert
          type="error"
          variant="subtle"
          dismissible
          onDismiss={() => setRegisterError(null)}
        >
          {registerError}
        </Alert>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            label="First name"
            type="text"
            name="firstName"
            id="firstName"
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.firstName ? errors.firstName : ''}
            leftAddon={<UserIcon className="h-5 w-5 text-gray-400" />}
            autoComplete="given-name"
            required
          />

          <Input
            label="Last name"
            type="text"
            name="lastName"
            id="lastName"
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.lastName ? errors.lastName : ''}
            leftAddon={<UserIcon className="h-5 w-5 text-gray-400" />}
            autoComplete="family-name"
            required
          />
        </div>

        <Input
          label="Email address"
          type="email"
          name="email"
          id="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email ? errors.email : ''}
          leftAddon={<MapIcon className="h-5 w-5 text-gray-400" />}
          autoComplete="email"
          required
        />

        <Input
          label="Username (optional)"
          type="text"
          name="username"
          id="username"
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.username ? errors.username : ''}
          leftAddon={<UserCircleIcon className="h-5 w-5 text-gray-400" />}
          autoComplete="username"
          helperText="Leave blank to generate from your email"
        />

        <div>
          <Input
            label="Password"
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
          label="Confirm password"
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

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="focus:ring-accent h-4 w-4 text-accent border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              I agree to the{' '}
              <Link to="/terms" className="text-accent hover:text-accent-dark">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="text-accent hover:text-accent-dark"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          isFullWidth
          variant="primary"
          size="lg"
        >
          Create account
        </Button>
      </form>
    </div>
  );
};

export default Register;
