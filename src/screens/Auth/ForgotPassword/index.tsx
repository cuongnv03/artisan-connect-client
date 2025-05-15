import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from '../../../hooks/useForm';
import { Input } from '../../../components/form/Input';
import { Button } from '../../../components/form/Button';
import { Alert } from '../../../components/feedback/Alert';
import { MapIcon } from '@heroicons/react/24/outline';
import { AuthService } from '../../../services/auth.service';

interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize form
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = useForm<ForgotPasswordFormValues>({
    initialValues: {
      email: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Invalid email address';
      }

      return errors;
    },
    onSubmit: async (values) => {
      setFormError(null);

      try {
        await AuthService.forgotPassword({ email: values.email });
        setIsSubmitted(true);
      } catch (error: any) {
        // For security reasons, don't show specific errors about email existence
        // Just show a generic success message even if the email doesn't exist
        setIsSubmitted(true);
      }
    },
  });

  // Success view after form submission
  if (isSubmitted) {
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
        <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
        <p className="text-gray-600">
          We've sent a password reset link to{' '}
          <span className="font-medium">{values.email}</span>. Please check your
          inbox and follow the instructions to reset your password.
        </p>
        <p className="text-sm text-gray-500">
          Didn't receive the email? Check your spam folder or{' '}
          <button
            type="button"
            className="text-accent hover:text-accent-dark"
            onClick={() => setIsSubmitted(false)}
          >
            try again
          </button>
        </p>
        <div className="mt-6">
          <Link to="/login">
            <Button variant="outline" isFullWidth>
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your
          password.
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

        <Button
          type="submit"
          isLoading={isSubmitting}
          isFullWidth
          variant="primary"
        >
          Send reset link
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

export default ForgotPassword;
